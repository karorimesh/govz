# Homepage

The homepage displays top stories for the selected country.

## Top Stories Schema

Each story uses this shape:

```ts
{
  title: string;
  imgLink: string; // direct image URL or one of the public fallback images
  summary: string; // up to 200 words
  author: string;
  link: string;
}
```

## Requirements

- Load stories from the Azure Foundry homepage governance news prompt on page load.
- Display the highest-priority/top story with more visual space than the other stories.
- Display remaining stories in a responsive grid or list.
- Include search functionality for title, summary, and author.
- Include pagination for browsing more stories.
- Story cards should link to their source URL.
- If story images are unavailable, assign the five public fallback images in order:
  - `/governance-news-1.jpg`
  - `/governance-news-2.jpg`
  - `/governance-news-3.jpg`
  - `/governance-news-4.jpg`
  - `/governance-news-5.jpg`

## Azure Foundry Integration

- The homepage calls `POST /api/homepage-stories` when it loads.
- The API route builds the homepage governance news prompt from `promts.md`.
- The prompt uses the selected country and selected language from the localization provider.
- The API route calls the Azure Foundry agent through `src/lib/foundry.ts`.
- The response is parsed and validated against the top stories schema before being returned to the UI.
- Dummy homepage story data has been removed.

## Required Environment Variables

The required Foundry variables are defined in `.env` and documented in `.env.example`:

```bash
AZURE_FOUNDRY_PROJECT_ENDPOINT=
AZURE_FOUNDRY_OPENAI_ENDPOINT=
AZURE_FOUNDRY_AGENT_NAME=
AZURE_FOUNDRY_AGENT_VERSION=
```

Authentication uses Azure CLI credentials through `DefaultAzureCredential`. Run `az login` locally before calling the Foundry-backed API routes.
