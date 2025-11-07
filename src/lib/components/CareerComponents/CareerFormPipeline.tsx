"use client"

import React from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

type TeamMember = {
    name: string;
    email: string;
    image?: string;
    role: string;
    isYou?: boolean;
};

type Props = {
    teamMembers: TeamMember[];
    setTeamMembers: (members: TeamMember[]) => void;
    teamRoleOptions: { name: string }[];
};

export default function CareerFormPipeline({ teamMembers, setTeamMembers, teamRoleOptions }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>4. Team Access</span>
                </div>
                <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Add more members</span>
                            <span style={{ fontSize: 12, color: "#667085" }}>You can add other members to collaborate on this career.</span>
                        </div>
                    </div>

                    {teamMembers.map((member, idx) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <img src={member.image || "/images/user-avatar-placeholder.png"} alt={member.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>
                                        {member.name} {member.isYou && <span style={{ color: "#667085" }}>(You)</span>}
                                    </span>
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
                                <button
                                    type="button"
                                    disabled={member.isYou}
                                    onClick={() => {
                                        if (member.isYou) return;
                                        setTeamMembers(teamMembers.filter((_, i) => i !== idx));
                                    }}
                                    style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid #E9EAEB", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: member.isYou ? "not-allowed" : "pointer", color: member.isYou ? "#98A2B3" : "#667085" }}
                                >
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


