"use client"

import { useEffect, useRef, useState } from "react";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
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

export default function CareerForm({ career, formType, setShowEditModal }: { career?: any, formType: string, setShowEditModal?: (show: boolean) => void }) {
    const { user, orgID } = useAppContext();
    const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
    const [description, setDescription] = useState(career?.description || "");
    const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
    const [workSetupRemarks, setWorkSetupRemarks] = useState(career?.workSetupRemarks || "");
    const [screeningSetting, setScreeningSetting] = useState(career?.screeningSetting || "Good Fit and above");
    const [employmentType, setEmploymentType] = useState(career?.employmentType || "Full-Time");
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

    const isFormValid = () => {
        return jobTitle?.trim().length > 0 && description?.trim().length > 0 && questions.some((q) => q.questions.length > 0) && workSetup?.trim().length > 0;
    }

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
        const parseProvinces = () => {
          setProvinceList(philippineCitiesAndProvinces.provinces);
          const defaultProvince = philippineCitiesAndProvinces.provinces[0];
          if (!career?.province) {
            setProvince(defaultProvince.name);
          }
          const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === defaultProvince.key);
          setCityList(cities);
          if (!career?.location) {
            setCity(cities[0].name);
          }
        }
        parseProvinces();
      },[career])

      useEffect(() => {
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

    return (
        <div className="col">
        {formType === "add" ? (<div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#181D27" }}>Add new career</h1>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                  <button
                  disabled={!isFormValid() || isSavingCareer}
                   style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "10px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontWeight: 700, fontSize: 14 }} onClick={() => {
                    confirmSaveCareer("inactive");
                      }}>
                          Save as Unpublished
                  </button>
                  <button 
                  disabled={!isFormValid() || isSavingCareer}
                  style={{ width: "fit-content", background: !isFormValid() || isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap"}} onClick={() => {
                    confirmSaveCareer("active");
                  }}>
                    <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                      Save as Published
                  </button>
                </div>
        </div>) : (
            <div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Edit Career Details</h1>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <button
                 style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => {
                  setShowEditModal?.(false);
                    }}>
                        Cancel
                </button>
                <button
                  disabled={!isFormValid() || isSavingCareer}
                   style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onClick={() => {
                    updateCareer("inactive");
                    }}>
                          Save Changes as Unpublished
                  </button>
                  <button 
                  disabled={!isFormValid() || isSavingCareer}
                  style={{ width: "fit-content", background: !isFormValid() || isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap"}} onClick={() => {
                    updateCareer("active");
                  }}>
                    <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                      Save Changes as Published
                  </button>
              </div>
       </div>
        )}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
        <div style={{ width: "70%", display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="layered-card-middle">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px"}}>1. Career Information</span>
                  </div>
                  <div className="layered-card-content">
                      <span style={{fontSize: 14, color: "#181D27", fontWeight: 700, display: "block"}}>Basic Information</span>
                      <span style={{fontSize: 14, color: "#414651", fontWeight: 500}}>Job Title</span>
                      <input
                      value={jobTitle}
                      style={{
                          border: "1px solid #E9EAEB",
                          borderRadius: "5px",
                          color: "#333",
                          fontSize: "1rem",
                          width: "100%",
                          padding: "8px 12px",
                          outline: "none"
                      }}
                      onFocus={(e) => {
                          e.target.style.border = "1px solid #E9EAEB";
                          e.target.style.boxShadow = "none";
                      }}
                      onBlur={(e) => {
                          e.target.style.border = "1px solid #E9EAEB";
                      }}
                      placeholder="Enter job title"
                      onChange={(e) => {
                          setJobTitle(e.target.value || "");
                      }}
                      ></input>
                      {/* <span>Description</span>
                      <RichTextEditor setText={setDescription} text={description} /> */}
                      
                      <span style={{fontSize: 14, color: "#181D27", fontWeight: 700, marginTop: "16px", display: "block"}}>Work Setting</span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div>
                              <span style={{fontSize: 14, color: "#414651", fontWeight: 500}}>Employment Type</span>
                              <CustomDropdown
                              onSelectSetting={(employmentType) => {
                                  setEmploymentType(employmentType);
                              }}
                              screeningSetting={employmentType}
                              settingList={employmentTypeOptions}
                              placeholder="Choose employment type"
                              />
                          </div>
                          <div>
                              <span style={{fontSize: 14, color: "#414651", fontWeight: 500}}>Arrangement</span>
                              <CustomDropdown
                              onSelectSetting={(setting) => {
                                  setWorkSetup(setting);
                              }}
                              screeningSetting={workSetup}
                              settingList={workSetupOptions}
                              placeholder="Choose work arrangement"
                              />
                          </div>
                      </div>

                      <span style={{fontSize: 14, color: "#181D27", fontWeight: 700, marginTop: "16px", display: "block"}}>Location</span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                          <div>
                              <span style={{fontSize: 14, color: "#414651", fontWeight: 500}}>Country</span>
                              <CustomDropdown
                              onSelectSetting={(setting) => {
                                  setCountry(setting);
                              }}
                              screeningSetting={country}
                              settingList={countryOptions}
                              placeholder="Select Country"
                              />
                          </div>
                          <div>
                              <span style={{fontSize: 14, color: "#414651", fontWeight: 500}}>State / Province</span>
                              <CustomDropdown
                              onSelectSetting={(province) => {
                                  setProvince(province);
                                  const provinceObj = provinceList.find((p) => p.name === province);
                                  const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === provinceObj.key);
                                  setCityList(cities);
                                  setCity(cities[0].name);
                              }}
                              screeningSetting={province}
                              settingList={provinceList}
                              placeholder="Choose state / province"
                              />
                          </div>
                          <div>
                              <span style={{fontSize: 14, color: "#414651", fontWeight: 500}}>City</span>
                              <CustomDropdown
                              onSelectSetting={(city) => {
                                  setCity(city);
                              }}
                              screeningSetting={city}
                              settingList={cityList}
                              placeholder="Choose city"
                              />
                          </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                          <span style={{fontSize: 14, color: "#181D27", fontWeight: 700}}>Salary</span>
                          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                              <label className="switch" style={{ width: "36px", height: "20px", margin: 0, display: "flex", alignItems: "center" }} >
                                  <input type="checkbox" checked={salaryNegotiable} onChange={() => setSalaryNegotiable(!salaryNegotiable)} />
                                  <span className="slider round" style={{ width: "36px", height: "20px" }}></span>
                              </label>
                              <span style={{ fontSize: "14px", fontWeight: 500, height: "20px", display: "flex", alignItems: "center" }}>{salaryNegotiable ? "Negotiable" : "Fixed"}</span>
                          </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div style={{ position: "relative" }}>
                              <span style={{fontSize: 14, color: "#414651", fontWeight: 500}}>Minimum Salary</span>
                              <div style={{ position: "relative" }}>
                                  <span
                                    style={{
                                      position: "absolute",
                                      left: "12px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      color: "#6c757d",
                                      fontSize: "16px",
                                      pointerEvents: "none",
                                      zIndex: 1,
                                    }}
                                  >
                                    ₱
                                  </span>
                                  <input
                                    type="number"
                                    style={{
                                      border: "1px solid #E9EAEB",
                                      borderRadius: "5px",
                                      color: "#333",
                                      fontSize: "1rem",
                                      width: "100%",
                                      paddingLeft: "28px",
                                      paddingRight: "60px",
                                      paddingTop: "8px",
                                      paddingBottom: "8px",
                                      outline: "none"
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.border = "1px solid #E9EAEB";
                                      e.target.style.boxShadow = "none";
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.border = "1px solid #E9EAEB";
                                    }}
                                    placeholder="0"
                                    min={0}
                                    value={minimumSalary}
                                    onChange={(e) => {
                                      setMinimumSalary(e.target.value || "");
                                    }}
                                  />
                                  <span style={{
                                    position: "absolute",
                                    right: "30px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#6c757d",
                                    fontSize: "16px",
                                    pointerEvents: "none",
                                    fontWeight: 500,
                                  }}>
                                    PHP
                                  </span>
                              </div>
                          </div>
                          <div style={{ position: "relative" }}>
                              <span style={{fontSize: 14, color: "#414651", fontWeight: 500}}>Maximum Salary</span>
                              <div style={{ position: "relative" }}>
                                  <span
                                    style={{
                                      position: "absolute",
                                      left: "12px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      color: "#6c757d",
                                      fontSize: "16px",
                                      pointerEvents: "none",
                                      zIndex: 1,
                                    }}
                                  >
                                    ₱
                                  </span>
                                  <input
                                    type="number"
                                    style={{
                                      border: "1px solid #E9EAEB",
                                      borderRadius: "5px",
                                      color: "#333",
                                      fontSize: "1rem",
                                      width: "100%",
                                      paddingLeft: "28px",
                                      paddingRight: "60px",
                                      paddingTop: "8px",
                                      paddingBottom: "8px",
                                      outline: "none"
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.border = "1px solid #E9EAEB";
                                      e.target.style.boxShadow = "none";
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.border = "1px solid #E9EAEB";
                                    }}
                                    placeholder="0"
                                    min={0}
                                    value={maximumSalary}
                                    onChange={(e) => {
                                      setMaximumSalary(e.target.value || "");
                                    }}
                                  />
                                  <span style={{
                                    position: "absolute",
                                    right: "30px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#6c757d",
                                    fontSize: "16px",
                                    pointerEvents: "none",
                                    fontWeight: 500,
                                  }}>
                                    PHP
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="layered-card-middle">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px"}}>2. Job Description</span>
                  </div>
                  <div className="layered-card-content">
                      <RichTextEditor setText={setDescription} text={description} />
                  </div>
              </div>

          {/* <InterviewQuestionGeneratorV2 questions={questions} setQuestions={(questions) => setQuestions(questions)} jobTitle={jobTitle} description={description} /> */}

          <div className="layered-card-middle">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px"}}>3. Team Access</span>
                  </div>
                  <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Add more members</span>
                              <span style={{ fontSize: 12, color: "#667085" }}>You can add other members to collaborate on this career.</span>
                          </div>
                          <button type="button" className="button-primary-v2" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, background: "#FFFFFF", color: "#181D27", border: "1px solid #E9EAEB", padding: "8px 14px", borderRadius: 10 }}>
                              <i className="la la-user" style={{ fontSize: 18, color: "#717680", display: "flex", alignItems: "center" }}></i>
                              <span style={{ fontWeight: 500, fontSize: 16, color: "#717680", display: "flex", alignItems: "center", lineHeight: 1 }}>Add member</span>
                              <i className="la la-angle-down" style={{ fontSize: 16, color: "#717680", display: "flex", alignItems: "center" }}></i>
                          </button>
                      </div>

                      {teamMembers.map((member, idx) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <img src={member.image || "/images/user-avatar-placeholder.png"} alt={member.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>{member.name} {member.isYou && <span style={{ color: "#667085" }}>(You)</span>}</span>
                                    <span style={{ fontSize: 12, color: "#667085" }}>{member.email}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ minWidth: 180 }}>
                                    <CustomDropdown
                                      onSelectSetting={(role) => {
                                        const next = [...teamMembers];
                                        next[idx] = { ...next[idx], role };
                                        setTeamMembers(next);
                                      }}
                                      screeningSetting={member.role}
                                      settingList={teamRoleOptions}
                                      placeholder="Select role"
                                    />
                                </div>
                                <button type="button" disabled={member.isYou} onClick={() => {
                                    if (member.isYou) return;
                                    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
                                }}
                                  style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid #E9EAEB", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: member.isYou ? "not-allowed" : "pointer", color: member.isYou ? "#98A2B3" : "#667085" }}>
                                    <i className="la la-trash" style={{ fontSize: 20 }}></i>
                                </button>
                            </div>
                        </div>
                      ))}

                      <span style={{ fontSize: 12, color: "#98A2B3" }}>*Admins can view all careers regardless of specific access settings.</span>
                  </div>
              </div>
        </div>

        <div style={{ width: "30%", display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="layered-card-middle">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 32, height: 32,display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.58333 16.6667H7.91667C7.91667 17.5833 7.16667 18.3333 6.25 18.3333C5.33333 18.3333 4.58333 17.5833 4.58333 16.6667ZM2.91667 15.8333H9.58333V14.1667H2.91667V15.8333ZM12.5 7.91667C12.5 11.1 10.2833 12.8 9.35833 13.3333H3.14167C2.21667 12.8 0 11.1 0 7.91667C0 4.46667 2.8 1.66667 6.25 1.66667C9.7 1.66667 12.5 4.46667 12.5 7.91667ZM10.8333 7.91667C10.8333 5.39167 8.775 3.33333 6.25 3.33333C3.725 3.33333 1.66667 5.39167 1.66667 7.91667C1.66667 9.975 2.90833 11.1583 3.625 11.6667H8.875C9.59167 11.1583 10.8333 9.975 10.8333 7.91667ZM16.5583 6.14167L15.4167 6.66667L16.5583 7.19167L17.0833 8.33333L17.6083 7.19167L18.75 6.66667L17.6083 6.14167L17.0833 5L16.5583 6.14167ZM14.5833 5L15.3667 3.28333L17.0833 2.5L15.3667 1.71667L14.5833 0L13.8 1.71667L12.0833 2.5L13.8 3.28333L14.5833 5Z" fill="url(#paint0_linear_310_3980)" />
                    <defs>
                      <linearGradient id="paint0_linear_310_3980" x1="-0.000291994" y1="18.3332" x2="18.3285" y2="-0.412159" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FCCEC0" />
                        <stop offset="0.33" stop-color="#EBACC9" />
                        <stop offset="0.66" stop-color="#CEB6DA" />
                        <stop offset="1" stop-color="#9FCAED" />
                      </linearGradient>
                    </defs>
                  </svg>
                  </div>
                      <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Tips</span>
                  </div>
                  <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ background: "#FFFFFF", border: "1px solid #F2F4F7", borderRadius: 12, padding: 16 }}>
                          <p style={{ margin: 0, color: "#181D27" }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>Use clear, standard job titles</span>
                              <span style={{ fontWeight: 500, color: "#717680", fontSize: 14 }}> for better searchability (e.g., “Software Engineer” instead of “Code Ninja” or “Tech Rockstar”).</span>
                          </p>
                          <p style={{ margin: "12px 0 0 0", color: "#181D27" }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>Avoid abbreviations</span>
                              <span style={{ fontWeight: 500, color: "#717680", fontSize: 14 }}> or internal role codes that applicants may not understand (e.g., use “QA Engineer” instead of “QE II” or “QA‑TL”).</span>
                          </p>
                          <p style={{ margin: "12px 0 0 0", color: "#181D27" }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>Keep it concise</span>
                              <span style={{ fontWeight: 500, color: "#717680", fontSize: 14 }}> — job titles should be no more than a few words (2—4 max), avoiding fluff or marketing terms.</span>
                          </p>
                      </div>
                  </div>
              </div>
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