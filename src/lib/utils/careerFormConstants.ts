export interface ScreeningSetting {
  name: string;
  icon: string;
}

export interface Option {
  name: string;
}

export const SCREENING_SETTINGS: ScreeningSetting[] = [
  {
    name: "Good Fit and above",
    icon: "la la-check",
  },
  {
    name: "Only Strong Fit",
    icon: "la la-check-double",
  },
  {
    name: "No Automatic Promotion",
    icon: "la la-times",
  },
];

export const WORK_SETUP_OPTIONS: Option[] = [
  {
    name: "Fully Remote",
  },
  {
    name: "Onsite",
  },
  {
    name: "Hybrid",
  },
];

export const EMPLOYMENT_TYPE_OPTIONS: Option[] = [
  {
    name: "Full-Time",
  },
  {
    name: "Part-Time",
  },
];

export const TEAM_ROLE_OPTIONS: Option[] = [
  { name: "Job Owner" },
  { name: "Hiring Manager" },
  { name: "Recruiter" },
  { name: "Viewer" },
];

export const COUNTRY_OPTIONS: Option[] = [
  {
    name: "Philippines",
  },
];

export const DEFAULT_SCREENING_SETTING = "Good Fit and above";

// CV Form: Question type options
export const CV_QUESTION_TYPES = [
  { name: "Short Answer", icon: "la la-user" },
  { name: "Long Answer", icon: "la la-bars" },
  { name: "Dropdown", icon: "la la-chevron-circle-down" },
  { name: "Checkboxes", icon: "la la-check-square" },
  { name: "Range", icon: "la la-list-ol" },
];

// CV Form: Suggested pre-screening questions
export const CV_SUGGESTED_PRE_SCREENING_QUESTIONS = [
  {
    id: "notice-period",
    title: "Notice Period",
    question: "How long is your notice period?",
    defaultOptions: ["Immediately", "< 30 days", "> 30 days"],
  },
  {
    id: "work-setup",
    title: "Work Setup",
    question: "How often are you willing to report to the office?",
    defaultOptions: [
      "At most 1-2x a week",
      "At most 3-4x a week",
      "Open to fully onsite work",
      "Only open to fully remote work",
    ],
  },
  {
    id: "asking-salary",
    title: "Asking Salary",
    question: "How much is your expected monthly salary?",
    defaultOptions: [],
  },
];

