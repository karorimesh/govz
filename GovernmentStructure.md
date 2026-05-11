# Government Structure

The Government Structure page displays government offices and positions as a tree-like hierarchy.

The interface should show up to 5 levels of the tree at a time so users can understand how authority, responsibility, and reporting lines are organized.

## Position Node Schema

Each tree node represents a government position.

```ts
{
  id: string;
  title: string;
  description: string; // short definition, about 10 words
  icon: string;
  level: number; // 1 to 5 in the visible tree depth
  parentId?: string;
  officeType:
    | "executive"
    | "legislative"
    | "judiciary"
    | "independent_office"
    | "ministry"
    | "department"
    | "county"
    | "local_office";
  currentHolderId?: string;
  location?: string;
  termLength?: string;
  appointmentMethod?: "elected" | "appointed" | "nominated" | "career_service";
  responsibilities: string[];
  history: PositionHolder[];
  children?: PositionNode[];
}
```

## Position Holder Schema

Each historical or current office holder should use this shape:

```ts
{
  id: string;
  name: string;
  title: string;
  imageUrl?: string;
  servedFrom: string;
  servedTo?: string;
  status: "current" | "former";
  personalSummary: string;
  details: {
    dateOfBirth?: string;
    education?: string;
    profession?: string;
    politicalAffiliation?: string;
    homeRegion?: string;
  };
  latestNews: Array<{
    title: string;
    source: string;
    date: string;
    link: string;
  }>;
  merits: string[];
  demerits: string[];
}
```

## Tree Interface Requirements

- Display government positions as a tree.
- Show 5 hierarchy levels at a time.
- Each node should show:
  - Icon
  - Title
  - Short description
  - Current office holder, if available
  - Level indicator
  - Responsibilities button
  - History button
- Child nodes should visually connect to their parent node.
- The tree should be readable on desktop and responsive on mobile.
- Use dummy data until a real government data source is connected.

## Responsibilities Modal

Clicking `Responsibilities` on a node opens a modal.

The modal should show:

- Position title
- Short definition
- Office type
- Appointment method
- Term length, if available
- Responsibilities list

## History Timeline

Clicking `History` on a node opens a timeline of people who have held that position.

The timeline should show:

- Person name
- Served from date
- Served to date, or `Current`
- Status badge
- Optional profile picture thumbnail

Clicking a person in the timeline opens their profile card.

## Person Profile Card

The profile card should show:

- Picture, if available
- Name
- Position title
- Service dates
- Personal details summary
- Personal details fields:
  - Date of birth
  - Education
  - Profession
  - Political affiliation
  - Home region

The card should include tabs for:

- Latest News
- Merits
- Demerits

## Profile Tabs

### Latest News

Show a list of recent news items related to the person.

Each item should include:

- Title
- Source
- Date
- Link

### Merits

Show achievements, reforms, public service contributions, or positive records.

### Demerits

Show controversies, failures, public criticism, unresolved issues, or negative records.

## Future Integration Notes

- Position data can later be stored in Firebase.
- Profile news can later be fetched from trusted public sources.
- Profile details should be verified before being treated as official.
- Sensitive or disputed claims should include source links.
