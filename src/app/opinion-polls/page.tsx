import { OpinionPollsBoard } from "@/components/opinion-polls/opinion-polls-board";

const opinionPolls = [
  {
    id: "clinic-service-hours",
    title: "Public Clinic Service Hours",
    description:
      "Tell the health department whether extended clinic hours would improve access for families, workers, students, and patients who need routine care after normal office hours.",
    category: "service" as const,
    status: "open" as const,
    region: "National",
    createdBy: "Ministry of Health",
    dates: {
      opensAt: "2026-05-01",
      closesAt: "2026-06-15",
    },
    inputTypes: ["vote", "rating", "reaction", "comment"] as const,
    voteOptions: ["Extend hours", "Keep current hours", "Pilot in select clinics"],
    ratingScale: {
      min: 1,
      max: 5,
      labels: {
        min: "Not useful",
        max: "Very useful",
      },
    },
    reactionOptions: ["support", "oppose", "neutral", "concerned", "excited"] as const,
    allowAnonymous: true,
    allowMultipleResponses: false,
    tags: ["health", "clinics", "service delivery"],
  },
  {
    id: "budget-priority-2026",
    title: "County Budget Priority Ranking",
    description:
      "Share which budget areas should receive priority in the next county plan, including roads, water, health, education, markets, and youth employment programs.",
    category: "budget" as const,
    status: "open" as const,
    region: "Nairobi City County",
    createdBy: "County Treasury",
    dates: {
      opensAt: "2026-05-10",
      closesAt: "2026-06-01",
    },
    inputTypes: ["vote", "comment"] as const,
    voteOptions: ["Roads", "Water", "Health", "Education", "Markets", "Youth jobs"],
    allowAnonymous: false,
    allowMultipleResponses: false,
    tags: ["budget", "county", "planning"],
  },
  {
    id: "digital-id-feedback",
    title: "Digital ID Enrollment Feedback",
    description:
      "Rate the digital ID enrollment experience and submit comments about waiting times, document requirements, accessibility, staff support, and status tracking.",
    category: "policy" as const,
    status: "open" as const,
    region: "National",
    createdBy: "Civil Registration Services",
    dates: {
      opensAt: "2026-04-20",
      closesAt: "2026-05-31",
    },
    inputTypes: ["rating", "reaction", "comment"] as const,
    ratingScale: {
      min: 1,
      max: 10,
      labels: {
        min: "Poor",
        max: "Excellent",
      },
    },
    reactionOptions: ["support", "neutral", "concerned"] as const,
    allowAnonymous: true,
    allowMultipleResponses: true,
    tags: ["identity", "digital services"],
  },
  {
    id: "market-cleanliness",
    title: "Market Cleanliness and Waste Collection",
    description:
      "Give feedback on public market sanitation, waste collection schedules, drainage conditions, and whether traders have enough disposal points.",
    category: "community" as const,
    status: "upcoming" as const,
    region: "Mombasa County",
    createdBy: "County Environment Office",
    dates: {
      opensAt: "2026-06-05",
      closesAt: "2026-06-25",
    },
    inputTypes: ["reaction", "comment"] as const,
    reactionOptions: ["support", "concerned", "excited"] as const,
    allowAnonymous: true,
    allowMultipleResponses: false,
    tags: ["markets", "sanitation", "environment"],
  },
  {
    id: "public-participation-law",
    title: "Public Participation Law Feedback",
    description:
      "Submit your view on proposed public participation rules, including notice periods, translation access, published hearing minutes, and response reports.",
    category: "law" as const,
    status: "closed" as const,
    region: "National",
    createdBy: "Parliament Committee Desk",
    dates: {
      opensAt: "2026-03-01",
      closesAt: "2026-04-15",
    },
    inputTypes: ["vote", "comment"] as const,
    voteOptions: ["Support", "Oppose", "Support with amendments"],
    allowAnonymous: false,
    allowMultipleResponses: false,
    tags: ["law", "public participation"],
  },
  {
    id: "school-meals",
    title: "School Meals Program Satisfaction",
    description:
      "Rate satisfaction with school meal availability, quality, delivery reliability, and the transparency of beneficiary school lists.",
    category: "service" as const,
    status: "open" as const,
    region: "National",
    createdBy: "Education Services Directorate",
    dates: {
      opensAt: "2026-05-06",
      closesAt: "2026-06-06",
    },
    inputTypes: ["rating", "comment"] as const,
    ratingScale: {
      min: 1,
      max: 5,
      labels: {
        min: "Unsatisfied",
        max: "Satisfied",
      },
    },
    allowAnonymous: true,
    allowMultipleResponses: false,
    tags: ["education", "food", "children"],
  },
  {
    id: "transport-fare-review",
    title: "Public Transport Fare Review",
    description:
      "Share views on transport fare review procedures, route notices, passenger safety enforcement, and accessibility for elderly residents and people with disabilities.",
    category: "service" as const,
    status: "open" as const,
    region: "Kisumu County",
    createdBy: "Transport Office",
    dates: {
      opensAt: "2026-05-11",
      closesAt: "2026-06-20",
    },
    inputTypes: ["vote", "reaction", "comment"] as const,
    voteOptions: ["Support review", "Reject review", "Need more hearings"],
    reactionOptions: ["support", "oppose", "neutral", "concerned"] as const,
    allowAnonymous: true,
    allowMultipleResponses: false,
    tags: ["transport", "fares", "mobility"],
  },
];

const publicOpinions = [
  {
    id: "opinion-1",
    pollId: "clinic-service-hours",
    participant: {
      name: "Grace W.",
      region: "Nakuru",
    },
    vote: "Pilot in select clinics",
    rating: 5,
    reaction: "support" as const,
    comment:
      "Evening clinic hours would help workers who cannot leave during the day. A pilot would show staffing needs before national rollout.",
    submittedAt: "2 hours ago",
  },
  {
    id: "opinion-2",
    pollId: "budget-priority-2026",
    participant: {
      name: "David K.",
      region: "Nairobi",
    },
    vote: "Water",
    comment:
      "Water reliability should come first because it affects health, schools, and small businesses every day.",
    submittedAt: "Yesterday",
  },
  {
    id: "opinion-3",
    pollId: "digital-id-feedback",
    participant: {
      region: "Mombasa",
    },
    rating: 7,
    reaction: "concerned" as const,
    comment:
      "The system was useful, but status updates were unclear after submission. SMS updates would make it better.",
    submittedAt: "3 days ago",
  },
];

export default function OpinionPollsPage() {
  return (
    <main className="flex flex-1 bg-[#f7f8f3]">
      <OpinionPollsBoard
        initialOpinions={publicOpinions}
        initialPolls={opinionPolls}
      />
    </main>
  );
}
