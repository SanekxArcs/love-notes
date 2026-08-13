<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/gradient.svg?title=Love+Notes&subtitle=Private+messages%2C+memories%2C+and+little+rituals&logo=heart&theme=rose&mode=dark" />
    <img src="https://shieldcn.dev/header/gradient.svg?title=Love+Notes&subtitle=Private+messages%2C+memories%2C+and+little+rituals&logo=heart&theme=rose&mode=light" alt="Love Notes — private messages, memories, and little rituals" />
  </picture>
</p>

<p align="center">
  A small private space for two people to leave messages, remember meaningful moments, and learn what makes each other smile.
</p>

<p align="center">
  <img alt="Next.js" src="https://shieldcn.dev/badge/Next.js-16.2.12-000000.svg?theme=rose&variant=branded&logo=nextdotjs" />
  <img alt="React" src="https://shieldcn.dev/badge/React-19.2.4-61DAFB.svg?theme=rose&variant=branded&logo=react" />
  <img alt="TypeScript" src="https://shieldcn.dev/badge/TypeScript-7.0.2-3178C6.svg?theme=rose&variant=branded&logo=typescript" />
  <img alt="Sanity" src="https://shieldcn.dev/badge/Sanity-6.8.0-F03E2F.svg?theme=rose&variant=branded&logo=sanity" />
  <img alt="Tailwind CSS" src="https://shieldcn.dev/badge/Tailwind_CSS-4.3.3-06B6D4.svg?theme=rose&variant=branded&logo=tailwindcss" />
</p>

## What is included

- Daily and extra love messages with history.
- Partner invitations and private pairing through generated IDs.
- Shared notes with private, shared, and correction states.
- A relationship calendar for important, daily, and intimate moments.
- An embedded Sanity Studio at `/admin` for managing users and content.
- Optional Gemini-powered writing, note suggestions, image scanning, and analysis. Each user can provide their own key from their profile.
- Light and dark themes, responsive navigation, onboarding tours, and installable web-app assets.

## Privacy model

The application does not include a database of its own. User profiles, messages, notes, calendar events, and Gemini keys are stored in the Sanity project configured by your environment variables.

This setup keeps data out of the original project and under your own Sanity account, but Sanity is still a hosted third-party service. A fully self-managed, no-SaaS deployment would require replacing the Sanity data layer and its image storage.

To keep your data under your control:

1. Create a new Sanity project and dataset for your fork.
2. Create a new Sanity API token for that project.
3. Use a private deployment or put the app behind an access layer you control.
4. Never reuse the original project's `.env` file, Sanity project ID, dataset, or API token.
5. Do not add `.env`, `.env.local`, or provider secret values to Git.

The optional Gemini features send the data needed for a specific AI request to Google Gemini. Leave the Gemini key empty if you do not want to use those features.

> **Security warning:** registration is currently public, and passwords are stored as plain text by the current application code. Keep a personal deployment access-controlled and do not expose it to the public internet until password hashing and registration protection have been implemented.

## Fork and self-host

### 1. Fork the repository

Fork [SanekxArcs/love-notes](https://github.com/SanekxArcs/love-notes) to your own GitHub account. A public fork is fine for the source code, but your Sanity project and deployment secrets should belong only to you.

### 2. Create your own Sanity project

Create a project at [sanity.io/manage](https://www.sanity.io/manage), then create a dataset, normally named `production`.

Create an API token with permission to read and write content. The app uses the token on the server for authentication and mutations, so it must not be exposed as a `NEXT_PUBLIC_*` variable.

The Sanity schema is already included in this repository. The embedded Studio is available at `/admin` after the app is running.

### 3. Configure local environment variables

Copy the example file and fill in values from your own Sanity project:

```bash
cp .env.example .env.local
```

Generate a fresh authentication secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Put the generated value in `AUTH_SECRET`. Do not copy the secret from another deployment.

Required values:

| Variable                         | Required | Purpose                                              |
| -------------------------------- | -------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | Yes      | Your Sanity project ID                               |
| `NEXT_PUBLIC_SANITY_DATASET`     | Yes      | Your dataset, usually `production`                   |
| `SANITY_API_TOKEN`               | Yes      | Server-side read/write token for your Sanity project |
| `AUTH_SECRET`                    | Yes      | Secret used to sign login sessions                   |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No       | Sanity API version; defaults to `2025-02-27`         |

The complete template is in [.env.example](./.env.example).

### 4. Install, generate types, and run

Use Node.js 20.9 or newer:

```bash
npm install
npm run typegen
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production build:

```bash
npm run build
npm run start
```

`predev` and `prebuild` run Sanity schema extraction and type generation automatically, but running `npm run typegen` once makes configuration errors easier to spot.

### 5. Create the first admin account

1. Open `/register` and create your own account.
2. Sign in.
3. Open `/admin` and authenticate with Sanity.
4. Open the new user document and change `role` from `user` to `admin`.
5. Add or edit message content in that user's `messages` array, including `category: daily` or `category: extra`.
6. Invite your partner from the app after both accounts exist.

There is no automatic demo-data seed. This means a new Sanity project starts empty and is isolated from the original deployment.

### 6. Deploy your private copy

Deploy the repository to a Node-compatible host such as Vercel, a VPS, or another managed Next.js host. Configure the same environment variables in the host's secret/environment settings, then use:

```bash
npm run build
npm run start
```

For a privacy-first setup, use a private project, a private domain, VPN, reverse-proxy authentication, or another access control layer. Remember that `/register` is intentionally reachable by default in the current code.

## Useful commands

| Command           | Purpose                                                   |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Start the local development server                        |
| `npm run build`   | Create a production build                                 |
| `npm run start`   | Serve the production build                                |
| `npm run lint`    | Run Biome linting                                         |
| `npm run typegen` | Extract the Sanity schema and regenerate TypeScript types |

## Backups and moving data

Sanity is the source of truth for application data. Make periodic exports from your own dataset and store them somewhere private. For example, after authenticating with the Sanity CLI:

```bash
npx sanity dataset export production ./love-notes-backup.tar.gz
```

Keep the exported file encrypted and separate from the Git repository. If you are migrating existing data, export and import only between Sanity projects that you own, and update the app's environment variables to the destination project.

## Development notes

- The app is built with Next.js App Router, React, TypeScript, Tailwind CSS, shadcn-style UI components, and Sanity.
- AI is optional. Gemini keys are stored per user in Sanity and can be shared with the connected partner through the app's partner relationship without revealing the key value in the UI.
- Images are served from `cdn.sanity.io`; keep that hostname in `next.config.ts` if you add more Sanity image sources.
- The legal pages live at `/privacy` and `/terms` and should be reviewed before deploying your own instance.

## Contributing

Issues and pull requests are welcome. When changing the schema, run `npm run typegen` and verify both the app routes and the embedded `/admin` Studio.

## README design

The header and badge row use [shieldcn](https://shieldcn.dev). For README Studio or additional badge variations, see [shieldcn.dev/studio](https://shieldcn.dev/studio).
