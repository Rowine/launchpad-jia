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
               
            </div>
        </div>
    );
}


