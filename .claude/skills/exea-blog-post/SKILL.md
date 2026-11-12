---
name: exea-blog-post
description: Use when writing, editing or reviewing a post for the Exea Labs Blog (blog.exealabs.org), the daily research notes on ExeaLM and other Exea Labs projects, in English and Japanese. Covers the voice (Avneh's AAAI paper style), the no-AI-slop rules, what makes a technical post worth reading, numbers and honesty, crediting contributors, the MDX format and figure components, the Japanese version, and the review loop before anything is published.
---

# Writing an Exea Labs Blog post

A post is a lab notebook entry that a stranger can read. It says what we tried, what the numbers say, what broke and
what comes next, with every number traceable to a file or a commit. It should read like a careful person wrote it on
the day, because one did.

Three readers, in this order:
1. **A contributor deciding what to work on.** A high schooler or student who knows some Python and ML. They need the
   setup, the result and the open problem, with links to the code.
2. **A technical reader judging the work.** A researcher who will check the seeds, the baselines and the caveats.
3. **A funder following progress.** They read the title, the summary and the key numbers, and stop there.

Write the title, summary and key numbers for reader 3, and everything else for readers 1 and 2.

## 1. Before writing: the fact sheet

Collect these before drafting a sentence, in a scratch file:

- **Every number** you will use, with the file it comes from (`results/...json`, `results/README.md` section, commit
  hash). Copy, never retype from memory. Round once, consistently: bits per byte to 3 decimals, accuracy to 1.
- **Seeds and scale** for each number: model size, steps or seconds, number of seeds, hardware.
- **The baseline and the control** for each claim. A gain with no control is not a result.
- **What went wrong** that day: bugs, dead ends, results that did not hold. These go in.
- **Who did what**: commits and merged PRs in the window the post covers (`git log --since ... --format='%an %s'`,
  `gh pr list --state merged --search "merged:YYYY-MM-DD"`). One line per person, specific: what they built and what
  it lets us do.
- **What is not shown yet.** Every post has a limit; name it.

If a number has no source, it does not go in the post. If a claim rests on one seed, the sentence says so.

## 2. Structure

Most posts follow this shape. Change it when the story needs it, not for variety.

1. **Title.** The finding, in plain words, as a sentence or a fragment that would make sense in a list of posts.
   "Pure TONN lost to Llama. The hybrid wins." Never a teaser ("What we learned"), never a question.
2. **Summary** (frontmatter `summary`, 2 to 4 sentences). The result with its numbers, the main caveat, nothing else.
   A funder who reads only this should know what happened.
3. **Key numbers** (frontmatter `numbers`, exactly the ones that matter, usually 3). Each label says what the number is
   and its comparison: "bits per byte, ExeaLM at 0.1B, same training time as Llama (1.481)".
4. **Opening paragraph.** Context in one or two sentences, then what the post tests. Start with a fact about the
   world or about yesterday's state, never with "In this post".
5. **Sections.** Each `##` heading states the content of its section ("Equal compute: the results", "Three fixes before
   retrieval learned anything"). A reader skimming headings alone should get the story. Usually 4 to 7 sections.
6. **Each result**: setup in one short paragraph (task, model size, steps, seeds), then the number against its control,
   then one or two sentences on what it means. A figure or table when there are more than three numbers.
7. **What this does not show.** A short section or paragraph, every time.
8. **Next.** One to three concrete next steps, linked to the to-do list when they are on it. End on the last concrete
   point. No recap paragraph.
9. **Credits** (frontmatter `credits`) and **sources** (frontmatter `sources`). See section 7.

Length: as long as the evidence needs. 1,000 to 2,000 words is typical. Cut anything a reader would skip.

## 3. Voice: the paper style

Write like the TONN paper (`paper_tonn/main.tex`) and the AAAI submission it grew from. Its habits:

- **Short declarative sentences.** Mostly 8 to 20 words. One idea per sentence, one topic per paragraph.
  > Every large language model in use today runs on an architecture chosen by people.
- **Split instead of chaining with "and".** "And" joins items in a list ("English, Japanese and code"). It does not
  join two thoughts. When a sentence reads "X happened, and Y happened", make it two sentences. Avneh flags this one
  first.
  > Before: The skeleton runs and its 16 tests pass, but no model has been trained on real data, and the bet is a hypothesis.
  > After: The skeleton runs and its 16 tests pass. No model has been trained on real data yet. The bet is a hypothesis.
- **Define every term where it first appears**, in plain words, with "meaning" or a short apposition. Then link it to
  the glossary with `<Term id="...">`.
  > A circuit, meaning a small combination of signal operations such as delays, running sums and products, stays in
  > the network only if switching it off raises the error on data the network has not trained on.
- **Numbers first, with the comparison and the evidence in the same sentence.** Use "against", not "vs".
  > TONN matched a transformer (0.018 against 0.017 bits per token, 3 seeds).
- **Caveats in the same sentence as the claim**, not in a footnote three paragraphs later.
  > Exact worth reached 78.9 percent against 74.9 for its start, in the one seed we ran.
- **Losses stated as plainly as wins.**
  > On web text, a same-size transformer is 0.13 bits per byte ahead.
- **Say what is new and what is not.** Credit prior work by name (REALM, Chinchilla, Mamba) with a link.
- **"We"** for the team. "I" only in a signed aside.
- **No notation in prose.** Write "the loss when the circuit is switched off", not `L(θ∖c)`. Code identifiers in
  backticks when the reader needs to find them in the repo.
- **Captions stand alone.** A reader who looks only at the figure and its caption must understand it. Start with what
  the figure shows, then how to read it ("Above zero, the hybrid is better."), then the takeaway.

## 4. Numbers and honesty

- Every number traceable: a `sources` entry for each result file or commit the post uses.
- State the seed count for every comparison. One seed is a lead, not a result; say "one seed so far".
- State the scale: parameters, steps or seconds, tokens seen. Say when a model is under-trained.
- Compare at equal steps and at equal compute when speed differs, and say which one each number is.
- Keep negative results and dead ends. They save contributors days.
- **Corrections stay visible.** When a later run overturns a claim, add a `<Correction>` block to the post that made
  it, say what changed and which commit fixed the record, and keep the original sentence in git history. Never
  silently edit a number.
- Do not round in the direction you hope. Do not drop a seed that disagrees.
- If something might be a bug or a leak, say so and say what is being checked.

## 5. No AI slop

These rules come from petergyang/no-ai-slop, the UltraUI `anti-slop` skill and the 2026 lists of AI-writing tells.
No single pattern proves anything; a cluster of them makes a post read as generated. Check the draft against every
line.

**Words to cut.** delve, foster, leverage, utilize, facilitate, empower, streamline, robust, cutting-edge, seamless,
game changer, paradigm shift, tapestry, realm, landscape (figurative), journey (figurative), beacon, multifaceted,
meticulous, intricate, paramount, pivotal, crucial, vital, comprehensive, transformative, elevate, embark,
supercharge, harness, unlock, unleash, ever-evolving, nuanced, testament, showcase, underscore, navigate (figurative),
"in today's world", "it's worth noting", "it's important to note", "at its core", "at the end of the day", "when it
comes to", "in order to", "the reality is", "let's dive in", "in this post".

**Adverbs that usually say nothing.** just, simply, actually, truly, really, fundamentally, importantly, crucially,
inherently, incredibly, significantly (unless it means a statistical test). Cut them unless they carry real contrast
or uncertainty.

**Patterns to cut.**
- **The negation pivot**: "It's not X, it's Y." / "This isn't about X. It's about Y." State Y.
- **Negative listing**: "Not a X. Not a Y. A Z." Say Z.
- **Colon reveals**: "The result: it learned." Write a plain sentence.
- **Rhetorical questions** answered by the next sentence. State the answer.
- **Throat-clearing and faux insight**: "Here's the thing", "What most people miss", "The key insight is".
- **Interpretive metadiscourse**: "This matters because", "Notably", "Interestingly", "As you can see". Show the
  number; let the reader judge.
- **Importance puffery**: "a major milestone", "a pivotal moment", "a big step forward".
- **Trailing -ing commentary**: "..., highlighting the power of swarms." Cut it or replace it with a mechanism.
- **Rule of three by reflex.** Lists of exactly three examples, three adjectives or three clauses, every time. Use the
  real number of items.
- **Synonym cycling.** If the word is "agent", keep saying "agent".
- **Robotic rhythm.** Every paragraph the same length and shape, or stacks of punchy fragments. Vary it only when the
  content varies.
- **Even-handed hedging** on questions that have an answer. If the data says the hybrid wins, say it wins, with the
  caveat.
- **Fake-profound endings and recap endings.** "In the end, the swarm is only as smart as its board." Delete. End on
  the last concrete point or the next action.
- **Formatting slop.** Bold sprinkled mid-sentence, bullet lists where two sentences of prose read better, headers over
  two-sentence sections, emoji anywhere.
- **Em dashes.** None in titles and summaries. At most one or two in a long post, and only where a comma or
  parentheses would read worse.
- **Italics for emphasis.** Never. The site renders `em` upright on purpose.
- **Weasel attribution**: "studies show", "experts agree". Name the paper and link it, or cut the claim.

**The portability test.** If a sentence could move unchanged into another lab's blog about another model, it is
filler. Replace it with a number, a mechanism, a name or a consequence specific to ExeaLM, or delete it.

**Read it aloud.** If a sentence sounds like a press release, rewrite it as you would say it to a teammate.

## 6. What makes a technical post worth reading

From technical-writing guides and the posts people keep linking (sources at the end):

- **Lead with the payoff.** The first paragraph says what was found. Readers decide in two paragraphs whether to stay.
- **Write for one specific reader** (the three readers at the top), and test each paragraph against them.
- **Build for scanning.** Developers scroll, read headings, glance at figures and stop where it looks relevant.
  Headings that state findings, figures with standalone captions, tables for more than three numbers.
- **One thesis per post.** If a post has two stories, it is two posts.
- **Concrete over abstract.** "Code went from 1.950 to 1.748 bits per byte" beats "code improved a lot".
- **Show the failure path.** How we got there, including what did not work, is the most useful part for contributors
  (the three retrieval blockers, the 6.12 bits-per-byte bug).
- **Make it reproducible.** Name the script and its arguments, the commit, the data. A contributor should be able to
  rerun any number.
- **End with what a reader can do next**: a to-do item, a script to run, a question that is open.

## 7. Credits: who did the work

Every post credits every person whose work it reports, by name and GitHub handle, with what they did in one specific
sentence. Put it in frontmatter:

```yaml
credits:
  - { login: aarochu, name: "Aaron", what: "Wrote the board-usage logging (PR #4) that reports how often agents read the empty entry, and found and fixed the split-swarm seam leak (PR #7)." }
  - { login: AvnehSBhatia, name: "Avneh Bhatia", what: "Ran the 49-run sweep on the Mac Studio and wrote the hybrid layout." }
```

- Say what the person built and what it made possible, not "helped with" or "contributed to".
- Link the PR or commit when there is one.
- Credit work that a result depends on even if the person did not run the experiment: a dataset script, a benchmark,
  a bug fix.
- Use the name people use publicly on GitHub. Never list someone whose organization membership is private.
- When a contribution changed a result (a bug fix that moved a number), say so in the body too, not only in credits.

## 8. Format

Posts live in `content/posts/<slug>/en.mdx` and `ja.mdx`. Slug: the title in lower-case words, hyphenated.

```yaml
---
title: "Pure TONN lost to Llama. The hybrid wins."
date: 2026-11-11          # the day the work happened
order: 2                  # order within the day
day: 2                    # day number of the project
summary: "..."
tags: [architecture, speed, scaling]   # from TAGS in lib/i18n.ts
numbers:
  - { value: "1.464", label: "bits per byte, ExeaLM at 0.1B, same training time as Llama (1.481)" }
credits:
  - { login: "...", name: "...", what: "..." }
sources:
  - { label: "results/README.md, section 8", href: "https://github.com/exea-labs/ExeaLM/blob/main/results/README.md" }
---
```

Components available in posts (see `components/mdx/index.tsx`):

- `<Term id="bpb">bits per byte</Term>`: glossary hover. Add new terms to `lib/glossary.ts`, in both languages.
- `<Figure n={3} caption="...">...</Figure>`: a numbered plate. The caption is a plain string, no ASCII double quotes
  inside it.
- Charts that read the result files: `<EqualCompute />`, `<LossCurves />`, `<SpeedBars />`, `<SweepTimeline />`,
  `<RelayChart />`, `<SwarmTextChart />`, `<LookupChart />`, `<TokenizerChart />`, `<HitRate />`.
- Architecture drawings: `<HybridStack />`, `<TonnLayer />`, `<CircuitMenu />`, `<SwarmBoard />`,
  `<RetrievalFlow mode="design" />`, `<RetrievalFlow mode="search" />`.
- `<Note title="...">` for setup details and side facts. `<Correction title="...">` for anything that overturns an
  earlier claim.
- Markdown tables for small sets of numbers. Bold the better value in each column.

Chart data comes from `scripts/sync_data.py`, which reads `../ExeaLM/results`. Run it after new results land; never
type a number into a chart.

## 9. The Japanese version

- Write `ja.mdx` after the English is approved, as a translation that reads natively, not word for word.
- です・ます調, short sentences, the same numbers, the same components with the same props, captions translated.
- Terminology: スウォーム, 掲示板, 検索 (the RG circuit), 検索拡張 (RAG as a concept), ライブラリ, チャンク, 回路,
  スロット, ストリーム, 層, 残差ストリーム, ハイブリッド, フルアテンション, Llama 型トランスフォーマー, 計算量をそろえた比較,
  ステップ数をそろえた比較, シード, 学習率, オラクル検索, ヒット率, 希少語キー, 畳み込み寄りの初期配置, 探索. TONN（トーン）.
- Internal links get the `/ja` prefix. Half-width digits, full-width 、。「」（）.
- The same no-slop rules apply: no 「〜と言えるでしょう」 hedging, no 「非常に重要です」 puffery, no closing recap.

## 10. The review loop

1. Draft from the fact sheet.
2. Run the checklist below yourself. Fix every failure.
3. **Show the full draft to Avneh in the chat before publishing.** Paste the English post text (frontmatter summary,
   numbers, credits and body) so it can be read in the terminal. Do not publish, push or deploy a post that has not
   been approved.
4. Apply the edits. Then write the Japanese version, build (`npm run build`), check the page in a browser at desktop
   and phone width, and publish.

## Checklist (every item pass or fail)

- [ ] Title states the finding. Summary has the numbers and the main caveat.
- [ ] Every number has a source in `sources`, with seeds and scale stated in the text.
- [ ] Every result has its baseline or control in the same sentence or table.
- [ ] Every new term is defined in plain words where it first appears and linked with `<Term>`.
- [ ] Negative results, bugs and caveats are in the post. Any overturned claim has a `<Correction>`.
- [ ] "What this does not show" is present.
- [ ] No banned word or pattern from section 5. No em dash in the title or summary. No italics.
- [ ] Every sentence passes the portability test.
- [ ] No sentence joins two thoughts with ", and". Split them; keep "and" for lists.
- [ ] Headings alone tell the story. No section shorter than two paragraphs unless it is a list or a table.
- [ ] Every figure caption stands alone.
- [ ] Credits name every person whose work the post reports, with one specific sentence each.
- [ ] The post ends on a concrete point or a next step, not a summary.
- [ ] Read aloud once. Nothing sounds like a press release.

## Sources

- petergyang/no-ai-slop, `skills/no-ai-slop/SKILL.md` and `eval.md`: https://github.com/petergyang/no-ai-slop
- UltraUI `anti-slop` and `anti-ai-slop-audit`: https://github.com/AvnehSBhatia/UltraUI
- Avneh Bhatia, TONN paper and AAAI submission (`OrganicNN/paper_tonn/main.tex`): the voice in section 3.
- How to write a great technical blog post (Sashko Stubailo): https://www.freecodecamp.org/news/how-to-write-a-great-technical-blog-post-414c414b67f6/
- How to Write Technical Posts (so people will read them) (Sandy Maguire): https://reasonablypolymorphic.com/blog/writing-technical-posts
- How to write technical blog posts that people actually read: https://dev.to/therizwansaleem/how-to-write-technical-blog-posts-that-people-actually-read-2574
- Writing for the Cohere Labs Community Blog (research blog structure): https://labscommunity.cohere.com/blog/2026/welcome-to-cohere-labs-blog/
- Scientific writing tips for ML researchers (figures that tell the story): https://medium.com/dair-ai/scientific-writing-tips-for-ml-researchers-fa4cae2effdd
- The New Em-Dash: 9 Signs of AI Writing: https://pasqualepillitteri.it/en/news/11195/new-em-dash-9-ai-writing-tells
- 18 signs you used AI to write that: https://www.onlinewritingclub.com/p/18-signs-you-used-ai-to-write-that
- Signs of AI writing: https://jetwong.neocities.org/ai/signs-of-ai-writing
