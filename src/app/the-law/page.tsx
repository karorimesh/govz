import { LawChat } from "@/components/law/law-chat";

const latestLaws = [
  {
    title: "Digital Public Services Access Regulations",
    summary:
      "These regulations require public agencies to publish digital service standards, protect citizen records, and provide assisted access points for residents who cannot complete online applications without help.",
    dates: "Implemented: March 2026",
  },
  {
    title: "County Revenue Transparency Rules",
    summary:
      "County offices must publish fee schedules, payment channels, collection reports, and project allocations so residents can verify charges and track how local revenue supports public services.",
    dates: "Implementation: April-June 2026",
  },
  {
    title: "Public Participation Procedure Bill",
    summary:
      "The bill standardizes notice periods, hearing records, translation support, and feedback reporting before major national or county policies can be finalized by public bodies.",
    dates: "In committee: May 2026",
  },
  {
    title: "Data Protection Compliance Directive",
    summary:
      "Government departments handling citizen data must complete privacy audits, limit unnecessary data collection, publish retention periods, and appoint accountable officers for data requests.",
    dates: "Effective: May 2026",
  },
  {
    title: "Essential Services Response Standards",
    summary:
      "Agencies providing health, identification, licensing, emergency, and welfare services must publish response timelines, escalation contacts, and service interruption notices for the public.",
    dates: "Implementation starts: July 2026",
  },
];

export default function TheLawPage() {
  return (
    <main className="flex flex-1 bg-[#f7f8f3]">
      <LawChat laws={latestLaws} />
    </main>
  );
}
