# subtranslate

A [Devvit Web](https://developers.reddit.com/docs/capabilities/devvit-web/devvit_web_overview) mod tool that lets moderators translate Reddit posts and comments with AI. Translations are cached in Redis so repeat requests for the same content do not use API tokens.

**Repository:** [github.com/jprimeai/reddit-mod-app-subtranslate](https://github.com/jprimeai/reddit-mod-app-subtranslate)

Developed by **JPrime**.

## Features

- **Post and comment menu action** — open the ⋮ menu on any post or comment and choose **Translate**
- **OpenAI or Gemini** — per-subreddit provider, model, and API key settings
- **Review form** — shows the original text and translation side by side before closing
- **Redis caching** — hashes original content plus translation settings; cache hits skip the AI API entirely

## How it works

1. A moderator triggers **Translate** from the post or comment menu.
2. The server reads the post title/body or comment text via the Reddit API.
3. A cache key is built from a SHA-256 hash of the text, target language, provider, and model.
4. On a cache miss, the app calls OpenAI or Gemini, stores the result in Redis, and shows the review form.
5. On a cache hit, the cached translation is returned immediately.

## Setup

### Requirements

- Node.js 22+
- [Devvit CLI](https://developers.reddit.com/docs/quickstart)
- An OpenAI or Google Gemini API key

### Install and playtest

```bash
npm install
npm run login
npm run dev
```

`npm run dev` runs `devvit playtest`, which builds the server and installs the app on the dev subreddit configured in `devvit.json` (`subtranslate_dev` by default).

### Subreddit settings

After installing the app on a subreddit, configure these fields on the app install settings page:

| Setting | Description |
| --- | --- |
| **AI provider** | `OpenAI` or `Google Gemini` |
| **API secret** | Your provider API key for this subreddit |
| **Model** | e.g. `gpt-4o-mini`, `gemini-2.0-flash` |
| **Target language** | Language to translate into, e.g. `English`, `Spanish` |

## Usage

1. Install the app on your subreddit and fill in the settings above.
2. Open a post or comment as a moderator.
3. Open the ⋮ menu and choose **Translate** under the app section.
4. Review the translation in the form and close when done.

If the same content is translated again with the same settings, the form will note that a cached translation was loaded.

## Project structure

```
src/
  server/
    core/
      cache.ts      # Redis cache keyed by content hash
      content.ts    # Reads post/comment text from context
      settings.ts   # Loads subreddit install settings
      translate.ts  # OpenAI and Gemini API calls
    routes/
      menu.ts       # POST /internal/menu/translate
      forms.ts      # Form submit handler
    index.ts        # Hono server entry point
  shared/
    translate.ts    # Shared types and constants
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Playtest on the configured dev subreddit |
| `npm run build` | Build the server bundle |
| `npm run deploy` | Type-check, lint, and upload a new app version |
| `npm run launch` | Deploy and publish for review |
| `npm run type-check` | Run TypeScript checks |
| `npm run lint` | Run ESLint |

## Permissions

The app requests:

- **Reddit API** (moderator scope) — read posts and comments
- **HTTP** — `api.openai.com`, `generativelanguage.googleapis.com`
- **Redis** — store translation cache entries

## License

BSD-3-Clause
