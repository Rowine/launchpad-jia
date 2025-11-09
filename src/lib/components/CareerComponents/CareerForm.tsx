"use client"

import { useEffect, useRef, useState } from "react";
import CareerFormStepper from "@/lib/components/CareerComponents/CareerFormStepper";
import CareerFormDetails from "@/lib/components/CareerComponents/CareerFormDetails";
import CareerFormCV from "@/lib/components/CareerComponents/CareerFormCV";
import CareerFormAI from "@/lib/components/CareerComponents/CareerFormAI";
import CareerFormPipeline from "@/lib/components/CareerComponents/CareerFormPipeline";
import CareerFormReview from "@/lib/components/CareerComponents/CareerFormReview";
import { getStepFromUrl, setStepInUrl, writeDraft, clearDraft } from "@/lib/hooks/useCareerFormSteps";
import { useCareerFormState } from "@/lib/hooks/useCareerFormState";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";
import CareerFormTips from "./CareerFormTips";
import {
  SCREENING_SETTINGS,
  WORK_SETUP_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  TEAM_ROLE_OPTIONS,
  COUNTRY_OPTIONS,
} from "@/lib/utils/careerFormConstants";
import {
  ValidationErrors,
  validateDetails,
  validateStep,
  stripHtml,
} from "@/lib/utils/careerFormValidation";

type DetailsErrors = ValidationErrors;

export default function CareerForm({ career, formType, setShowEditModal }: { career?: any, formType: string, setShowEditModal?: (show: boolean) => void }) {
    const { user, orgID } = useAppContext();
    
    // Use the custom hook for form state management
    const {
        formState,
        updateField,
        updateFields,
        uiState,
        setShowSaveModal,
        setIsSavingCareer,
        setAiQuestionsError,
        setStepErrorIndex,
        locationData,
        setProvinceList,
        setCityList,
    } = useCareerFormState(career, orgID, user);

    // Destructure formState for easier access
    const {
        jobTitle,
        description,
        workSetup,
        workSetupRemarks,
        cvScreeningSetting,
        aiInterviewScreeningSetting,
        cvSecretPrompt,
        aiInterviewSecretPrompt,
        employmentType,
        requireVideo,
        salaryNegotiable,
        minimumSalary,
        maximumSalary,
        questions,
        country,
        province,
        city,
        teamMembers,
    } = formState;

    const {
        showSaveModal,
        isSavingCareer,
        aiQuestionsError,
        stepErrorIndex,
    } = uiState;

    const { provinceList, cityList } = locationData;

    const savingCareerRef = useRef(false);
    const [detailsErrors, setDetailsErrors] = useState<DetailsErrors>({});

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

    /* Remove errors from fields when changing details */
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
        const updates: Partial<typeof formState> = {};
        
        if (typeof next.jobTitle !== "undefined") {
            const value = (next.jobTitle as string) || "";
            updates.jobTitle = value;
            if (value.trim()) {
                clearErrors("jobTitle");
            }
        }
        if (typeof next.employmentType !== "undefined") {
            const value = (next.employmentType as string) || "";
            updates.employmentType = value;
            if (value.trim()) {
                clearErrors("employmentType");
            }
        }
        if (typeof next.workSetup !== "undefined") {
            const value = (next.workSetup as string) || "";
            updates.workSetup = value;
            if (value.trim()) {
                clearErrors("workSetup");
            }
        }
        if (typeof next.country !== "undefined") {
            const value = (next.country as string) || "";
            updates.country = value;
            if (value.trim()) {
                clearErrors("country");
            }
        }
        if (typeof next.province !== "undefined") {
            const provinceValue = (next.province as string) || "";
            updates.province = provinceValue;
            if (provinceValue.trim()) {
                clearErrors("province");
            }
            if (!provinceValue.trim()) {
                setCityList([]);
                if (city) {
                    updates.city = "";
                }
            }
        }
        if (typeof next.city !== "undefined") {
            const value = (next.city as string) || "";
            updates.city = value;
            if (value.trim()) {
                clearErrors("city");
            }
        }
        if (typeof next.salaryNegotiable !== "undefined") {
            updates.salaryNegotiable = !!next.salaryNegotiable;
            if (next.salaryNegotiable) {
                clearErrors("minimumSalary", "maximumSalary");
            }
        }
        if (typeof next.minimumSalary !== "undefined") {
            updates.minimumSalary = next.minimumSalary as any;
            const value = String(next.minimumSalary ?? "").trim();
            if (value) {
                clearErrors("minimumSalary");
            }
        }
        if (typeof next.maximumSalary !== "undefined") {
            updates.maximumSalary = next.maximumSalary as any;
            const value = String(next.maximumSalary ?? "").trim();
            if (value) {
                clearErrors("maximumSalary");
            }
        }

        if (Object.keys(updates).length > 0) {
            updateFields(updates);
        }
    };

    const handleDescriptionChange = (text: string) => {
        updateField("description", text);
        if (stripHtml(text || "")) {
            clearErrors("description");
        }
    };

    useEffect(() => {
        setProvinceList(philippineCitiesAndProvinces.provinces);
    }, [setProvinceList]);

    useEffect(() => {
        if (Object.keys(detailsErrors).length === 0) {
            setStepErrorIndex(null);
        }
    }, [detailsErrors, setStepErrorIndex]);

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
                updateField("city", "");
            }
        } else {
            setCityList([]);
            if (city) {
                updateField("city", "");
            }
        }
    }, [province, provinceList, city, setCityList, updateField]);

  // Step handling
  const [currentStep, setCurrentStep] = useState<number>(() => (typeof window !== "undefined" ? getStepFromUrl(1) : 1));

  const isStepValid = (step: number) => {
      return validateStep(step, formState);
  }
  
  // Go to step with safety check
  const goToStep = (next: number) => {
    const safeStep = Math.min(Math.max(next, 1), 5);
    setCurrentStep(safeStep);
    setStepInUrl(safeStep);
  };

  // Clear AI questions error once requirement is satisfied
  useEffect(() => {
    const totalQuestions = questions.reduce((acc, group) => acc + (Array.isArray(group.questions) ? group.questions.length : 0), 0);
    if (totalQuestions >= 5 && aiQuestionsError) {
      setAiQuestionsError("");
    }
  }, [questions, aiQuestionsError, setAiQuestionsError]);

  useEffect(() => {
    const updateStepFromUrl = () => {
      setCurrentStep(getStepFromUrl(1));
    };

    updateStepFromUrl();

    window.addEventListener("popstate", updateStepFromUrl);
    return () => {
      window.removeEventListener("popstate", updateStepFromUrl);
    };
  }, []);

    

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
            cvScreeningSetting,
            aiInterviewScreeningSetting,
            cvSecretPrompt,
            aiInterviewSecretPrompt,
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
            cvScreeningSetting,
            aiInterviewScreeningSetting,
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

      // Draft rehydration is now handled in useCareerFormState hook

    const handleSaveAndContinue = () => {
      if (currentStep === 1) {
        const validationErrors = validateDetails(formState);
        setDetailsErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
          setStepErrorIndex(currentStep - 1);
          return;
        }
      } else if (currentStep === 3) {
        const totalQuestions = questions.reduce((acc, group) => acc + (Array.isArray(group.questions) ? group.questions.length : 0), 0);
        if (totalQuestions < 5) {
          setStepErrorIndex(currentStep - 1);
          setAiQuestionsError("Please add at least 5 interview questions.");
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
        writeDraft({ cvScreeningSetting, cvSecretPrompt }, orgID);
        goToStep(3);
      } else if (currentStep === 3) {
        setStepErrorIndex(null);
        writeDraft({ questions, requireVideo, aiInterviewScreeningSetting, aiInterviewSecretPrompt }, orgID);
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
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#181D27" }}>{currentStep !== 1 ? `[Draft] ${draftTitle}` : "Add new career"}</h1>
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
        <div style={{ display: "flex", flexDirection: "row", justifyContent: currentStep === 5 ? "center" : "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
        <div style={{ width: currentStep === 5 ? "90%" : "70%", maxWidth: currentStep === 5 ? "1400px" : "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {currentStep === 1 && (
              <CareerFormDetails
                value={{ jobTitle, employmentType, workSetup, country, province, city, salaryNegotiable, minimumSalary, maximumSalary }}
                onChange={handleDetailsChange}
                employmentTypeOptions={EMPLOYMENT_TYPE_OPTIONS}
                workSetupOptions={WORK_SETUP_OPTIONS}
                countryOptions={COUNTRY_OPTIONS}
                provinceList={provinceList}
                cityList={cityList}
                description={description}
                setDescription={handleDescriptionChange}
                teamMembers={teamMembers}
                setTeamMembers={(value) => updateField("teamMembers", value)}
                teamRoleOptions={TEAM_ROLE_OPTIONS}
                errors={detailsErrors}
              />
            )}
            {currentStep === 2 && (
              <CareerFormCV
                jobTitle={jobTitle}
                screeningSetting={cvScreeningSetting}
                setScreeningSetting={(value) => updateField("cvScreeningSetting", value)}
                screeningSettingList={SCREENING_SETTINGS}
                cvSecretPrompt={cvSecretPrompt}
                setCvSecretPrompt={(value) => updateField("cvSecretPrompt", value)}
              />
            )}
            {currentStep === 3 && (
              <CareerFormAI
                questions={questions}
                setQuestions={(value) => updateField("questions", value)}
                requireVideo={requireVideo}
                setRequireVideo={(value) => updateField("requireVideo", value)}
                screeningSetting={aiInterviewScreeningSetting}
                setScreeningSetting={(value) => updateField("aiInterviewScreeningSetting", value)}
                screeningSettingList={SCREENING_SETTINGS}
                jobTitle={jobTitle}
                description={description}
                aiQuestionsError={aiQuestionsError}
                aiInterviewSecretPrompt={aiInterviewSecretPrompt}
                setAiInterviewSecretPrompt={(value) => updateField("aiInterviewSecretPrompt", value)}
              />
            )}
            {currentStep === 4 && (
              <CareerFormPipeline
                teamMembers={teamMembers}
                setTeamMembers={(value) => updateField("teamMembers", value as typeof formState.teamMembers)}
                teamRoleOptions={TEAM_ROLE_OPTIONS}
              />
            )}
            {currentStep === 5 && (
              <CareerFormReview
                summary={{ jobTitle, description, workSetup, workSetupRemarks, questions, cvScreeningSetting, aiInterviewScreeningSetting, cvSecretPrompt, aiInterviewSecretPrompt, requireVideo, salaryNegotiable, minimumSalary, maximumSalary, country, province, location: city, employmentType, orgID, teamMembers }}
              />
            )}
        </div>

        {currentStep !== 5 && (
        <div style={{ width: "30%", display: "flex", flexDirection: "column", gap: 8 }}>
              {currentStep === 1 && (
                <CareerFormTips titles={["Use clear, standard job titles", "Avoid abbreviations", "Keep it concise"]} descriptions={["for better searchability (e.g., \"Software Engineer\" instead of \"Code Ninja\" or \"Tech Rockstar\").", "or internal role codes that applicants may not understand (e.g., use \"QA Engineer\" instead of \"QE II\" or \"QA‑TL\").", "job titles should be no more than a few words (2—4 max), avoiding fluff or marketing terms."]} />
              )}
              {currentStep === 2 && (
                <CareerFormTips titles={["Add a Secret Prompt", "Add Pre-Screening questions"]} descriptions={["to fine-tune how Jia scores and evaluates submitted CVs.", "to collect key details such as notice period, work setup, or salary expectations to guide your review and candidate discussions."]} />
              )}
              {currentStep === 3 && (
                <CareerFormTips titles={["Add a Secret Prompt", 'Use "Generate Questions"']} descriptions={["to fine-tune how Jia scores and evaluates the interview responses.", "to quickly create tailored interview questions, then refine or mix them with your own for balanced results."]} />
              )}
          </div>
        )}
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