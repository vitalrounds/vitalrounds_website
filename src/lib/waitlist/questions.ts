export type SurveyQuestion = {
  id: string;
  questionNumber: number;
  prompt: string;
  kind: "single" | "multi";
  options: string[];
  /** multi only */
  maxSelections?: number;
  /** optional user-facing hint below options */
  helper?: string;
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "situation",
    questionNumber: 1,
    prompt: "What best describes your current situation?",
    kind: "single",
    options: [
      "IMG — currently living in Australia",
      "IMG — planning to relocate to Australia",
      "IMG — overseas, exploring options",
      "Australian graduate with an experience gap",
      "Other healthcare professional",
    ],
  },
  {
    id: "amcPathway",
    questionNumber: 2,
    prompt: "Where are you in the AMC / registration pathway?",
    kind: "single",
    options: [
      "Haven't started AMC yet",
      "Preparing for AMC Part 1",
      "AMC Part 1 passed",
      "AMC Part 1 & Part 2 passed",
      "On a college specialist pathway",
      "Already provisionally registered",
    ],
  },
  {
    id: "clinicalYears",
    questionNumber: 3,
    prompt:
      "How many years of clinical experience do you have (from your home country)?",
    kind: "single",
    options: [
      "Less than 1 year",
      "1–3 years",
      "3–5 years",
      "5–10 years",
      "More than 10 years",
    ],
  },
  {
    id: "specialties",
    questionNumber: 4,
    prompt: "Which specialty or department are you most interested in observing?",
    kind: "multi",
    maxSelections: 3,
    options: [
      "General medicine",
      "Family medicine / GP",
      "Emergency medicine",
      "Surgery (general)",
      "Paediatrics",
      "Obstetrics & gynaecology",
      "Psychiatry",
      "Cardiology",
      "Orthopaedics",
      "Anaesthetics",
      "Radiology",
      "Oncology",
      "Open to any department",
    ],
    helper:
      "Up to 3 selections. This shapes which hospital departments VitalRounds prioritises in its partnerships.",
  },
  {
    id: "programLength",
    questionNumber: 5,
    prompt: "What is your preferred program length?",
    kind: "single",
    options: ["2 weeks", "4 weeks", "6–8 weeks", "3 months", "Flexible / open to any"],
  },
  {
    id: "startTiming",
    questionNumber: 6,
    prompt: "When are you looking to start?",
    kind: "single",
    options: [
      "As soon as possible",
      "Within 1–3 months",
      "Within 3–6 months",
      "6–12 months from now",
      "Just exploring for now",
    ],
  },
  {
    id: "budget",
    questionNumber: 7,
    prompt: "What is your approximate budget for an observership program?",
    kind: "single",
    options: [
      "Under $1,500",
      "$1,500 – $2,500",
      "$2,500 – $4,000",
      "$4,000 – $6,000",
      "Budget is not a constraint",
    ],
  },
  {
    id: "priorApplications",
    questionNumber: 8,
    prompt: "Have you previously applied to any of the following programs?",
    kind: "multi",
    options: [
      "Monash Health Observership",
      "Austin Health Observership",
      "Northern Hospital Observership",
      "Another Australian program",
      "I haven't applied to any yet",
    ],
  },
  {
    id: "based",
    questionNumber: 9,
    prompt: "Where are you currently based?",
    kind: "single",
    options: [
      "Melbourne — metro",
      "Victoria — regional",
      "Another Australian state",
      "New Zealand",
      "Overseas — Asia Pacific",
      "Overseas — Middle East",
      "Overseas — other",
    ],
  },
  {
    id: "priorities",
    questionNumber: 10,
    prompt: "What matters most to you in an observership program?",
    kind: "multi",
    options: [
      "Building a local clinical referee",
      "Hands-on exposure to Australian workflows",
      "Strengthening my AHPRA application",
      "AMC Part 2 preparation",
      "Networking with Australian doctors",
      "Certificate of completion",
      "Exposure to a specific specialty",
    ],
  },
  {
    id: "referralSource",
    questionNumber: 11,
    prompt: "How did you hear about VitalRounds?",
    kind: "single",
    options: [
      "Google search",
      "Facebook group",
      "LinkedIn",
      "Word of mouth / referral",
      "Reddit",
      "WhatsApp group",
      "Other",
    ],
  },
];

export const SPECIALTY_OPTIONS = SURVEY_QUESTIONS.find((q) => q.id === "specialties")!
  .options;
