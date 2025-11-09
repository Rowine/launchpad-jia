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

