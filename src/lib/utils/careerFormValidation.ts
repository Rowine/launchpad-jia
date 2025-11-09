import { CareerFormState } from "@/lib/hooks/useCareerFormState";

export interface ValidationErrors {
  jobTitle?: string;
  employmentType?: string;
  workSetup?: string;
  country?: string;
  province?: string;
  city?: string;
  minimumSalary?: string;
  maximumSalary?: string;
  description?: string;
}

export const stripHtml = (value: string): string => {
  return value?.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
};

export const validateDetails = (formState: CareerFormState): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!formState.jobTitle?.trim()) {
    errors.jobTitle = "This is a required field.";
  }
  if (!formState.employmentType?.trim()) {
    errors.employmentType = "This is a required field.";
  }
  if (!formState.workSetup?.trim()) {
    errors.workSetup = "This is a required field.";
  }
  if (!formState.country?.trim()) {
    errors.country = "This is a required field.";
  }
  if (!formState.province?.trim()) {
    errors.province = "This is a required field.";
  }
  if (!formState.city?.trim()) {
    errors.city = "This is a required field.";
  }

  // Salary required only when not negotiable
  if (!formState.salaryNegotiable) {
    const minPresent = formState.minimumSalary !== null && formState.minimumSalary !== undefined;
    const maxPresent = formState.maximumSalary !== null && formState.maximumSalary !== undefined;
    if (!minPresent) {
      errors.minimumSalary = "This is a required field.";
    }
    if (!maxPresent) {
      errors.maximumSalary = "This is a required field.";
    }
  }

  const descriptionText = stripHtml(formState.description || "");
  if (!descriptionText) {
    errors.description = "This is a required field.";
  }

  return errors;
};

export const validateSalaryRange = (
  minimumSalary: number | string | null,
  maximumSalary: number | string | null
): boolean => {
  const min = Number(minimumSalary);
  const max = Number(maximumSalary);
  return !min || !max || min <= max;
};

export const isFormValid = (formState: CareerFormState): boolean => {
  return (
    formState.jobTitle?.trim().length > 0 &&
    formState.description?.trim().length > 0 &&
    formState.workSetup?.trim().length > 0
  );
};

export const validateStep = (step: number, formState: CareerFormState): boolean => {
  switch (step) {
    case 1:
      return (
        formState.jobTitle?.trim().length > 0 &&
        formState.description?.trim().length > 0 &&
        formState.workSetup?.trim().length > 0 &&
        formState.employmentType?.trim().length > 0 &&
        validateSalaryRange(formState.minimumSalary, formState.maximumSalary)
      );
    case 2:
      return formState.description?.trim().length > 0;
    case 3:
      return (
        formState.questions.reduce(
          (acc, group) => acc + (Array.isArray(group.questions) ? group.questions.length : 0),
          0
        ) >= 5
      );
    case 4:
      return true;
    case 5:
      return isFormValid(formState);
    default:
      return false;
  }
};

// Detailed per-step validation used by the wizard to drive UI errors
export type StepValidationResult = {
  valid: boolean;
  errors?: ValidationErrors;
  aiQuestionsError?: string;
};

export const validateStepResult = (step: number, formState: CareerFormState): StepValidationResult => {
  switch (step) {
    case 1: {
      const errors = validateDetails(formState);
      // Salary ordering validation when both are present
      const min = Number(formState.minimumSalary);
      const max = Number(formState.maximumSalary);
      if (!!min && !!max && min > max) {
        errors.minimumSalary = "Minimum salary cannot be greater than maximum salary.";
        errors.maximumSalary = "Minimum salary cannot be greater than maximum salary.";
      }
      return { valid: Object.keys(errors).length === 0, errors };
    }
    case 2: {
      // No required fields for CV section beyond what Step 1 enforced
      return { valid: true };
    }
    case 3: {
      const totalQuestions = formState.questions.reduce(
        (acc, group) => acc + (Array.isArray(group.questions) ? group.questions.length : 0),
        0
      );
      if (totalQuestions < 5) {
        return { valid: false, aiQuestionsError: "Please add at least 5 interview questions." };
      }
      return { valid: true };
    }
    case 4: {
      return { valid: true };
    }
    case 5: {
      // Final check can reuse step 1 + step 3 core requirements
      const step1 = validateStepResult(1, formState);
      const step3 = validateStepResult(3, formState);
      return {
        valid: step1.valid && step3.valid,
        errors: step1.errors,
        aiQuestionsError: step3.aiQuestionsError,
      };
    }
    default:
      return { valid: false };
  }
};

