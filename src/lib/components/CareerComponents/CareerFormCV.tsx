"use client"

import React from "react";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";

type Props = {
    description: string;
    setDescription: (text: string) => void;
};

export default function CareerFormCV({ description, setDescription }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>2. Job Description</span>
                </div>
                <div className="layered-card-content">
                    <RichTextEditor setText={setDescription} text={description} />
                </div>
            </div>
        </div>
    );
}


