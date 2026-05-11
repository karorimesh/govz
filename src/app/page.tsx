import { TopStories } from "@/components/home/top-stories";

const stories = [
  {
    title: "National digital ID rollout expands to county service centers",
    imgLink:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    summary:
      "County service centers will begin supporting digital ID enrollment this month, giving residents more locations to verify documents, update personal records, and track application status. Officials say the expansion should reduce wait times and make core government services easier to access outside major administrative offices.",
    author: "Public Service Desk",
    link: "/stories/digital-id-rollout",
  },
  {
    title: "Parliament committee opens public submissions on finance bill",
    imgLink:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80",
    summary:
      "Citizens, businesses, and civil society groups can submit comments on the proposed finance bill through regional hearings and the online public participation portal. The committee will publish a hearing schedule and summary report before the final debate.",
    author: "Legislative Affairs",
    link: "/stories/finance-bill-submissions",
  },
  {
    title: "New public health inspection schedule released",
    imgLink:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    summary:
      "The Ministry of Health has published updated inspection dates for restaurants, clinics, markets, and community facilities. Operators are encouraged to review requirements early and keep compliance documents available for field officers.",
    author: "Health Directorate",
    link: "/stories/health-inspection-schedule",
  },
  {
    title: "Road maintenance teams prioritize flood-prone corridors",
    imgLink:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    summary:
      "Transport officials have mapped priority repairs on roads affected by seasonal flooding. Crews will focus on drainage, resurfacing, and signage in high-risk corridors while traffic teams coordinate temporary diversions.",
    author: "Transport Office",
    link: "/stories/road-maintenance-corridors",
  },
  {
    title: "Youth enterprise grants portal reopens for applications",
    imgLink:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
    summary:
      "Eligible youth-led businesses can now apply for enterprise grants through the GOVZ portal. Applicants should prepare registration documents, tax details, and a short business plan before starting the form.",
    author: "Enterprise Agency",
    link: "/stories/youth-enterprise-grants",
  },
  {
    title: "Voter education forums scheduled in all wards",
    imgLink:
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=900&q=80",
    summary:
      "The electoral office will host ward-level voter education forums covering registration checks, polling procedures, accessibility support, and official channels for reporting election concerns.",
    author: "Election Services",
    link: "/stories/voter-education-forums",
  },
  {
    title: "Agriculture office issues advisory on subsidized fertilizer",
    imgLink:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    summary:
      "Farmers can verify eligibility for subsidized fertilizer through local agriculture offices and the GOVZ farmer registry. Distribution points will publish daily stock updates during the planting season.",
    author: "Agriculture Desk",
    link: "/stories/fertilizer-advisory",
  },
  {
    title: "County budget dashboard adds project tracking",
    imgLink:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    summary:
      "Residents can now review budget allocations and implementation status for local projects. The dashboard includes department spending, project milestones, contractor details, and public feedback channels.",
    author: "Open Data Team",
    link: "/stories/budget-dashboard",
  },
];

export default function Home() {
  return (
    <main aria-label="GOVZ home" className="flex flex-1 bg-[#f7f8f3]">
      <TopStories stories={stories} />
    </main>
  );
}
