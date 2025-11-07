"use client"

import React from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";

type DetailsValue = {
    jobTitle: string;
    employmentType: string;
    workSetup: string;
    country: string;
    province: string;
    city: string;
    salaryNegotiable: boolean;
    minimumSalary: string | number | null;
    maximumSalary: string | number | null;
};

type Props = {
    value: DetailsValue;
    onChange: (next: Partial<DetailsValue>) => void;
    employmentTypeOptions: { name: string }[];
    workSetupOptions: { name: string }[];
    countryOptions: { name: string }[];
    provinceList: any[];
    cityList: any[];
    description: string;
    setDescription: (text: string) => void;
    teamMembers: any[];
    setTeamMembers: (members: any[]) => void;
    teamRoleOptions: { name: string }[];
};

export default function CareerFormDetails(props: Props) {
    const { value, onChange, employmentTypeOptions, workSetupOptions, countryOptions, provinceList, cityList, description, setDescription, teamMembers, setTeamMembers, teamRoleOptions } = props;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>1. Career Information</span>
                </div>
                <div className="layered-card-content">
                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700, display: "block" }}>Basic Information</span>
                    <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Job Title</span>
                    <input
                        value={value.jobTitle}
                        style={{ border: "1px solid #E9EAEB", borderRadius: 5, color: "#333", fontSize: "1rem", width: "100%", padding: "8px 12px", outline: "none" }}
                        placeholder="Enter job title"
                        onChange={(e) => onChange({ jobTitle: e.target.value || "" })}
                    />

                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700, marginTop: 16, display: "block" }}>Work Setting</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Employment Type</span>
                            <CustomDropdown
                                onSelectSetting={(employmentType) => onChange({ employmentType })}
                                screeningSetting={value.employmentType}
                                settingList={employmentTypeOptions}
                                placeholder="Choose employment type"
                            />
                        </div>
                        <div>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Arrangement</span>
                            <CustomDropdown
                                onSelectSetting={(workSetup) => onChange({ workSetup })}
                                screeningSetting={value.workSetup}
                                settingList={workSetupOptions}
                                placeholder="Choose work arrangement"
                            />
                        </div>
                    </div>

                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700, marginTop: 16, display: "block" }}>Location</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                        <div>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Country</span>
                            <CustomDropdown
                                onSelectSetting={(country) => onChange({ country })}
                                screeningSetting={value.country}
                                settingList={countryOptions}
                                placeholder="Select Country"
                            />
                        </div>
                        <div>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>State / Province</span>
                            <CustomDropdown
                                onSelectSetting={(province) => onChange({ province })}
                                screeningSetting={value.province}
                                settingList={provinceList}
                                placeholder="Choose state / province"
                            />
                        </div>
                        <div>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>City</span>
                            <CustomDropdown
                                onSelectSetting={(city) => onChange({ city })}
                                screeningSetting={value.city}
                                settingList={cityList}
                                placeholder="Choose city"
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                        <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Salary</span>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <label className="switch" style={{ width: 36, height: 20, margin: 0, display: "flex", alignItems: "center" }}>
                                <input type="checkbox" checked={!!value.salaryNegotiable} onChange={() => onChange({ salaryNegotiable: !value.salaryNegotiable })} />
                                <span className="slider round" style={{ width: 36, height: 20 }}></span>
                            </label>
                            <span style={{ fontSize: 14, fontWeight: 500, height: 20, display: "flex", alignItems: "center" }}>{value.salaryNegotiable ? "Negotiable" : "Fixed"}</span>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ position: "relative" }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Minimum Salary</span>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: 16, pointerEvents: "none", zIndex: 1 }}>₱</span>
                                <input
                                    type="number"
                                    style={{ border: "1px solid #E9EAEB", borderRadius: 5, color: "#333", fontSize: "1rem", width: "100%", paddingLeft: 28, paddingRight: 60, paddingTop: 8, paddingBottom: 8, outline: "none" }}
                                    placeholder="0"
                                    min={0}
                                    value={String(value.minimumSalary ?? "")}
                                    onChange={(e) => onChange({ minimumSalary: e.target.value || "" })}
                                />
                                <span style={{ position: "absolute", right: 30, top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: 16, pointerEvents: "none", fontWeight: 500 }}>PHP</span>
                            </div>
                        </div>
                        <div style={{ position: "relative" }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Maximum Salary</span>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: 16, pointerEvents: "none", zIndex: 1 }}>₱</span>
                                <input
                                    type="number"
                                    style={{ border: "1px solid #E9EAEB", borderRadius: 5, color: "#333", fontSize: "1rem", width: "100%", paddingLeft: 28, paddingRight: 60, paddingTop: 8, paddingBottom: 8, outline: "none" }}
                                    placeholder="0"
                                    min={0}
                                    value={String(value.maximumSalary ?? "")}
                                    onChange={(e) => onChange({ maximumSalary: e.target.value || "" })}
                                />
                                <span style={{ position: "absolute", right: 30, top: "50%", transform: "translateY(-50%)", color: "#6c757d", fontSize: 16, pointerEvents: "none", fontWeight: 500 }}>PHP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="layered-card-middle" style={{ marginTop: 8 }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>2. Job Description</span>
                </div>
                <div className="layered-card-content">
                    <RichTextEditor setText={setDescription} text={description} />
                </div>
            </div>

            <div className="layered-card-middle" style={{ marginTop: 8 }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>3. Team Access</span>
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
                                    setTeamMembers(teamMembers.filter((_: any, i: number) => i !== idx));
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
    );
}


