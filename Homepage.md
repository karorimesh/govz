# Homepage

The homepage displays top stories for the selected country.

## Top Stories Schema

Each story uses this shape:

```ts
{
  title: string;
  imgLink: string;
  summary: string; // up to 200 words
  author: string;
  link: string;
}
```

## Requirements

- Use dummy story data until a real data source is connected.
- Display the highest-priority/top story with more visual space than the other stories.
- Display remaining stories in a responsive grid or list.
- Include search functionality for title, summary, and author.
- Include pagination for browsing more stories.
- Story cards should link to their source URL.
