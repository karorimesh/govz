# Opinion Polls

Opinion Polls capture public sentiment on government programs, proposed laws, service delivery, policy ideas, community concerns, and national priorities.

Polls should support reactions, votes, ratings, comments, and other structured public input.

## Poll Schema

Each opinion poll should use this shape:

```ts
{
  id: string;
  title: string;
  description: string;
  category: "policy" | "service" | "budget" | "law" | "community" | "other";
  status: "open" | "upcoming" | "closed";
  region: string;
  createdBy: string;
  dates: {
    opensAt: string;
    closesAt: string;
  };
  inputTypes: Array<"vote" | "rating" | "reaction" | "comment">;
  voteOptions?: string[];
  ratingScale?: {
    min: number;
    max: number;
    labels?: {
      min: string;
      max: string;
    };
  };
  reactionOptions?: Array<"support" | "oppose" | "neutral" | "concerned" | "excited">;
  allowAnonymous: boolean;
  allowMultipleResponses: boolean;
  tags: string[];
}
```

## Public Input Schema

Each public response to an opinion poll should use this shape:

```ts
{
  id: string;
  pollId: string;
  participant: {
    publicId?: string;
    name?: string;
    region?: string;
    phone?: string;
    email?: string;
  };
  vote?: string;
  rating?: number;
  reaction?: "support" | "oppose" | "neutral" | "concerned" | "excited";
  comment?: string;
  submittedAt: string;
}
```

## Public Reaction Schema

The general public should be able to react to published opinions or comments.

```ts
{
  id: string;
  pollId: string;
  opinionId: string;
  reaction: "like" | "dislike" | "support" | "concern" | "flag";
  participantId?: string;
  submittedAt: string;
}
```

## Interface Requirements

- Display opinion polls in card form.
- Show poll title, description, category, region, dates, and status.
- Show the available input types for each poll.
- Provide search across title, description, category, region, tags, and status.
- Include pagination.
- Open poll details in a modal or dedicated page.
- Allow the public to submit input based on the poll input types:
  - Vote selection when `vote` is enabled.
  - Rating control when `rating` is enabled.
  - Reaction selector when `reaction` is enabled.
  - Comment box when `comment` is enabled.
- Display submitted public opinions in a list.
- Allow the public to react to submitted opinions using the public reaction schema.
- Include a way to create a new opinion poll using the poll schema.
- Use dummy data until a backend is connected.

## Validation Notes

- Require at least one enabled input type.
- Require `voteOptions` when the poll supports voting.
- Require `ratingScale` when the poll supports ratings.
- Require `reactionOptions` when the poll supports reactions.
- Do not require personal details when `allowAnonymous` is true.
- Comments should have a reasonable character limit.

## Future Integration Notes

- Polls, public input, and reactions can later be stored in Firebase.
- Public input should be validated server-side before official storage.
- Identity verification may be required for official polls.
- Moderation should be added for comments and flagged reactions.
