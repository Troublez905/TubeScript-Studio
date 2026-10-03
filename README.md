# TubeScript Studio

TubeScript Studio is a Next.js prototype for planning YouTube Shorts and long-form videos from idea to production-ready script.

## What It Does

- Generates 5 distinct video angles from a niche or seed topic.
- Builds research notes, reference search prompts, B-roll ideas, and timestamped storyboard blocks.
- Supports Shorts-focused retention structure: hook, visual refresh notes, safe-zone guidance, and loop setup.
- Supports long-form section-by-section scripting.
- Exports Markdown and teleprompter text.
- Uses local browser persistence so work is not lost on refresh.
- Runs with deterministic fallback generation when no OpenAI key is configured.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zustand
- Lucide Icons
- OpenAI API-ready server routes

## Local Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## OpenAI Setup

Copy `.env.example` to `.env.local` and set:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

Without `OPENAI_API_KEY`, the app still works using local fallback generation.

## Build

```bash
npm run build
```

## Deployment

The easiest hosting path is Vercel:

1. Import this GitHub repo into Vercel.
2. Use the default Next.js settings.
3. Add `OPENAI_API_KEY` and `OPENAI_MODEL` in Vercel Project Settings > Environment Variables.
4. Deploy.

Netlify is also possible with its Next.js runtime, but Vercel is the most direct option for this stack.
