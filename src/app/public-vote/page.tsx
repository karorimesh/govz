import { PublicVoteBoard } from "@/components/public-vote/public-vote-board";

const publicVoteItems = [
  {
    id: "water-access-2026",
    type: "referendum" as const,
    title: "National Water Access Fund Referendum",
    description:
      "Citizens are being asked whether a dedicated national fund should be created to finance water infrastructure in drought-prone counties, upgrade community boreholes, and publish quarterly spending reports. The proposal includes independent audits, county-level project lists, and public reporting requirements before additional allocations can be approved.",
    dates: "Voting: June 10-17, 2026",
    initiatorName: "Ministry of Water and Sanitation",
    initiatorType: "government" as const,
    status: "open" as const,
    region: "National",
    voteOptions: ["Support", "Reject", "Abstain"],
    requiredThreshold: "Simple majority with 40% county participation",
  },
  {
    id: "school-meals-petition",
    type: "petition" as const,
    title: "Expand Public School Meals Petition",
    description:
      "This petition asks Parliament to expand the public school meals program to cover informal settlements and remote wards where attendance has dropped due to food insecurity. Petitioners request budget protection, local supplier participation, nutrition reporting, and a public dashboard showing beneficiary schools and delivery schedules.",
    dates: "Signatures open until May 30, 2026",
    initiatorName: "Parents for Learning Coalition",
    initiatorType: "organization" as const,
    status: "open" as const,
    region: "National",
    voteOptions: ["Sign petition", "Do not sign"],
    requiredThreshold: "100,000 verified signatures",
  },
  {
    id: "county-transport-charter",
    type: "referendum" as const,
    title: "County Transport Safety Charter",
    description:
      "Residents will vote on a county charter requiring safer bus stops, published route maps, driver compliance checks, and transparent fare review procedures. The charter would also require transport officials to publish quarterly road safety data and hold public hearings before approving major route changes.",
    dates: "Upcoming: July 2026",
    initiatorName: "Green Civic Party",
    initiatorType: "party" as const,
    status: "upcoming" as const,
    region: "Nairobi City County",
    voteOptions: ["Yes", "No"],
    requiredThreshold: "Simple county majority",
  },
  {
    id: "market-fees-petition",
    type: "petition" as const,
    title: "Review Market Stall Fees Petition",
    description:
      "Market traders are petitioning the county assembly to review stall fees, simplify payment channels, and provide written receipts for all collections. The petition asks for public consultation before new levies, improved sanitation services, and a dispute desk for traders facing irregular charges.",
    dates: "Signatures open until June 12, 2026",
    initiatorName: "Amina Otieno",
    initiatorType: "person" as const,
    status: "open" as const,
    region: "Mombasa County",
    voteOptions: ["Sign petition", "Do not sign"],
    requiredThreshold: "25,000 verified signatures",
  },
  {
    id: "forest-protection-vote",
    type: "referendum" as const,
    title: "Community Forest Protection Vote",
    description:
      "The referendum proposes stricter protection zones around community forests, penalties for illegal dumping, and a participatory replanting fund. Supporters argue it will protect water catchments and livelihoods, while opponents want clearer compensation rules for residents who depend on forest-adjacent land.",
    dates: "Voting: August 4-9, 2026",
    initiatorName: "Environment Restoration Alliance",
    initiatorType: "organization" as const,
    status: "upcoming" as const,
    region: "Central Region",
    voteOptions: ["Approve", "Reject", "Abstain"],
    requiredThreshold: "Two-thirds of participating wards",
  },
  {
    id: "health-clinic-hours",
    type: "petition" as const,
    title: "Extend Public Clinic Hours Petition",
    description:
      "Residents are asking county health offices to extend public clinic operating hours for working families, emergency maternal care, and chronic illness refills. The petition requests staffing plans, published opening hours, medicine stock reports, and a pilot program in high-demand clinics.",
    dates: "Closed: April 2026",
    initiatorName: "Community Health Watch",
    initiatorType: "organization" as const,
    status: "closed" as const,
    region: "Kisumu County",
    voteOptions: ["Sign petition", "Do not sign"],
    requiredThreshold: "15,000 verified signatures",
  },
  {
    id: "open-budget-portal",
    type: "referendum" as const,
    title: "Open Budget Portal Requirement",
    description:
      "This vote asks whether every county should maintain a public budget portal with project allocations, procurement milestones, contractor names, and completion status. The measure includes plain-language summaries and downloadable records for residents, journalists, and oversight groups.",
    dates: "Voting: September 2026",
    initiatorName: "Public Finance Forum",
    initiatorType: "organization" as const,
    status: "upcoming" as const,
    region: "National",
    voteOptions: ["Yes", "No"],
    requiredThreshold: "Simple majority",
  },
];

export default function PublicVotePage() {
  return (
    <main className="flex flex-1 bg-[#f7f8f3]">
      <PublicVoteBoard items={publicVoteItems} />
    </main>
  );
}
