import { GovernmentTree } from "@/components/government-structure/government-tree";

const holderImage =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80";

const governmentTree = [
  {
    id: "president",
    title: "President",
    description: "Head of state and national executive authority.",
    icon: "landmark",
    level: 1,
    officeType: "executive" as const,
    currentHolderId: "holder-president-current",
    location: "National Executive Office",
    termLength: "5 years, renewable once",
    appointmentMethod: "elected" as const,
    responsibilities: [
      "Leads the national executive and coordinates government priorities.",
      "Appoints cabinet officials according to constitutional procedures.",
      "Represents the country in national and international affairs.",
      "Assents to legislation or returns bills for reconsideration.",
    ],
    history: [
      {
        id: "holder-president-current",
        name: "Amani K. Njoroge",
        title: "President",
        imageUrl: holderImage,
        servedFrom: "2022",
        status: "current" as const,
        personalSummary:
          "Public administrator focused on digital services, infrastructure delivery, and citizen-facing reforms.",
        details: {
          dateOfBirth: "1971",
          education: "MA Public Policy",
          profession: "Public administrator",
          politicalAffiliation: "National Unity Alliance",
          homeRegion: "Central Region",
        },
        latestNews: [
          {
            title: "President announces digital service standards",
            source: "GOVZ News",
            date: "May 2026",
            link: "/stories/digital-service-standards",
          },
        ],
        merits: [
          "Expanded digital service access across county service centers.",
          "Published cabinet performance reporting framework.",
        ],
        demerits: [
          "Criticized for slow appointments in several oversight offices.",
          "Infrastructure delivery timelines remain uneven across regions.",
        ],
      },
      {
        id: "holder-president-former",
        name: "Daniel O. Mwangi",
        title: "President",
        servedFrom: "2017",
        servedTo: "2022",
        status: "former" as const,
        personalSummary:
          "Former national leader associated with transport investments and devolution reforms.",
        details: {
          education: "BA Economics",
          profession: "Economist",
          politicalAffiliation: "Reform Party",
          homeRegion: "Nairobi",
        },
        latestNews: [
          {
            title: "Former president joins regional mediation forum",
            source: "Civic Review",
            date: "April 2026",
            link: "/stories/regional-mediation-forum",
          },
        ],
        merits: ["Strengthened county transfer reporting."],
        demerits: ["Faced criticism over debt transparency."],
      },
    ],
    children: [
      {
        id: "cabinet-secretary-interior",
        title: "Cabinet Secretary, Interior",
        description: "Coordinates internal security and national administration.",
        icon: "shield",
        level: 2,
        parentId: "president",
        officeType: "ministry" as const,
        currentHolderId: "holder-interior-current",
        location: "Interior Ministry",
        termLength: "Serves by appointment",
        appointmentMethod: "appointed" as const,
        responsibilities: [
          "Oversees internal security policy and national administration.",
          "Coordinates emergency preparedness with security agencies.",
          "Supervises civil registration and public safety programs.",
        ],
        history: [
          {
            id: "holder-interior-current",
            name: "Miriam L. Achieng",
            title: "Cabinet Secretary, Interior",
            imageUrl:
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
            servedFrom: "2024",
            status: "current" as const,
            personalSummary:
              "Security policy specialist overseeing safety, registration, and national administration programs.",
            details: {
              education: "LLM Governance",
              profession: "Policy specialist",
              politicalAffiliation: "Independent",
              homeRegion: "Western Region",
            },
            latestNews: [
              {
                title: "Interior ministry updates registration desk hours",
                source: "GOVZ News",
                date: "May 2026",
                link: "/stories/registration-desk-hours",
              },
            ],
            merits: ["Improved emergency desk coordination."],
            demerits: ["Backlog remains in identity correction requests."],
          },
        ],
        children: [
          {
            id: "principal-secretary-registration",
            title: "Principal Secretary, Civil Registration",
            description: "Manages identity and civil registry services.",
            icon: "badge",
            level: 3,
            parentId: "cabinet-secretary-interior",
            officeType: "department" as const,
            currentHolderId: "holder-registration-current",
            location: "Civil Registration Department",
            appointmentMethod: "appointed" as const,
            responsibilities: [
              "Runs birth, death, and identity registration programs.",
              "Sets service standards for registry offices.",
              "Publishes reporting on identity document processing.",
            ],
            history: [
              {
                id: "holder-registration-current",
                name: "Joseph P. Kariuki",
                title: "Principal Secretary, Civil Registration",
                servedFrom: "2023",
                status: "current" as const,
                personalSummary:
                  "Career civil servant focused on registry digitization and access improvements.",
                details: {
                  education: "MPA",
                  profession: "Civil servant",
                  homeRegion: "Rift Valley",
                },
                latestNews: [
                  {
                    title: "Registry offices expand appointment booking",
                    source: "Public Service Desk",
                    date: "May 2026",
                    link: "/stories/registry-appointments",
                  },
                ],
                merits: ["Launched appointment booking in major registry offices."],
                demerits: ["Rural access points remain limited."],
              },
            ],
            children: [
              {
                id: "director-digital-id",
                title: "Director, Digital ID",
                description: "Leads digital identity systems and standards.",
                icon: "briefcase",
                level: 4,
                parentId: "principal-secretary-registration",
                officeType: "department" as const,
                currentHolderId: "holder-digital-id-current",
                location: "Digital Identity Unit",
                appointmentMethod: "career_service" as const,
                responsibilities: [
                  "Maintains digital identity enrollment systems.",
                  "Coordinates data protection standards for identity records.",
                  "Publishes status updates on digital ID rollout.",
                ],
                history: [
                  {
                    id: "holder-digital-id-current",
                    name: "Leah M. Mutiso",
                    title: "Director, Digital ID",
                    servedFrom: "2025",
                    status: "current" as const,
                    personalSummary:
                      "Technology program manager leading identity systems modernization.",
                    details: {
                      education: "BSc Computer Science",
                      profession: "Technology manager",
                      homeRegion: "Eastern Region",
                    },
                    latestNews: [
                      {
                        title: "Digital ID pilot expands to service centers",
                        source: "GOVZ News",
                        date: "May 2026",
                        link: "/stories/digital-id-rollout",
                      },
                    ],
                    merits: ["Improved service center enrollment dashboards."],
                    demerits: ["Citizen status notifications need improvement."],
                  },
                ],
                children: [
                  {
                    id: "county-registration-officer",
                    title: "County Registration Officer",
                    description: "Runs local identity registration service desks.",
                    icon: "building",
                    level: 5,
                    parentId: "director-digital-id",
                    officeType: "local_office" as const,
                    currentHolderId: "holder-county-registration-current",
                    location: "County Service Center",
                    appointmentMethod: "career_service" as const,
                    responsibilities: [
                      "Receives local identity applications and corrections.",
                      "Assists citizens with digital ID enrollment.",
                      "Reports service issues to the Digital ID Directorate.",
                    ],
                    history: [
                      {
                        id: "holder-county-registration-current",
                        name: "Peter S. Ouma",
                        title: "County Registration Officer",
                        servedFrom: "2024",
                        status: "current" as const,
                        personalSummary:
                          "Frontline registry officer supporting citizen enrollment and identity corrections.",
                        details: {
                          profession: "Registry officer",
                          homeRegion: "Nyanza Region",
                        },
                        latestNews: [
                          {
                            title: "County desk clears identity correction backlog",
                            source: "County Bulletin",
                            date: "April 2026",
                            link: "/stories/id-backlog",
                          },
                        ],
                        merits: ["Reduced walk-in wait times through queue scheduling."],
                        demerits: ["Limited staff coverage during peak application periods."],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "speaker-national-assembly",
        title: "Speaker, National Assembly",
        description: "Presides over legislative debates and house procedure.",
        icon: "gavel",
        level: 2,
        parentId: "president",
        officeType: "legislative" as const,
        currentHolderId: "holder-speaker-current",
        location: "Parliament",
        termLength: "Parliamentary term",
        appointmentMethod: "elected" as const,
        responsibilities: [
          "Presides over sittings of the National Assembly.",
          "Interprets house rules and maintains legislative order.",
          "Certifies bills and official house decisions.",
        ],
        history: [
          {
            id: "holder-speaker-current",
            name: "Sarah N. Kilonzo",
            title: "Speaker, National Assembly",
            servedFrom: "2022",
            status: "current" as const,
            personalSummary:
              "Legislative official focused on house procedure and public participation reforms.",
            details: {
              education: "LLB",
              profession: "Advocate",
              politicalAffiliation: "Non-partisan office",
              homeRegion: "Coast Region",
            },
            latestNews: [
              {
                title: "Assembly publishes public hearing calendar",
                source: "Parliament Desk",
                date: "May 2026",
                link: "/stories/hearing-calendar",
              },
            ],
            merits: ["Expanded live publication of committee schedules."],
            demerits: ["Opposition members criticized debate allocation rules."],
          },
        ],
      },
      {
        id: "chief-justice",
        title: "Chief Justice",
        description: "Heads judiciary and safeguards court administration.",
        icon: "scale",
        level: 2,
        parentId: "president",
        officeType: "judiciary" as const,
        currentHolderId: "holder-chief-justice-current",
        location: "Supreme Court",
        termLength: "Constitutional term",
        appointmentMethod: "appointed" as const,
        responsibilities: [
          "Leads the judiciary and chairs judicial administration bodies.",
          "Oversees court efficiency and access-to-justice reforms.",
          "Represents the judiciary in constitutional matters.",
        ],
        history: [
          {
            id: "holder-chief-justice-current",
            name: "Ibrahim A. Hassan",
            title: "Chief Justice",
            servedFrom: "2021",
            status: "current" as const,
            personalSummary:
              "Jurist known for court digitization, case backlog programs, and judicial training.",
            details: {
              education: "Doctor of Laws",
              profession: "Judge",
              homeRegion: "Northern Region",
            },
            latestNews: [
              {
                title: "Judiciary expands e-filing support desks",
                source: "Justice Bulletin",
                date: "May 2026",
                link: "/stories/e-filing-desks",
              },
            ],
            merits: ["Reduced backlog in selected high-volume court stations."],
            demerits: ["Access remains uneven in remote regions."],
          },
        ],
      },
    ],
  },
];

export default function GovernmentStructurePage() {
  return (
    <main className="flex flex-1 bg-[#f7f8f3]">
      <GovernmentTree nodes={governmentTree} />
    </main>
  );
}
