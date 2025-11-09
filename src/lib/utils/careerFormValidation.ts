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

  const minimum = String(formState.minimumSalary ?? "").trim();
  if (!minimum) {
    errors.minimumSalary = "This is a required field.";
  }

  const maximum = String(formState.maximumSalary ?? "").trim();
  if (!maximum) {
    errors.maximumSalary = "This is a required field.";
  }

  const descriptionText = stripHtml(formState.description || "");
  if (!descriptionText) {
    errors.description = "This is a required field.";
  }

  return errors;
};

export const validateSalaryRange = (
  minimumSalary: string | number,
  maximumSalary: string | number
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

