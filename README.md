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

## Write a post

Read `.claude/skills/exea-blog-post/SKILL.md` first: the voice, the no-AI-slop rules, numbers and honesty, credits,
the components and the review loop. Posts are MDX in `content/posts/<slug>/en.mdx` and `ja.mdx`.

Chart data comes from the ExeaLM result files, never typed by hand:

```bash
python3 scripts/sync_data.py --exealm ../ExeaLM   # writes data/*.json
```

## Design

The same sheet as [Arrival](https://arrival.exealabs.org): night slate or day paper, ink linework, one survey-orange
signal, Fraunces and DM Mono, a hairline grid, rulers and registration marks. Tokens are at the top of
`app/globals.css`.

Built with Next.js (static export), MDX, Motion, d3 and Pagefind. Hosted on Vercel.
