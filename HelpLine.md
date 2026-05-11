# Help Line

The Help Line receives anonymous public messages about public services, complaints, requests, safety concerns, corruption reports, emergencies, and general government support needs.

Sender details may be provided, but they must be masked in the public or staff-facing interface unless a verified authorized officer needs access.

## Help Line Message Schema

Each anonymous public message should use this shape:

```ts
{
  id: string;
  title: string;
  message: string;
  category:
    | "complaint"
    | "service_request"
    | "corruption_report"
    | "safety_concern"
    | "emergency"
    | "feedback"
    | "general_support";
  urgency: "low" | "medium" | "high" | "critical";
  status: "new" | "triaged" | "assigned" | "in_progress" | "resolved" | "closed";
  location?: {
    county?: string;
    constituency?: string;
    ward?: string;
    addressText?: string;
  };
  sender?: {
    name?: string;
    phone?: string;
    email?: string;
    nationalId?: string;
    preferredContact?: "phone" | "email" | "none";
  };
  maskedSender: {
    name?: string;
    phone?: string;
    email?: string;
    nationalId?: string;
  };
  attachments?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    url: string;
  }>;
  classification: {
    departmentId: string;
    officeId?: string;
    confidence: number;
    reason: string;
  };
  submittedAt: string;
  updatedAt: string;
}
```

## Department Or Office Schema

Departments and offices classify and handle incoming help line messages.

```ts
{
  id: string;
  name: string;
  type: "department" | "office" | "agency" | "emergency_unit";
  description: string;
  handlesCategories: Array<
    | "complaint"
    | "service_request"
    | "corruption_report"
    | "safety_concern"
    | "emergency"
    | "feedback"
    | "general_support"
  >;
  keywords: string[];
  contact: {
    phone?: string;
    email?: string;
    physicalOffice?: string;
  };
  escalationOfficeId?: string;
  serviceLevel: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
}
```

## Suggested Departments And Offices

- Health Services Department
- Public Safety And Emergency Response Office
- Anti-Corruption And Ethics Office
- Roads And Transport Department
- Water And Sanitation Department
- Civil Registration And Identity Office
- Education Services Department
- Social Protection Office
- County Administration Office
- General Public Service Desk

## Masking Rules

- Do not display raw sender details by default.
- Mask phone numbers, emails, names, and national IDs.
- Example phone mask: `+254 7** *** 123`.
- Example email mask: `jo***@example.com`.
- Example national ID mask: `12****78`.
- If no sender details are provided, show `Anonymous`.

## Classification Rules

- Classify messages using category, urgency, location, keywords, and message content.
- Assign emergency or critical safety messages to emergency units first.
- Assign corruption reports to the Anti-Corruption And Ethics Office.
- Assign health service complaints or requests to the Health Services Department.
- Assign infrastructure concerns about roads, public transport, drainage, or signage to Roads And Transport.
- Assign unresolved or unclear messages to the General Public Service Desk.

## Interface Requirements

- Provide a public anonymous message form.
- Allow optional sender details.
- Show a clear privacy notice explaining that sender details are masked.
- Show message category and urgency selectors.
- Show a list or board of submitted messages using masked sender details.
- Show the assigned department or office for each message.
- Include search and filtering by category, urgency, status, department, and location.
- Use dummy data until a real backend is connected.

## Future Integration Notes

- Messages and departments can later be stored in Firebase.
- Classification can later use server-side OpenAI assistance.
- Sensitive sender details should be protected with strict access controls.
- Attachments should be scanned and stored securely.
