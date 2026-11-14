"""Build the blog's chart data from the ExeaLM result files.

Every number on a chart comes from here, never typed by hand. Run after new results land:

    python3 scripts/sync_data.py --exealm ../ExeaLM

Writes data/*.json (committed, so a Vercel build needs no access to the ExeaLM checkout).
"""
import argparse
import glob
import json
import os
import re
import subprocess
from datetime import datetime

DOMS = ("en", "ja_wiki", "ja_web", "code")
OUT = os.path.join(os.path.dirname(__file__), "..", "data")


def load(p):
    with open(p) as f:
        return json.load(f)


def lm_rows(res):
    rows = []
    for d in ("arch", "arch2", "sweep"):
        for f in sorted(glob.glob(os.path.join(res, d, "lm_compare*.json"))):
            j = load(f)
            for r in j["rows"]:
                r = dict(r)
                r.setdefault("tag", d)
                r.setdefault("cfg", "{}")
                if r.get("model") == "llama" and j["args"].get("llama_cfg", "{}") != "{}":
                    r["cfg"] = j["args"]["llama_cfg"]          # a Llama's own options (DeltaNet layers, gate, QK-norm)
                r.setdefault("lr", j["args"].get("lr", 2e-3))
                r["source"] = f"results/{d}/{os.path.basename(f)}"
                r["size"] = j["args"].get("size", "")
                r["mean"] = round(sum(r["bits_per_byte"][k] for k in DOMS) / 4, 4)
                rows.append(r)
    return rows


def avg(rows):
    if not rows:
        return None
    out = {k: round(sum(r["bits_per_byte"][k] for r in rows) / len(rows), 4) for k in DOMS}
    out["mean"] = round(sum(out[k] for k in DOMS) / 4, 4)
    out["steps"] = round(sum(r.get("steps", 3000) for r in rows) / len(rows))
    out["secs"] = round(sum(r.get("secs", 0) for r in rows) / len(rows))
    out["seeds"] = sorted({r["seed"] for r in rows})
    out["params_M"] = rows[0].get("params_M")
    out["sources"] = sorted({r["source"] for r in rows})
    return out


def pick(rows, tag, model=None, lr=None):
    return [r for r in rows if r["tag"] == tag and (model is None or r["model"] == model)
            and (lr is None or abs(r["lr"] - lr) < 1e-9)]


def leaderboard(rows):
    base = [r for r in rows if r["model"] == "llama" and abs(r["lr"] - 2e-3) < 1e-9 and r["tag"] in ("arch",)]
    ref = sum(r["mean"] for r in base) / len(base)
    keep = []
    for r in sorted(rows, key=lambda r: r["mean"]):
        cfg = json.loads(r["cfg"]) if r["cfg"] else {}
        keep.append(dict(tag=r["tag"], model=r["model"], cfg=cfg, lr=r["lr"], seed=r["seed"],
                         params_M=r.get("params_M"), steps=r.get("steps"), secs=r.get("secs"),
                         budget=r.get("seconds_budget"), bpb={k: r["bits_per_byte"][k] for k in DOMS},
                         mean=r["mean"], source=r["source"], size=r["size"]))
    return dict(reference_llama_13M=round(ref, 4), rows=keep)


def LLAMA_90M(rows):
    """The 0.1B Llama at 3,000 s: seed 0, and seed 1 as rerun at normal speed (the first seed-1 run was on a slowed Mac)."""
    return avg(pick(rows, "eqt_100m_llama") + pick(rows, "eqt_100m_llama_s1_rerun"))


def comparisons(rows):
    """Hybrid vs a same-size Llama, at equal steps and at equal training time, by model size."""
    L = lambda tag, model=None, lr=None: avg(pick(rows, tag, model, lr))
    eq_steps = [
        dict(size="13M", hybrid=L("hyb135_conv"), llama=avg(pick(rows, "arch", "llama")), note="3,000 steps, 2 seeds"),
        dict(size="27M", hybrid=L("mid_hybrid"), llama=L("mid_llama_lr1e3"), note="3,000 steps, each at its best learning rate, 2 seeds"),
        dict(size="48M", hybrid=L("big_hybrid_3k"), llama=L("big_llama_3k"), note="3,000 steps, seed 0"),
    ]
    eq_time = [
        dict(size="13M", budget=600, hybrid=L("eqt_small_hybrid"), llama=L("eqt_small_llama"), note="600 s, 2 seeds"),
        dict(size="27M", budget=1000, hybrid=L("eqt_mid_hybrid"), llama=L("eqt_mid_llama"), note="1,000 s, 2 seeds"),
        dict(size="48M", budget=2000, hybrid=avg(pick(rows, "eqt_big_attn6") + pick(rows, "eqt_big_attn6_s1")),
             llama=avg(pick(rows, "eqt_big_llama") + pick(rows, "eqt_big_llama_s1")), note="2,000 s, 2 seeds, 6 attention + 4 TONN"),
        dict(size="90M", budget=3000, hybrid=avg(pick(rows, "eqt_100m_hybrid_lr1e3") + pick(rows, "eqt_100m_hybrid_lr1e3_s1")),
             llama=LLAMA_90M(rows), note="3,000 s, the 0.1B design, both at lr 1e-3, 2 seeds"),
    ]
    big_first = dict(size="48M", budget=2000, hybrid=L("eqt_big_hybrid"), llama=L("eqt_big_llama"),
                     note="2,000 s, seed 0, first try: 5 attention + 5 TONN at lr 2e-3")
    lr_90m = dict(size="90M", budget=3000, hybrid=avg(pick(rows, "eqt_100m_hybrid") + pick(rows, "eqt_100m_hybrid_s1_rerun")),
                  llama=LLAMA_90M(rows), note="3,000 s, hybrid at lr 1.5e-3, Llama at 1e-3, 2 seeds")
    return dict(equal_steps=[c for c in eq_steps if c["hybrid"] and c["llama"]],
                equal_time=[c for c in eq_time if c["hybrid"] and c["llama"]], first_48M=big_first, alt_90M=lr_90m)


def curves(rows):
    """Training loss against wall-clock seconds for the 0.1B equal-compute pair (and any seed-1 runs)."""
    out = []
    for tag in ("eqt_100m_hybrid_lr1e3", "eqt_100m_hybrid", "eqt_100m_llama", "eqt_100m_hybrid_lr1e3_s1", "eqt_100m_hybrid_s1_rerun", "eqt_100m_llama_s1_rerun", "eqt_big_attn6", "eqt_big_llama"):
        for r in pick(rows, tag):
            tl = r.get("train_loss_every_250") or []
            spp = r["secs"] / r["steps"]
            out.append(dict(tag=tag, model=r["model"], seed=r["seed"], params_M=r.get("params_M"),
                            points=[dict(step=250 * (i + 1), secs=round(250 * (i + 1) * spp, 1), loss=v) for i, v in enumerate(tl)]))
    return out


def speed(res):
    out = {}
    for name, d in (("pure_tonn", "speed"), ("hybrid_1to1", "speed_hybrid"), ("hybrid_2to1", "speed_hybrid21")):
        p = os.path.join(res, d, "speed_mps.json")
        if os.path.exists(p):
            j = load(p)
            out[name] = dict(rows=j["rows"], refresh_secs=j.get("datastore_refresh_secs"), source=f"results/{d}/speed_mps.json")
    out["circuits_ms"] = dict(source="docs/ideas.md (experiments/profile_circuits.py, width 256, one layer forward and backward)",
                              attention=18, before=dict(GI=127, SM=145), after=dict(GI=25, SM=45))
    return out


def relay(res):
    runs = []
    for f in sorted(glob.glob(os.path.join(res, "swarm_relay", "relay*.json"))):
        j = load(f)
        a = j["args"]
        for r in j["runs"]:
            runs.append(dict(file=os.path.basename(f), seed=a["seed"], facts=a["facts"], agents=a.get("agents", 2), arm=r["arm"],
                             shared=r["final"]["shared"]["acc"], cut=r["final"]["cut"]["acc"],
                             curve=[dict(step=c["step"], shared=c["shared"]["acc"], cut=c["cut"]["acc"]) for c in r["curve"]]))
    return dict(chance=1 / 64, runs=runs)


def lookup(res):
    out = []
    for f in sorted(glob.glob(os.path.join(res, "rag_lookup", "lookup*.json"))):
        j = load(f)
        a = j["args"]
        if "restate" not in a:          # the first design, which never learned (results/README.md section 3)
            continue
        for r in j["runs"]:
            out.append(dict(file=os.path.basename(f), facts=a["facts"], restate=a["restate"], arm=r["arm"],
                            attached=r["final"]["attached"]["acc"], removed=r["final"]["removed"]["acc"],
                            curve=[dict(step=c["step"], kb=c.get("kb"), attached=c["attached"]["acc"], removed=c["removed"]["acc"]) for c in r["curve"]]))
    return out


def swarm_text(res):
    out = []
    for d, kind in (("swarm_text", "pure TONN"), ("swarm_text/ctrl_split_solo", "pure TONN"), ("swarm_text_hybrid", "hybrid")):
        for f in sorted(glob.glob(os.path.join(res, d, "text_seed*.json"))):
            j = load(f)
            for r in j["runs"]:
                fin = r["final"]
                out.append(dict(kind=kind, seed=j["args"]["seed"], arm=r["arm"], shared=fin["shared"]["bpb"], cut=fin["cut"]["bpb"],
                                shared_per_agent=fin["shared"].get("per_agent"), cut_per_agent=fin["cut"].get("per_agent")))
    return out


FULL_SMALL = {  # result file tag -> recipe name (24,000-step runs only; the short checks live in the README)
    "exealm": "first", "llama": "llama_first", "exealm_skills": "relay_first", "exealm_skillsA": "together",
    "llama_skills": "llama", "llama_skills_eqc": "llama_same_time", "llama_textonly": "llama_text_only",
    "exealm_skillsA_gate": "together_gated", "exealm_skillsA_search": "together_search",
}


QWEN = [  # (key, run tags at equal steps, run tag at equal time): results/sweep, 13M, results/README.md section 12
    ("llama", ["q_llama"], "eqt_q_llama"),
    ("llama_gate", ["q_llama_gate"], "eqt_q_llama_gate"),
    ("qwen35", ["q_qwen35", "q_qwen35_s1"], "eqt_q_qwen35"),
    ("hybrid", ["q_hybrid"], None),
    ("hybrid_gate", ["q_hybrid_gate", "q_hybrid_gate_s1"], "eqt_q_hybrid_gate"),
    ("hybrid_gate_delta", ["q_hybrid_delta"], None),
]


def qwen(rows):
    """Parts from Qwen3.5 at 13M: every model at equal steps (3,000) and at equal time (600 s), seed by seed."""
    one = lambda r: dict(seed=r["seed"], steps=r["steps"], secs=r["secs"], params_M=r.get("params_M"), mean=r["mean"],
                         source=r["source"], **{d: r["bits_per_byte"][d] for d in DOMS})
    out = []
    for key, steps_tags, time_tag in QWEN:
        st = sorted((r for t in steps_tags for r in pick(rows, t)), key=lambda r: r["seed"])
        tm = pick(rows, time_tag) if time_tag else []
        out.append(dict(key=key, equal_steps=[one(r) for r in st], equal_time=[one(r) for r in tm]))
    return dict(budget_s=600, steps=3000, models=out)


def full_small(res):
    """The 17M full model (experiments/full_small.py): skill and language curves for every 24,000-step run."""
    runs = []
    for f in sorted(glob.glob(os.path.join(res, "full_small", "full_small_*_seed*.json"))):
        m = re.match(r"full_small_(.+)_seed(\d+)\.json", os.path.basename(f))
        if not m or m.group(1) not in FULL_SMALL:
            continue
        j = load(f)
        curve = []
        for c in j["curve"]:
            row = dict(step=c["step"], secs=c["secs"], **{d: c[f"val_{d}"]["removed"] for d in DOMS})
            if "relay" in c:
                row.update(relay_shared=c["relay"]["shared"], relay_cut=c["relay"]["cut"])
            if "lookup" in c:
                row.update(lookup_attached=c["lookup"].get("attached"), lookup_removed=c["lookup"]["removed"])
            curve.append(row)
        runs.append(dict(recipe=FULL_SMALL[m.group(1)], model=j["model"], seed=int(m.group(2)), params=j["params"],
                         steps=j["args"]["steps"], source=f"results/full_small/{os.path.basename(f)}", curve=curve))
    return dict(chance=1 / 64, runs=runs)


def rag_wiki(res):
    out = []
    for f in sorted(glob.glob(os.path.join(res, "rag_wiki_split", "*.json"))):
        j = load(f)
        a = j["args"]
        for r in j["runs"]:
            out.append(dict(file=os.path.basename(f), tag=a.get("tag", ""), seed=a["seed"], arm=r["arm"], oracle=a.get("oracle", 0),
                            neighbour=a.get("neighbour", 0), key_dim=a.get("key_dim", 0), lexical=a.get("lexical", 0),
                            final=r["final"], curve=r["curve"]))
    return out


def tokenizer(res):
    return dict(compare=load(os.path.join(res, "tokenizer", "compare.json"))["rows"],
                lm=load(os.path.join(res, "tokenizer", "lm_seed0.json"))["rows"])


GROUPS = [  # (name regex, the question the run answered), first match wins
    (r"^hyb135_conv|^hconv_(mem|search)", "Convolution-heavy start"),
    (r"^hyb135|^rp4", "Hybrid layers, random start"),
    (r"^hconv_(024|25|attn4)", "Layouts"),
    (r"^(llama_lr|llama_6k|hconv_6k)", "Learning rates, longer runs"),
    (r"^(mid_|big_)", "Bigger models, equal steps"),
    (r"^eqt_", "Equal compute"),
    (r"^(rag|swarm|text)", "Retrieval and swarms"),
    (r"^speed", "Speed"),
]


def timeline(raw):
    p = os.path.join(raw, "runner_times.txt")
    if not os.path.exists(p):
        return []
    starts, out = {}, []
    for line in open(p):
        m = re.match(r"(\S+ \S+) (START|END) (\S+)", line.strip())
        if not m:
            continue
        t, kind, name = datetime.strptime(m.group(1), "%Y-%m-%d %H:%M:%S"), m.group(2), m.group(3)
        if kind == "START":
            starts[name] = t
        elif name in starts:
            g = next((q for rx, q in GROUPS if re.search(rx, name)), "other")
            out.append(dict(name=name, start=starts.pop(name).isoformat(), end=t.isoformat(), group=g))
    for name, t in starts.items():
        out.append(dict(name=name, start=t.isoformat(), end=None, group=next((q for rx, q in GROUPS if re.search(rx, name)), "other")))
    return sorted(out, key=lambda r: r["start"])


def contributors(repo):
    """Contributors with commit counts from GitHub (needs the gh CLI); keeps the old file if gh is unavailable."""
    try:
        txt = subprocess.run(["gh", "api", f"repos/{repo}/contributors", "--paginate"], capture_output=True, text=True, timeout=30, check=True).stdout
        rows = json.loads(txt)
        return [dict(login=r["login"], avatar=r["avatar_url"], url=r["html_url"], commits=r["contributions"])
                for r in rows if r.get("type") == "User"]
    except Exception as e:  # noqa: BLE001
        print("contributors: kept the existing file:", e)
        return None


def team(org):
    """Public members of the GitHub organization (private memberships stay private)."""
    try:
        logins = json.loads(subprocess.run(["gh", "api", f"orgs/{org}/public_members"], capture_output=True, text=True, timeout=30, check=True).stdout)
        out = []
        for m in logins:
            u = json.loads(subprocess.run(["gh", "api", f"users/{m['login']}"], capture_output=True, text=True, timeout=30, check=True).stdout)
            out.append(dict(login=u["login"], name=u.get("name"), avatar=u["avatar_url"], url=u["html_url"]))
        return out
    except Exception as e:  # noqa: BLE001
        print("team: kept the existing file:", e)
        return None


IRL = [  # (key, result file): the real-text memory test (experiments/irl_eval.py), results/README.md section 13
    ("start", "full_small/irl_exealm_skillsA_seed0.json"),
    ("control", "irl/irl_exealm_ft_ctrl_seed0.json"),
    ("practice", "irl/irl_exealm_ft_irl_seed0.json"),
    ("practice_bm25", "irl/irl_exealm_ft_lex_seed0.json"),
    ("practice_null", "irl/irl_exealm_ft_null_seed0.json"),
    ("wide_2k", "irl/irl_exealm_ft_wide_seed0.json"),
    ("wide_8k", "irl/irl_exealm_ft_wide_long_seed0.json"),
]
IRL_PATHS = ("library", "library, perfect search", "board, live (swarm of 2)", "notes, own article", "notes, all articles")


def irl(res):
    """Gain in bits per re-mention against no memory, per fine-tune and memory path, plus the ordinary baselines."""
    rows = []
    for key, f in IRL:
        fp = os.path.join(res, f)
        if not os.path.exists(fp):
            continue
        r = load(fp)["results"]
        none = r["none"]["re-mention"]
        gain = {k: round(none - r[k]["re-mention"], 4) for k in IRL_PATHS if k in r}
        four = {k: r[k].get("re-mention 4-choice") for k in ("none", *IRL_PATHS) if k in r}
        base = {}
        if "in context (first 256)" in r:
            base["in_context_first256"] = round(r["none (first 256)"]["re-mention"] - r["in context (first 256)"]["re-mention"], 4)
        if "BM25 top-4 in context (64-255)" in r:
            base["bm25_rag_64_255"] = round(r["none (64-255)"]["re-mention"] - r["BM25 top-4 in context (64-255)"]["re-mention"], 4)
        rows.append(dict(key=key, none=round(none, 4), gain=gain, four_choice=four, baselines=base, source=f"results/{f}"))
    return rows


SWARM_RERUNS = [  # (model, seam targets, swarm dir, control dir): results/README.md section 2
    ("pure TONN", "kept", "swarm_text", "swarm_text/ctrl_split_solo"),
    ("pure TONN", "hidden", "swarm_text_fix", "swarm_text_fix"),
    ("hybrid", "kept", "swarm_text_hybrid", "swarm_text_hybrid"),
    ("hybrid", "hidden", "swarm_text_hybrid_fix", "swarm_text_hybrid_fix"),
    ("hybrid", "kept, rerun", "swarm_text_hybrid_nomask", "swarm_text_hybrid_nomask"),
]


def swarm_reruns(res):
    """Swarm (board shared) minus the matched control, per setting and seed; and the repeats of identical setups."""
    out = []
    for model, seam, sd, cd in SWARM_RERUNS:
        for f in sorted(glob.glob(os.path.join(res, sd, "text_seed*.json"))):
            seed = load(f)["args"]["seed"]
            sw = {r["arm"]: r["final"] for r in load(f)["runs"]}.get("split")
            cf = os.path.join(res, cd, os.path.basename(f))
            ct = {r["arm"]: r["final"] for r in load(cf)["runs"]}.get("split_solo") if os.path.exists(cf) else None
            if sw and ct:
                out.append(dict(model=model, seam=seam, seed=seed, swarm=sw["shared"]["bpb"], control=ct["cut"]["bpb"],
                                diff=round(sw["shared"]["bpb"] - ct["cut"]["bpb"], 4), source=f"results/{sd}/{os.path.basename(f)}"))
    rep = load(os.path.join(res, "swarm_text_hybrid_fix_repeat", "text_seed0.json"))["runs"][0]["final"]["shared"]["bpb"]
    first = next(r["swarm"] for r in out if r["model"] == "hybrid" and r["seam"] == "hidden" and r["seed"] == 0)
    ctrl = {(r["seam"], r["seed"]): r["control"] for r in out if r["model"] == "hybrid"}
    repeats = [dict(what="hybrid swarm, seams hidden, seed 0", a=first, b=rep),
               dict(what="hybrid control, seams kept, seed 0", a=ctrl[("kept", 0)], b=ctrl[("kept, rerun", 0)]),
               dict(what="hybrid control, seams kept, seed 1", a=ctrl[("kept", 1)], b=ctrl[("kept, rerun", 1)])]
    return dict(rows=out, repeats=repeats, noise=round(max(abs(r["a"] - r["b"]) for r in repeats), 4))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--exealm", default=os.path.join(os.path.dirname(__file__), "..", "..", "ExeaLM"))
    a = ap.parse_args()
    res = os.path.join(a.exealm, "results")
    os.makedirs(OUT, exist_ok=True)
    rows = lm_rows(res)
    files = dict(leaderboard=leaderboard(rows), comparisons=comparisons(rows), curves=curves(rows), speed=speed(res),
                 relay=relay(res), lookup=lookup(res), swarm_text=swarm_text(res), rag_wiki=rag_wiki(res), full_small=full_small(res), qwen=qwen(rows), irl=irl(res), swarm_reruns=swarm_reruns(res),
                 tokenizer=tokenizer(res), timeline=timeline(os.path.join(OUT, "raw")))
    c = contributors("exea-labs/ExeaLM")
    if c is not None:
        files["contributors"] = c
    tm = team("exea-labs")
    if tm is not None:
        files["team"] = tm
    for k, v in files.items():
        with open(os.path.join(OUT, f"{k}.json"), "w") as f:
            json.dump(v, f, indent=1, ensure_ascii=False)
        print("wrote", k)


if __name__ == "__main__":
    main()
