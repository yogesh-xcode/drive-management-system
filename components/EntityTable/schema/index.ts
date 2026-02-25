import { FieldDef } from "@/components/SidePeak";

const programFields: FieldDef[] = [
  {
    name: "client",
    label: "Client Name",
    required: true,
    placeholder: "Vertex Labs",
  },
  {
    name: "contact",
    label: "Contact Email",
    type: "email",
    placeholder: "contact@vertexlabs.com",
  },
  {
    name: "programNo",
    label: "Program No",
    type: "number",
    placeholder: "24312",
  },
  {
    name: "opening",
    label: "Openings",
    type: "number",
    placeholder: "4",
  },
  {
    name: "date",
    label: "Date",
    type: "date",
  },
];

const candidateFields: FieldDef[] = [
  {
    name: "fullName",
    label: "Full Name",
    required: true,
    placeholder: "Alice Sharma",
  },
  {
    name: "position",
    label: "Position",
    required: true,
    placeholder: "Software Engineer",
  },
  {
    name: "status",
    label: "Status",
    required: true,
    placeholder: "Interviewed",
  },
  {
    name: "appliedDate",
    label: "Applied Date",
    type: "date",
    required: true,
    placeholder: "2025-07-18",
  },
];

const staffFields: FieldDef[] = [
  {
    name: "name",
    label: "Staff Name",
    required: true,
    placeholder: "Surya Prakash",
  },
  {
    name: "department",
    label: "Department",
    required: true,
    placeholder: "Engineering",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "example@company.com",
  },
  {
    name: "joinedDate",
    label: "Joined Date",
    type: "date",
    required: true,
    placeholder: "2020-01-01",
  },
];

const driveFields: FieldDef[] = [
  {
    name: "title",
    label: "Drive Title",
    required: true,
    placeholder: "Campus Recruitment Drive",
  },
  {
    name: "location",
    label: "Location",
    required: true,
    placeholder: "Bangalore, India",
  },
  {
    name: "status",
    label: "Status",
    type: "select", // ✅ dropdown
    options: [
      { label: "Scheduled", value: "Scheduled" },
      { label: "Ongoing", value: "Ongoing" },
      { label: "Completed", value: "Completed" },
    ],
    required: true,
    placeholder: "Select status",
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    required: true,
    placeholder: "2025-09-12",
  },
];

export { programFields, candidateFields, staffFields, driveFields };
