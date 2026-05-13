import { HelpLineBoard } from "@/components/help-line/help-line-board";

const departments = [
  {
    id: "health-services",
    name: "Health Services Department",
    type: "department" as const,
    description:
      "Handles public health facilities, clinic access, medicine availability, inspections, and health service complaints.",
    handlesCategories: ["complaint", "service_request", "feedback"] as const,
    keywords: ["clinic", "hospital", "medicine", "health", "doctor", "nurse"],
    contact: {
      phone: "+254 700 100 001",
      email: "health@govz.example",
      physicalOffice: "Health Services Office",
    },
    serviceLevel: {
      low: "5 working days",
      medium: "3 working days",
      high: "24 hours",
      critical: "Immediate escalation",
    },
  },
  {
    id: "public-safety-emergency",
    name: "Public Safety And Emergency Response Office",
    type: "emergency_unit" as const,
    description:
      "Handles emergencies, public safety risks, urgent danger reports, and rapid escalation matters.",
    handlesCategories: ["emergency", "safety_concern"] as const,
    keywords: ["danger", "fire", "flood", "violence", "accident", "unsafe"],
    contact: {
      phone: "999",
      email: "emergency@govz.example",
      physicalOffice: "Emergency Operations Centre",
    },
    serviceLevel: {
      low: "24 hours",
      medium: "6 hours",
      high: "1 hour",
      critical: "Immediate response",
    },
  },
  {
    id: "anti-corruption-ethics",
    name: "Anti-Corruption And Ethics Office",
    type: "office" as const,
    description:
      "Handles bribery reports, misuse of public resources, unethical conduct, and integrity complaints.",
    handlesCategories: ["corruption_report", "complaint"] as const,
    keywords: ["bribe", "corruption", "fraud", "kickback", "ethics"],
    contact: {
      phone: "+254 700 100 002",
      email: "ethics@govz.example",
      physicalOffice: "Integrity House",
    },
    serviceLevel: {
      low: "7 working days",
      medium: "3 working days",
      high: "24 hours",
      critical: "Immediate escalation",
    },
  },
  {
    id: "roads-transport",
    name: "Roads And Transport Department",
    type: "department" as const,
    description:
      "Handles roads, public transport, drainage near roads, signage, traffic flow, and maintenance reports.",
    handlesCategories: ["complaint", "service_request", "safety_concern"] as const,
    keywords: ["road", "bus", "traffic", "drainage", "pothole", "signage"],
    contact: {
      phone: "+254 700 100 003",
      email: "transport@govz.example",
      physicalOffice: "Transport Works Office",
    },
    serviceLevel: {
      low: "10 working days",
      medium: "5 working days",
      high: "48 hours",
      critical: "Immediate escalation",
    },
  },
  {
    id: "water-sanitation",
    name: "Water And Sanitation Department",
    type: "department" as const,
    description:
      "Handles water interruptions, sewer issues, public sanitation concerns, drainage, and waste service reports.",
    handlesCategories: ["complaint", "service_request", "feedback"] as const,
    keywords: ["water", "sewer", "waste", "toilet", "sanitation", "garbage"],
    contact: {
      phone: "+254 700 100 004",
      email: "water@govz.example",
      physicalOffice: "Water Services Office",
    },
    serviceLevel: {
      low: "7 working days",
      medium: "3 working days",
      high: "24 hours",
      critical: "Immediate escalation",
    },
  },
  {
    id: "civil-registration-identity",
    name: "Civil Registration And Identity Office",
    type: "office" as const,
    description:
      "Handles birth records, death records, identity documents, registration corrections, and civil registry support.",
    handlesCategories: ["complaint", "service_request", "general_support"] as const,
    keywords: ["id", "identity", "birth", "death", "registration", "certificate"],
    contact: {
      phone: "+254 700 100 005",
      email: "registry@govz.example",
      physicalOffice: "Civil Registry Desk",
    },
    serviceLevel: {
      low: "7 working days",
      medium: "4 working days",
      high: "48 hours",
      critical: "Immediate escalation",
    },
  },
  {
    id: "education-services",
    name: "Education Services Department",
    type: "department" as const,
    description:
      "Handles school services, meals programs, facility concerns, learner support, and education service feedback.",
    handlesCategories: ["complaint", "service_request", "feedback"] as const,
    keywords: ["school", "student", "teacher", "meals", "classroom", "education"],
    contact: {
      phone: "+254 700 100 006",
      email: "education@govz.example",
      physicalOffice: "Education Services Office",
    },
    serviceLevel: {
      low: "7 working days",
      medium: "3 working days",
      high: "24 hours",
      critical: "Immediate escalation",
    },
  },
  {
    id: "social-protection",
    name: "Social Protection Office",
    type: "office" as const,
    description:
      "Handles welfare support, benefits access, disability support, older persons support, and vulnerable household assistance.",
    handlesCategories: ["complaint", "service_request", "general_support"] as const,
    keywords: ["welfare", "benefit", "disability", "elderly", "cash transfer"],
    contact: {
      phone: "+254 700 100 007",
      email: "social@govz.example",
      physicalOffice: "Social Protection Desk",
    },
    serviceLevel: {
      low: "10 working days",
      medium: "5 working days",
      high: "48 hours",
      critical: "Immediate escalation",
    },
  },
  {
    id: "county-administration",
    name: "County Administration Office",
    type: "office" as const,
    description:
      "Handles county office access, local administration concerns, public meetings, permits coordination, and cross-office follow-up.",
    handlesCategories: [
      "complaint",
      "service_request",
      "feedback",
      "general_support",
    ] as const,
    keywords: ["county", "permit", "administrator", "meeting", "office"],
    contact: {
      phone: "+254 700 100 008",
      email: "county@govz.example",
      physicalOffice: "County Administration Office",
    },
    serviceLevel: {
      low: "7 working days",
      medium: "3 working days",
      high: "24 hours",
      critical: "Immediate escalation",
    },
  },
  {
    id: "general-public-service",
    name: "General Public Service Desk",
    type: "office" as const,
    description:
      "Receives unclear, general, or cross-department support messages and routes them for follow-up.",
    handlesCategories: [
      "complaint",
      "service_request",
      "feedback",
      "general_support",
    ] as const,
    keywords: ["service", "office", "support", "help", "information"],
    contact: {
      phone: "+254 700 100 000",
      email: "help@govz.example",
      physicalOffice: "Citizen Support Desk",
    },
    serviceLevel: {
      low: "5 working days",
      medium: "3 working days",
      high: "24 hours",
      critical: "Immediate escalation",
    },
  },
];

export default function HelpLinePage() {
  return (
    <main className="flex flex-1 bg-[#f7f8f3]">
      <HelpLineBoard departmentTemplates={departments} />
    </main>
  );
}
