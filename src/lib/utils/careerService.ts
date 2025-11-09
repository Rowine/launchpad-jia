import axios from "axios";
import { CareerFormState } from "@/lib/hooks/useCareerFormState";
import { validateSalaryRange } from "./careerFormValidation";

export interface UserInfo {
  image?: string;
  name: string;
  email: string;
}

export interface CareerPayload {
  _id?: string;
  jobTitle: string;
  description: string;
  workSetup: string;
  workSetupRemarks: string;
  questions: any[];
  preScreeningQuestions?: any[];
  lastEditedBy: UserInfo;
  createdBy?: UserInfo;
  status: string;
  updatedAt?: number;
  cvScreeningSetting: string;
  aiInterviewScreeningSetting: string;
  cvSecretPrompt: string;
  aiInterviewSecretPrompt: string;
  requireVideo: boolean;
  salaryNegotiable: boolean;
  minimumSalary: number | null;
  maximumSalary: number | null;
  country: string;
  province: string;
  location: string;
  employmentType: string;
  orgID?: string;
}

export class CareerService {
  /**
   * Normalizes salary value to number or null
   */
  static normalizeSalary(value: string | number): number | null {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Creates user info slice from user object
   */
  static createUserInfoSlice(user: any): UserInfo {
    return {
      image: user?.image,
      name: user?.name || "",
      email: user?.email || "",
    };
  }

  /**
   * Builds career payload from form state
   */
  static buildCareerPayload(
    formState: CareerFormState,
    user: any,
    orgID: string,
    status: string,
    careerId?: string
  ): CareerPayload {
    const userInfoSlice = this.createUserInfoSlice(user);

    const payload: CareerPayload = {
      jobTitle: formState.jobTitle,
      description: formState.description,
      workSetup: formState.workSetup,
      workSetupRemarks: formState.workSetupRemarks,
      questions: formState.questions,
      preScreeningQuestions: formState.preScreeningQuestions,
      lastEditedBy: userInfoSlice,
      status,
      cvScreeningSetting: formState.cvScreeningSetting,
      aiInterviewScreeningSetting: formState.aiInterviewScreeningSetting,
      cvSecretPrompt: formState.cvSecretPrompt,
      aiInterviewSecretPrompt: formState.aiInterviewSecretPrompt,
      requireVideo: formState.requireVideo,
      salaryNegotiable: formState.salaryNegotiable,
      minimumSalary: this.normalizeSalary(formState.minimumSalary),
      maximumSalary: this.normalizeSalary(formState.maximumSalary),
      country: formState.country,
      province: formState.province,
      location: formState.city,
      employmentType: formState.employmentType,
    };

    if (careerId) {
      payload._id = careerId;
      payload.updatedAt = Date.now();
    } else {
      payload.createdBy = userInfoSlice;
      payload.orgID = orgID;
    }

    return payload;
  }

  /**
   * Validates salary range before submission
   */
  static validateBeforeSave(
    minimumSalary: string | number,
    maximumSalary: string | number
  ): boolean {
    return validateSalaryRange(minimumSalary, maximumSalary);
  }

  /**
   * Creates a new career
   */
  static async createCareer(payload: CareerPayload): Promise<any> {
    const response = await axios.post("/api/add-career", payload);
    return response.data;
  }

  /**
   * Updates an existing career
   */
  static async updateCareer(payload: CareerPayload): Promise<any> {
    const response = await axios.post("/api/update-career", payload);
    return response.data;
  }
}

