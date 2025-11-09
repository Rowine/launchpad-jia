import { useState, useEffect, useCallback } from "react";
import { readDraft } from "./useCareerFormSteps";
import { DEFAULT_SCREENING_SETTING } from "@/lib/utils/careerFormConstants";

export interface QuestionCategory {
  id: number;
  category: string;
  questionCountToAsk: number | null;
  questions: any[];
}

export interface TeamMember {
  name: string;
  email: string;
  image?: string;
  role: string;
  isYou?: boolean;
}

export interface PreScreeningQuestion {
  id: number;
  suggestedId: string | null;
  question: string;
  type: "Short Answer" | "Long Answer" | "Dropdown" | "Checkboxes" | "Range";
  options?: { id: number; value: string }[];
  minimumRange?: string;
  maximumRange?: string;
}

export interface CareerFormState {
  // Basic Information
  jobTitle: string;
  description: string;
  employmentType: string;
  workSetup: string;
  workSetupRemarks: string;
  
  // Location
  country: string;
  province: string;
  city: string;
  
  // Salary
  minimumSalary: number | null;
  maximumSalary: number | null;
  salaryNegotiable: boolean;
  
  // CV Screening
  cvScreeningSetting: string;
  cvSecretPrompt: string;
  
  // AI Interview
  aiInterviewScreeningSetting: string;
  aiInterviewSecretPrompt: string;
  requireVideo: boolean;
  questions: QuestionCategory[];
  
  // Team
  teamMembers: TeamMember[];

  // CV pre-screening questions (Step 2)
  preScreeningQuestions: PreScreeningQuestion[];
}

export interface CareerFormUIState {
  showSaveModal: string;
  isSavingCareer: boolean;
  aiQuestionsError: string;
  stepErrorIndex: number | null;
}

export interface LocationData {
  provinceList: any[];
  cityList: any[];
}

const DEFAULT_QUESTIONS: QuestionCategory[] = [
  {
    id: 1,
    category: "CV Validation / Experience",
    questionCountToAsk: null,
    questions: [],
  },
  {
    id: 2,
    category: "Technical",
    questionCountToAsk: null,
    questions: [],
  },
  {
    id: 3,
    category: "Behavioral",
    questionCountToAsk: null,
    questions: [],
  },
  {
    id: 4,
    category: "Analytical",
    questionCountToAsk: null,
    questions: [],
  },
  {
    id: 5,
    category: "Others",
    questionCountToAsk: null,
    questions: [],
  },
];

function getInitialFormState(career?: any): CareerFormState {
  const normalizeSalary = (value: any): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
  };
  return {
    jobTitle: career?.jobTitle || "",
    description: career?.description || "",
    workSetup: career?.workSetup || "",
    workSetupRemarks: career?.workSetupRemarks || "",
    cvScreeningSetting: career?.cvScreeningSetting || career?.screeningSetting || DEFAULT_SCREENING_SETTING,
    aiInterviewScreeningSetting: career?.aiInterviewScreeningSetting || career?.screeningSetting || DEFAULT_SCREENING_SETTING,
    cvSecretPrompt: career?.cvSecretPrompt || "",
    aiInterviewSecretPrompt: career?.aiInterviewSecretPrompt || "",
    employmentType: career?.employmentType || "",
    requireVideo: career?.requireVideo ?? true,
    salaryNegotiable: career?.salaryNegotiable ?? true,
    minimumSalary: normalizeSalary(career?.minimumSalary),
    maximumSalary: normalizeSalary(career?.maximumSalary),
    questions: career?.questions || DEFAULT_QUESTIONS,
    country: career?.country || "Philippines",
    province: career?.province || "",
    city: career?.location || "",
    teamMembers: [],
    preScreeningQuestions: Array.isArray(career?.preScreeningQuestions) ? career.preScreeningQuestions : [],
  };
}

export function useCareerFormState(career?: any, orgID?: string | null, user?: any) {
  const [formState, setFormState] = useState<CareerFormState>(() => getInitialFormState(career));
  const [uiState, setUIState] = useState<CareerFormUIState>({
    showSaveModal: "",
    isSavingCareer: false,
    aiQuestionsError: "",
    stepErrorIndex: null,
  });
  const [locationData, setLocationData] = useState<LocationData>({
    provinceList: [],
    cityList: [],
  });

  // Update a single field
  const updateField = useCallback(<K extends keyof CareerFormState>(
    field: K,
    value: CareerFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<CareerFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  // UI state updates
  const setShowSaveModal = useCallback((value: string) => {
    setUIState((prev) => ({ ...prev, showSaveModal: value }));
  }, []);

  const setIsSavingCareer = useCallback((value: boolean) => {
    setUIState((prev) => ({ ...prev, isSavingCareer: value }));
  }, []);

  const setAiQuestionsError = useCallback((value: string) => {
    setUIState((prev) => ({ ...prev, aiQuestionsError: value }));
  }, []);

  const setStepErrorIndex = useCallback((value: number | null) => {
    setUIState((prev) => ({ ...prev, stepErrorIndex: value }));
  }, []);

  // Location data updates
  const setProvinceList = useCallback((value: any[]) => {
    setLocationData((prev) => ({ ...prev, provinceList: value }));
  }, []);

  const setCityList = useCallback((value: any[]) => {
    setLocationData((prev) => ({ ...prev, cityList: value }));
  }, []);

  // Rehydrate from draft
  useEffect(() => {
    if (!orgID) return;
    
    const draft = readDraft(orgID);
    if (!draft) {
      // Initialize team members if no draft and user exists
      if (user && formState.teamMembers.length === 0) {
        setFormState((prev) => ({
          ...prev,
          teamMembers: [
            {
              name: user.name,
              email: user.email,
              image: user.image,
              role: "Job Owner",
              isYou: true,
            },
          ],
        }));
      }
      return;
    }

    const updates: Partial<CareerFormState> = {};
    
    if (draft.jobTitle) updates.jobTitle = draft.jobTitle;
    if (draft.description) updates.description = draft.description;
    if (draft.workSetup) updates.workSetup = draft.workSetup;
    if (typeof draft.workSetupRemarks !== "undefined") updates.workSetupRemarks = draft.workSetupRemarks;
    if (draft.cvScreeningSetting) updates.cvScreeningSetting = draft.cvScreeningSetting;
    if (draft.aiInterviewScreeningSetting) updates.aiInterviewScreeningSetting = draft.aiInterviewScreeningSetting;
    
    // Backwards compatibility
    if (draft.screeningSetting && !draft.cvScreeningSetting && !draft.aiInterviewScreeningSetting) {
      updates.cvScreeningSetting = draft.screeningSetting;
      updates.aiInterviewScreeningSetting = draft.screeningSetting;
    }
    
    if (draft.cvSecretPrompt) updates.cvSecretPrompt = draft.cvSecretPrompt;
    if (draft.aiInterviewSecretPrompt) updates.aiInterviewSecretPrompt = draft.aiInterviewSecretPrompt;
    if (typeof draft.requireVideo !== "undefined") updates.requireVideo = draft.requireVideo;
    if (typeof draft.salaryNegotiable !== "undefined") updates.salaryNegotiable = draft.salaryNegotiable;
    if (typeof draft.minimumSalary !== "undefined") updates.minimumSalary = draft.minimumSalary;
    if (typeof draft.maximumSalary !== "undefined") updates.maximumSalary = draft.maximumSalary;
    if (draft.country) updates.country = draft.country;
    if (draft.province) updates.province = draft.province;
    if (draft.location) updates.city = draft.location;
    if (draft.employmentType) updates.employmentType = draft.employmentType;
    if (Array.isArray(draft.teamMembers) && draft.teamMembers.length > 0) {
      updates.teamMembers = draft.teamMembers;
    }
    if (Array.isArray(draft.questions)) updates.questions = draft.questions;
    if (Array.isArray(draft.preScreeningQuestions)) updates.preScreeningQuestions = draft.preScreeningQuestions;

    if (Object.keys(updates).length > 0) {
      setFormState((prev) => ({ ...prev, ...updates }));
    }

    // Initialize team members if not in draft
    if (user && (!draft.teamMembers || !Array.isArray(draft.teamMembers) || draft.teamMembers.length === 0)) {
      setFormState((prev) => {
        if (prev.teamMembers.length === 0) {
          return {
            ...prev,
            teamMembers: [
              {
                name: user.name,
                email: user.email,
                image: user.image,
                role: "Job Owner",
                isYou: true,
              },
            ],
          };
        }
        return prev;
      });
    }
  }, [orgID, user]);

  return {
    // Form state
    formState,
    updateField,
    updateFields,
    
    // UI state
    uiState,
    setShowSaveModal,
    setIsSavingCareer,
    setAiQuestionsError,
    setStepErrorIndex,
    
    // Location data
    locationData,
    setProvinceList,
    setCityList,
  };
}

