# AGENTS.md

Guidance for agents working in this repository.

## Project Goal

Create and maintain a React Next.js application styled with Tailwind CSS. The app should include Firebase integration for backend services and Azure Foundry agent integration for AI-powered features.

## Tech Stack

- Next.js with the App Router
- React with TypeScript
- Tailwind CSS for styling
- Firebase for authentication, database, storage, or hosting as needed
- Azure Foundry agents for AI features

## Setup Expectations

When scaffolding the app, prefer:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

Use the existing project structure if the app has already been created. Do not replace user changes or regenerate the project over existing work.

After setup, create or update `Layout.md` and use it as the source of truth for the shared navigation bar, footer, and layout components.

Create or update `Localization.md` when adding country, language, navigation-label, or form-label behavior. Country data belongs in `src/data/countries.json`; supported language data belongs in `src/data/languages.json`; dummy content should not be translated.

Create and reference page planning files before implementing each major section:

- `Homepage.md` for the home page.
- `GovernmentStructure.md` for the Government Structure menu item.
- `TheLaw.md` for The Law menu item.
- `PublicVote.md` for the Public Vote menu item.
- `OpinionPolls.md` for the Opinion Polls menu item.
- `HelpLine.md` for the Help Line menu item.

These files may start blank and should be filled in as each section is designed and implemented.

## Code Style

- Use TypeScript for application code.
- Prefer functional React components.
- Keep components small and focused.
- Use Tailwind utility classes for styling before adding custom CSS.
- Keep shared UI in `src/components`.
- Keep Firebase and Azure Foundry clients in dedicated modules under `src/lib`.
- Use environment variables for secrets and service configuration.
- Never commit API keys, Firebase private keys, or other secrets.

## Environment Variables

Use `.env.local` for local development. Document required variables in `.env.example`.

Expected Firebase variables may include:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Expected Azure Foundry variables may include:

```bash
AZURE_FOUNDRY_PROJECT_ENDPOINT=
AZURE_FOUNDRY_AGENT_NAME=
AZURE_FOUNDRY_AGENT_VERSION=
```

Only expose variables with `NEXT_PUBLIC_` when they are safe to send to the browser.

## Firebase Integration

- Initialize the Firebase client in `src/lib/firebase/client.ts`.
- Put server-only Firebase Admin code in `src/lib/firebase/admin.ts`.
- Do not import Admin SDK code into client components.
- Use Firebase Auth from client-safe modules.
- Keep Firestore and Storage access behind clear helper functions where practical.
- Apply Firebase security rules for any user-generated data.

## Azure Foundry Integration

- Call Azure Foundry agents from server-side code only, such as Route Handlers or Server Actions.
- Do not call Azure Foundry directly from client components.
- Keep Azure Foundry client setup in `src/lib/foundry.ts`.
- Use `DefaultAzureCredential` for local Azure authentication unless a more specific credential is required.
- Validate and sanitize user input before sending it to the API.
- Return only the data the UI needs.
- Handle API errors gracefully and avoid exposing internal error details to users.

## Styling And UI

- Use Tailwind classes directly in components.
- Prefer accessible, semantic HTML.
- Ensure forms have labels and clear validation states.
- Keep layouts responsive from mobile to desktop.
- Avoid hardcoded colors when a Tailwind theme token or reusable pattern exists.

## Recommended Structure

```text
src/
  app/
    api/
      ai/
        route.ts
    layout.tsx
    page.tsx
  components/
    layout/
      app-header.tsx
      app-footer.tsx
      nav-link.tsx
  lib/
    firebase/
      client.ts
      admin.ts
    foundry.ts
  types/
```

## Testing And Verification

Before finishing changes, run the relevant checks when available:

```bash
npm run lint
npm run build
```

If tests are added later, run the focused test command for the changed area.

## Agent Workflow

- Read existing files before making changes.
- Preserve user edits and unrelated work.
- Keep changes scoped to the current request.
- Prefer existing project conventions once the app exists.
- Add or update `.env.example` when adding new required environment variables.
- Explain any command that needs network access or elevated permissions before requesting approval.
