# Public Vote

The Public Vote page is for referendums, petitions, and other public voting matters.

## Public Vote Item Schema

Each referendum or petition should use this shape:

```ts
{
  id: string;
  country: string;
  type: "referendum" | "petition";
  title: string;
  description: string; // show truncated to 50 words on cards
  dates: string;
  initiatorName: string;
  initiatorType: "person" | "party" | "organization" | "government";
  status: "open" | "upcoming" | "closed";
  region: string;
  voteOptions: string[];
  requiredThreshold?: string;
}
```

## Voter Details Schema

Voting should collect:

```ts
{
  id: string;
  country: string;
  publicVoteItemId: string;
  address: string;
  phone: string;
  email: string;
  theirVote: string;
  comments: string;
}
```

## Interface Requirements

- Display referendums and petitions in card form.
- Filter displayed referendums and petitions by the selected country.
- Truncate each card description to 50 words.
- Include a `More` action that opens a modal with full details.
- Include a `Vote` action for open referendums and petitions.
- Voting should open a form collecting voter details and their vote.
- Include search across title, description, initiator, type, status, and region.
- Include pagination.
- Include a way to create a new referendum or petition based on the public vote item schema.
- New and updated public vote items must save the selected country in `country`.
- Vote submissions must save the selected country in `country` and the selected item in `publicVoteItemId`.
- Use dummy data until a real backend is connected.
- Keep all controls accessible with labels, focus states, and keyboard-friendly modal behavior.

## Future Integration Notes

- Public vote items can later be stored in Firebase.
- Votes should later be validated and securely stored server-side.
- Voter identity verification should happen before accepting official votes.
