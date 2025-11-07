"use client"

import { useEffect, useRef, useState } from "react";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import CareerFormStepper from "@/lib/components/CareerComponents/CareerFormStepper";
import CareerFormDetails from "@/lib/components/CareerComponents/CareerFormDetails";
import CareerFormCV from "@/lib/components/CareerComponents/CareerFormCV";
import CareerFormAI from "@/lib/components/CareerComponents/CareerFormAI";
import CareerFormPipeline from "@/lib/components/CareerComponents/CareerFormPipeline";
import CareerFormReview from "@/lib/components/CareerComponents/CareerFormReview";
import { getStepFromUrl, setStepInUrl, readDraft, writeDraft, clearDraft } from "@/lib/hooks/useCareerFormSteps";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";
  // Setting List icons
  const screeningSettingList = [
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
const workSetupOptions = [
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

const employmentTypeOptions = [
    {
        name: "Full-Time",
    },
    {
        name: "Part-Time",
    },
];

const teamRoleOptions = [
    { name: "Job Owner" },
    { name: "Hiring Manager" },
    { name: "Recruiter" },
    { name: "Viewer" },
];

const countryOptions = [
    {
        name: "Philippines",
    },
];

type DetailsErrors = {
    jobTitle?: string;
    employmentType?: string;
    workSetup?: string;
    country?: string;
    province?: string;
    city?: string;
    minimumSalary?: string;
    maximumSalary?: string;
    description?: string;
};

export default function CareerForm({ career, formType, setShowEditModal }: { career?: any, formType: string, setShowEditModal?: (show: boolean) => void }) {
    const { user, orgID } = useAppContext();
    const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
    const [description, setDescription] = useState(career?.description || "");
    const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
    const [workSetupRemarks, setWorkSetupRemarks] = useState(career?.workSetupRemarks || "");
    const [screeningSetting, setScreeningSetting] = useState(career?.screeningSetting || "Good Fit and above");
    const [cvSecretPrompt, setCvSecretPrompt] = useState(career?.cvSecretPrompt || "");
    const [employmentType, setEmploymentType] = useState(career?.employmentType || "");
    const [requireVideo, setRequireVideo] = useState(career?.requireVideo || true);
    const [salaryNegotiable, setSalaryNegotiable] = useState(career?.salaryNegotiable || true);
    const [minimumSalary, setMinimumSalary] = useState(career?.minimumSalary || "");
    const [maximumSalary, setMaximumSalary] = useState(career?.maximumSalary || "");
    const [questions, setQuestions] = useState(career?.questions || [
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
    ]);
    const [country, setCountry] = useState(career?.country || "Philippines");
    const [province, setProvince] = useState(career?.province ||"");
    const [city, setCity] = useState(career?.location || "");
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [provinceList, setProvinceList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState("");
    const [isSavingCareer, setIsSavingCareer] = useState(false);
    const savingCareerRef = useRef(false);
    const [detailsErrors, setDetailsErrors] = useState<DetailsErrors>({});
    const [stepErrorIndex, setStepErrorIndex] = useState<number | null>(null);

    const clearErrors = (...fields: (keyof DetailsErrors)[]) => {
        setDetailsErrors((prev) => {
            if (!prev || Object.keys(prev).length === 0) {
                return prev;
            }
            const next = { ...prev };
            fields.forEach((field) => {
                delete next[field];
            });
            return next;
        });
    };

    const stripHtml = (value: string) => value?.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();

    const validateDetails = (): DetailsErrors => {
        const errors: DetailsErrors = {};
        if (!jobTitle?.trim()) errors.jobTitle = "This is a required field.";
        if (!employmentType?.trim()) errors.employmentType = "This is a required field.";
        if (!workSetup?.trim()) errors.workSetup = "This is a required field.";
        if (!country?.trim()) errors.country = "This is a required field.";
        if (!province?.trim()) errors.province = "This is a required field.";
        if (!city?.trim()) errors.city = "This is a required field.";

        const minimum = String(minimumSalary ?? "").trim();
        if (!minimum) errors.minimumSalary = "This is a required field.";

        const maximum = String(maximumSalary ?? "").trim();
        if (!maximum) errors.maximumSalary = "This is a required field.";

        const descriptionText = stripHtml(description || "");
        if (!descriptionText) errors.description = "This is a required field.";

        return errors;
    };

    const handleDetailsChange = (next: Partial<{
        jobTitle: string;
        employmentType: string;
        workSetup: string;
        country: string;
        province: string;
        city: string;
        salaryNegotiable: boolean;
        minimumSalary: string | number | null;
        maximumSalary: string | number | null;
    }>) => {
        if (typeof next.jobTitle !== "undefined") {
            const value = (next.jobTitle as string) || "";
            setJobTitle(value);
            if (value.trim()) {
                clearErrors("jobTitle");
            }
        }
        if (typeof next.employmentType !== "undefined") {
            const value = (next.employmentType as string) || "";
            setEmploymentType(value);
            if (value.trim()) {
                clearErrors("employmentType");
            }
        }
        if (typeof next.workSetup !== "undefined") {
            const value = (next.workSetup as string) || "";
            setWorkSetup(value);
            if (value.trim()) {
                clearErrors("workSetup");
            }
        }
        if (typeof next.country !== "undefined") {
            const value = (next.country as string) || "";
            setCountry(value);
            if (value.trim()) {
                clearErrors("country");
            }
        }
        if (typeof next.province !== "undefined") {
            const provinceValue = (next.province as string) || "";
            setProvince(provinceValue);
            if (provinceValue.trim()) {
                clearErrors("province");
            }
            if (!provinceValue.trim()) {
                setCityList([]);
                if (city) {
                    setCity("");
                }
            }
        }
        if (typeof next.city !== "undefined") {
            const value = (next.city as string) || "";
            setCity(value);
            if (value.trim()) {
                clearErrors("city");
            }
        }
        if (typeof next.salaryNegotiable !== "undefined") {
            setSalaryNegotiable(!!next.salaryNegotiable);
            if (next.salaryNegotiable) {
                clearErrors("minimumSalary", "maximumSalary");
            }
        }
        if (typeof next.minimumSalary !== "undefined") {
            setMinimumSalary(next.minimumSalary as any);
            const value = String(next.minimumSalary ?? "").trim();
            if (value) {
                clearErrors("minimumSalary");
            }
        }
        if (typeof next.maximumSalary !== "undefined") {
            setMaximumSalary(next.maximumSalary as any);
            const value = String(next.maximumSalary ?? "").trim();
            if (value) {
                clearErrors("maximumSalary");
            }
        }
    };

    const handleDescriptionChange = (text: string) => {
        setDescription(text);
        if (stripHtml(text || "")) {
            clearErrors("description");
        }
    };

    useEffect(() => {
        setProvinceList(philippineCitiesAndProvinces.provinces);
    }, []);

    useEffect(() => {
        if (Object.keys(detailsErrors).length === 0) {
            setStepErrorIndex(null);
        }
    }, [detailsErrors]);

    useEffect(() => {
        if (!provinceList.length) {
            return;
        }

        if (province && province.trim()) {
            const provinceObj: any = provinceList.find((p: any) => p.name === province);
            const cities: any[] = philippineCitiesAndProvinces.cities.filter((c: any) => c.province === (provinceObj?.key || ""));
            setCityList(cities);

            const cityInList = cities.some((c: any) => c.name === city);
            if (!cityInList && city) {
                setCity("");
            }
        } else {
            setCityList([]);
            if (city) {
                setCity("");
            }
        }
    }, [province, provinceList, city]);

    const isFormValid = () => {
        return jobTitle?.trim().length > 0 && description?.trim().length > 0 && workSetup?.trim().length > 0;
    }

  // Step handling
  const currentStep = typeof window !== "undefined" ? getStepFromUrl(1) : 1;

  const isStepValid = (step: number) => {
      switch (step) {
          case 1:
              return jobTitle?.trim().length > 0 && description?.trim().length > 0 && workSetup?.trim().length > 0 && employmentType?.trim().length > 0 && (!Number(minimumSalary) || !Number(maximumSalary) || Number(minimumSalary) <= Number(maximumSalary));
          case 2:
              return description?.trim().length > 0;
          case 3:
              return true;
          case 4:
              return true;
          case 5:
              return isFormValid();
          default:
              return false;
      }
  }

  const goToStep = (next: number) => setStepInUrl(Math.min(Math.max(next, 1), 5));

    

    const updateCareer = async (status: string) => {
        if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
            errorToast("Minimum salary cannot be greater than maximum salary", 1300);
            return;
        }
        let userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };
        const updatedCareer = {
            _id: career._id,
            jobTitle,
            description,
            workSetup,
            workSetupRemarks,
            questions,
            lastEditedBy: userInfoSlice,
            status,
            updatedAt: Date.now(),
            screeningSetting,
            cvSecretPrompt,
            requireVideo,
            salaryNegotiable,
            minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
            maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
            country,
            province,
            // Backwards compatibility
            location: city,
            employmentType,
        }
        try {
            setIsSavingCareer(true);
            const response = await axios.post("/api/update-career", updatedCareer);
            if (response.status === 200) {
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career updated</span>
                    </div>,
                    1300,
                <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
                setTimeout(() => {
                    window.location.href = `/recruiter-dashboard/careers/manage/${career._id}`;
                }, 1300);
            }
        } catch (error) {
            console.error(error);
            errorToast("Failed to update career", 1300);
        } finally {
            setIsSavingCareer(false);
        }
    }

  
    const confirmSaveCareer = (status: string) => {
        if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
        errorToast("Minimum salary cannot be greater than maximum salary", 1300);
        return;
        }

        setShowSaveModal(status);
    }

    const saveCareer = async (status: string) => {
        setShowSaveModal("");
        if (!status) {
          return;
        }

        if (!savingCareerRef.current) {
        setIsSavingCareer(true);
        savingCareerRef.current = true;
        let userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };
        const career = {
            jobTitle,
            description,
            workSetup,
            workSetupRemarks,
            questions,
            lastEditedBy: userInfoSlice,
            createdBy: userInfoSlice,
            screeningSetting,
            cvSecretPrompt,
            orgID,
            requireVideo,
            salaryNegotiable,
            minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
            maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
            country,
            province,
            // Backwards compatibility
            location: city,
            status,
            employmentType,
        }

        try {
            
            const response = await axios.post("/api/add-career", career);
            if (response.status === 200) {
            candidateActionToast(
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career added {status === "active" ? "and published" : ""}</span>
                </div>,
                1300, 
            <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
            setTimeout(() => {
                window.location.href = `/recruiter-dashboard/careers`;
            }, 1300);
            }
        } catch (error) {
            errorToast("Failed to add career", 1300);
        } finally {
            savingCareerRef.current = false;
            setIsSavingCareer(false);
        }
      }
    }

      useEffect(() => {
        // Rehydrate from draft
        const draft = readDraft(orgID);
        if (draft) {
          if (draft.jobTitle) setJobTitle(draft.jobTitle);
          if (draft.description) setDescription(draft.description);
          if (draft.workSetup) setWorkSetup(draft.workSetup);
          if (typeof draft.workSetupRemarks !== "undefined") setWorkSetupRemarks(draft.workSetupRemarks);
          if (draft.screeningSetting) setScreeningSetting(draft.screeningSetting);
          if (draft.cvSecretPrompt) setCvSecretPrompt(draft.cvSecretPrompt);
          if (typeof draft.requireVideo !== "undefined") setRequireVideo(draft.requireVideo);
          if (typeof draft.salaryNegotiable !== "undefined") setSalaryNegotiable(draft.salaryNegotiable);
          if (typeof draft.minimumSalary !== "undefined") setMinimumSalary(draft.minimumSalary);
          if (typeof draft.maximumSalary !== "undefined") setMaximumSalary(draft.maximumSalary);
          if (draft.country) setCountry(draft.country);
          if (draft.province) setProvince(draft.province);
          if (draft.location) setCity(draft.location);
          if (draft.employmentType) setEmploymentType(draft.employmentType);
          if (Array.isArray(draft.teamMembers) && draft.teamMembers.length > 0) setTeamMembers(draft.teamMembers);
          if (Array.isArray(draft.questions)) setQuestions(draft.questions);
        }
        if (user && teamMembers.length === 0) {
          setTeamMembers([
            {
              name: user.name,
              email: user.email,
              image: user.image,
              role: "Job Owner",
              isYou: true,
            },
          ]);
        }
      }, [user]);

    const handleSaveAndContinue = () => {
      if (currentStep === 1) {
        const validationErrors = validateDetails();
        setDetailsErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
          setStepErrorIndex(currentStep - 1);
          return;
        }
      } else if (!isStepValid(currentStep)) {
        setStepErrorIndex(currentStep - 1);
        return;
      }
      if (currentStep === 1) {
        setDetailsErrors({});
        setStepErrorIndex(null);
        writeDraft({ jobTitle, description, employmentType, workSetup, country, province, location: city, salaryNegotiable, minimumSalary, maximumSalary }, orgID);
        goToStep(2);
      } else if (currentStep === 2) {
        setStepErrorIndex(null);
        writeDraft({ screeningSetting, cvSecretPrompt }, orgID);
        goToStep(3);
      } else if (currentStep === 3) {
        setStepErrorIndex(null);
        writeDraft({ questions, requireVideo, screeningSetting }, orgID);
        goToStep(4);
      } else if (currentStep === 4) {
        setStepErrorIndex(null);
        writeDraft({ teamMembers }, orgID);
        goToStep(5);
      } else if (currentStep === 5) {
        setStepErrorIndex(null);
        confirmSaveCareer("active");
        clearDraft(orgID);
      }
    }

    const draftTitle = jobTitle?.trim() ? jobTitle : "Untitled Role";

    return (
        <div className="col">
        {formType === "add" ? (<div style={{ marginBottom: "12px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#181D27" }}>{currentStep === 2 ? `[Draft] ${draftTitle}` : "Add new career"}</h1>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                  <button
                  disabled={isSavingCareer}
                   style={{ width: "fit-content", color: isSavingCareer ? "#D5D7DA" : "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "10px 16px", borderRadius: "60px", cursor: isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontWeight: 700, fontSize: 14 }} onClick={() => {
                    confirmSaveCareer("inactive");
                      }}>
                          Save as Unpublished
                  </button>
                  <button 
                  disabled={isSavingCareer}
                  style={{ width: "fit-content", background: isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }} onClick={handleSaveAndContinue}>
                      <span style={{ display: "flex", alignItems: "center" }}>Save and Continue</span>
                    <i className="la la-arrow-right" style={{ color: "#fff", fontSize: 20 }}></i>
                  </button>
                </div>
        </div>) : (
            <div style={{ marginBottom: "12px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Edit Career Details</h1>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <button
                 style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => {
                  setShowEditModal?.(false);
                    }}>
                        Cancel
                </button>
                <button
                  disabled={isSavingCareer}
                   style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onClick={() => {
                    updateCareer("inactive");
                    }}>
                          Save as Unpublished
                  </button>
                <button
                  disabled={isSavingCareer}
                  style={{ width: "fit-content", background: isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }} onClick={handleSaveAndContinue}>
                        <span style={{ display: "flex", alignItems: "center" }}>Save and Continue</span>
                        <i className="la la-arrow-right" style={{ color: "#fff", fontSize: 20 }}></i>
                  </button>
              </div>
       </div>
        )}
        <div style={{ marginTop: 4, marginBottom: 12 }}>
            <CareerFormStepper currentStep={currentStep - 1} progressEnabled={isStepValid(currentStep)} errorStepIndex={stepErrorIndex} />
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
        <div style={{ width: "70%", display: "flex", flexDirection: "column", gap: 8 }}>
            {currentStep === 1 && (
              <CareerFormDetails
                value={{ jobTitle, employmentType, workSetup, country, province, city, salaryNegotiable, minimumSalary, maximumSalary }}
                onChange={handleDetailsChange}
                employmentTypeOptions={employmentTypeOptions}
                workSetupOptions={workSetupOptions}
                countryOptions={countryOptions}
                provinceList={provinceList}
                cityList={cityList}
                description={description}
                setDescription={handleDescriptionChange}
                teamMembers={teamMembers}
                setTeamMembers={setTeamMembers}
                teamRoleOptions={teamRoleOptions}
                errors={detailsErrors}
              />
            )}
            {currentStep === 2 && (
              <CareerFormCV
                jobTitle={jobTitle}
                screeningSetting={screeningSetting}
                setScreeningSetting={setScreeningSetting}
                screeningSettingList={screeningSettingList}
                cvSecretPrompt={cvSecretPrompt}
                setCvSecretPrompt={setCvSecretPrompt}
              />
            )}
            {currentStep === 3 && (
              <CareerFormAI
                questions={questions}
                setQuestions={setQuestions}
                requireVideo={requireVideo}
                setRequireVideo={setRequireVideo}
                screeningSetting={screeningSetting}
                setScreeningSetting={setScreeningSetting}
                screeningSettingList={screeningSettingList}
              />
            )}
            {currentStep === 4 && (
              <CareerFormPipeline
                teamMembers={teamMembers}
                setTeamMembers={setTeamMembers}
                teamRoleOptions={teamRoleOptions}
              />
            )}
            {currentStep === 5 && (
              <CareerFormReview
                summary={{ jobTitle, description, workSetup, workSetupRemarks, questions, screeningSetting, cvSecretPrompt, requireVideo, salaryNegotiable, minimumSalary, maximumSalary, country, province, location: city, employmentType, orgID }}
              />
            )}
        </div>

        <div style={{ width: "30%", display: "flex", flexDirection: "column", gap: 8 }}>
              {currentStep === 1 && (
              <div className="layered-card-middle">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 32, height: 32,display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.58333 16.6667H7.91667C7.91667 17.5833 7.16667 18.3333 6.25 18.3333C5.33333 18.3333 4.58333 17.5833 4.58333 16.6667ZM2.91667 15.8333H9.58333V14.1667H2.91667V15.8333ZM12.5 7.91667C12.5 11.1 10.2833 12.8 9.35833 13.3333H3.14167C2.21667 12.8 0 11.1 0 7.91667C0 4.46667 2.8 1.66667 6.25 1.66667C9.7 1.66667 12.5 4.46667 12.5 7.91667ZM10.8333 7.91667C10.8333 5.39167 8.775 3.33333 6.25 3.33333C3.725 3.33333 1.66667 5.39167 1.66667 7.91667C1.66667 9.975 2.90833 11.1583 3.625 11.6667H8.875C9.59167 11.1583 10.8333 9.975 10.8333 7.91667ZM16.5583 6.14167L15.4167 6.66667L16.5583 7.19167L17.0833 8.33333L17.6083 7.19167L18.75 6.66667L17.6083 6.14167L17.0833 5L16.5583 6.14167ZM14.5833 5L15.3667 3.28333L17.0833 2.5L15.3667 1.71667L14.5833 0L13.8 1.71667L12.0833 2.5L13.8 3.28333L14.5833 5Z" fill="url(#paint0_linear_310_3980)" />
                    <defs>
                      <linearGradient id="paint0_linear_310_3980" x1="-0.000291994" y1="18.3332" x2="18.3285" y2="-0.412159" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FCCEC0" />
                        <stop offset="0.33" stopColor="#EBACC9" />
                        <stop offset="0.66" stopColor="#CEB6DA" />
                        <stop offset="1" stopColor="#9FCAED" />
                      </linearGradient>
                    </defs>
                  </svg>
                  </div>
                      <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Tips</span>
                  </div>
                  <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16 }}>
                          <p style={{ margin: 0, color: "#181D27" }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>Use clear, standard job titles</span>
                              <span style={{ fontWeight: 500, color: "#717680", fontSize: 14 }}> for better searchability (e.g., "Software Engineer" instead of "Code Ninja" or "Tech Rockstar").</span>
                          </p>
                          <p style={{ margin: "12px 0 0 0", color: "#181D27" }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>Avoid abbreviations</span>
                              <span style={{ fontWeight: 500, color: "#717680", fontSize: 14 }}> or internal role codes that applicants may not understand (e.g., use "QA Engineer" instead of "QE II" or "QA‑TL").</span>
                          </p>
                          <p style={{ margin: "12px 0 0 0", color: "#181D27" }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>Keep it concise</span>
                              <span style={{ fontWeight: 500, color: "#717680", fontSize: 14 }}> — job titles should be no more than a few words (2—4 max), avoiding fluff or marketing terms.</span>
                          </p>
                      </div>
                  </div>
              </div>
              )}
              {currentStep === 2 && (
              <div className="layered-card-middle">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 32, height: 32,display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.58333 16.6667H7.91667C7.91667 17.5833 7.16667 18.3333 6.25 18.3333C5.33333 18.3333 4.58333 17.5833 4.58333 16.6667ZM2.91667 15.8333H9.58333V14.1667H2.91667V15.8333ZM12.5 7.91667C12.5 11.1 10.2833 12.8 9.35833 13.3333H3.14167C2.21667 12.8 0 11.1 0 7.91667C0 4.46667 2.8 1.66667 6.25 1.66667C9.7 1.66667 12.5 4.46667 12.5 7.91667ZM10.8333 7.91667C10.8333 5.39167 8.775 3.33333 6.25 3.33333C3.725 3.33333 1.66667 5.39167 1.66667 7.91667C1.66667 9.975 2.90833 11.1583 3.625 11.6667H8.875C9.59167 11.1583 10.8333 9.975 10.8333 7.91667ZM16.5583 6.14167L15.4167 6.66667L16.5583 7.19167L17.0833 8.33333L17.6083 7.19167L18.75 6.66667L17.6083 6.14167L17.0833 5L16.5583 6.14167ZM14.5833 5L15.3667 3.28333L17.0833 2.5L15.3667 1.71667L14.5833 0L13.8 1.71667L12.0833 2.5L13.8 3.28333L14.5833 5Z" fill="url(#paint0_linear_310_3980)" />
                    <defs>
                      <linearGradient id="paint0_linear_310_3980" x1="-0.000291994" y1="18.3332" x2="18.3285" y2="-0.412159" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FCCEC0" />
                        <stop offset="0.33" stopColor="#EBACC9" />
                        <stop offset="0.66" stopColor="#CEB6DA" />
                        <stop offset="1" stopColor="#9FCAED" />
                      </linearGradient>
                    </defs>
                  </svg>
                  </div>
                      <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Tips</span>
                  </div>
                  <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16 }}>
                          <p style={{ margin: 0, color: "#181D27" }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>Add a Secret Prompt</span>
                              <span style={{ fontWeight: 500, color: "#717680", fontSize: 14 }}> to fine-tune how Jia scores and evaluates submitted CVs.</span>
                          </p>
                          <p style={{ margin: "12px 0 0 0", color: "#181D27" }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>Add Pre-Screening questions</span>
                              <span style={{ fontWeight: 500, color: "#717680", fontSize: 14 }}> to collect key details such as notice period, work setup, or salary expectations to guide your review and candidate discussions.</span>
                          </p>
                      </div>
                  </div>
              </div>
              )}
          </div>
      </div>
      {showSaveModal && (
         <CareerActionModal action={showSaveModal} onAction={(action) => saveCareer(action)} />
        )}
    {isSavingCareer && (
        <FullScreenLoadingAnimation title={formType === "add" ? "Saving career..." : "Updating career..."} subtext={`Please wait while we are ${formType === "add" ? "saving" : "updating"} the career`} />
    )}
    </div>
    )
}