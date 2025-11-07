"use client"

import React from "react";

type Props = {
    summary: any;
    // Review is passive; actions handled in header
};

export default function CareerFormReview({ summary }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>5. Review Career</span>
                </div>
                <div className="layered-card-content">
                    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>{JSON.stringify(summary, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}


