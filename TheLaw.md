# The Law

The Law page should resemble a chat interface where citizens can review recent laws and ask questions in plain language.

## Initial Load

On page load, display the 5 latest laws the government has implemented or is currently implementing.

Each law uses this schema:

```ts
{
  title: string;
  summary: string; // 50 words
  dates: string;
}
```

## Interface Requirements

- Use a chat-style layout.
- The latest laws should appear as the first assistant/system message before the user prompt.
- Display exactly 5 latest laws on initial load.
- Each law item should show the title, 50-word summary, and relevant date or date range.
- After the latest laws section, show a chat prompt input.
- The prompt should allow users to ask questions about laws, bills, rights, obligations, or implementation timelines.
- Include a send button for submitting the prompt.
- Keep the chat interface accessible with labels, readable contrast, and keyboard-friendly controls.
- Use dummy data until a real government laws data source is connected.

## Suggested Layout

- Page heading: `The Law`
- Chat panel:
  - Assistant intro message
  - Latest laws list
  - Empty chat response area for future answers
  - Prompt input fixed near the bottom of the chat panel

## Future Integration Notes

- The latest laws can later be fetched from Firebase or another government data source.
- User law questions can later be routed through the existing OpenAI server-side integration.
- Do not call OpenAI directly from client components.
