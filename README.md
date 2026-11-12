# Exea Labs Blog

Daily research notes from Exea Labs, in English and Japanese: [blog.exealabs.org](https://blog.exealabs.org).
Right now it covers ExeaLM, an open 0.1B language model built in public
([exea-labs/ExeaLM](https://github.com/exea-labs/ExeaLM)).

## Run it

```bash
npm install
npm run dev          # http://localhost:3000 (search needs a build)
npm run build        # static site in out/, with the Pagefind search index
npm start            # serve out/
```

## Edit the site

Anyone can propose a change: fork the repo (or make a branch if you are in the exea-labs org), edit, and open a pull
request against `main`. Small fixes (a typo, a broken link) can be made straight in GitHub's web editor with the pencil
button on any file.

| To change | Edit |
|---|---|
| A post | `content/posts/<slug>/en.mdx` and its Japanese twin `ja.mdx` |
| The home page | `components/site/Home.tsx` |
| Colours, type, spacing | the tokens at the top of `app/globals.css` |
| A glossary term | `lib/glossary.ts` (English and Japanese together) |
| The contributor list | `data/signups.json` (names and GitHub usernames only, nothing else from the sign-up form) |
| Charts | `components/viz/` (data comes from `data/*.json`, see below) |

Run `npm run build` before opening the pull request; it fails on broken MDX or type errors. New posts are reviewed by
a maintainer before they go live. Merging to `main` deploys the site.

## Write a post

Read `.claude/skills/exea-blog-post/SKILL.md` first: the voice, the no-AI-slop rules, numbers and honesty, credits,
the components and the review loop. Posts are MDX in `content/posts/<slug>/en.mdx` and `ja.mdx`.

Chart data comes from the ExeaLM result files, never typed by hand:

```bash
python3 scripts/sync_data.py --exealm ../ExeaLM   # writes data/*.json
```

## Design

The same sheet as [Arrival](https://arrival.exealabs.org): night slate or day paper, ink linework, one survey-orange
signal, Fraunces and DM Mono, rulers and registration marks. Text sits centred on plain paper, with no grid behind it. Tokens are at the top of
`app/globals.css`.

Built with Next.js (static export), MDX, Motion, d3 and Pagefind. Hosted on Vercel.
