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
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>Career Details & Team Access</span>
                </div>
                <div className="layered-card-content">
                    <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>Job Title</span>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>{summary.jobTitle}</span>
                    <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>Employment Type</span>
                            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>{summary.employmentType}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>Arrangement</span>
                            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>{summary.workSetup}</span>
                        </div>
                    </div>
                    <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>Country</span>
                            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>{summary.country}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>State / Province</span>
                            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>{summary.province}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>City</span>
                            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>{summary.city}</span>
                        </div>
                    </div>
                    <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ position: "relative", display: "flex", gap: 4 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight:700 }}>Minimum Salary</span>
                            <span style={{ fontSize: 14, color: "#181D27", fontWeight: 500 }}>{summary.minimumSalary}
                            <span style={{ color: "#6c757d", fontSize: 16, pointerEvents: "none", fontWeight: 500 }}>PHP</span>
                            </span>
                            
                        </div>
                    </div>
                    <div style={{ position: "relative", display: "flex", gap: 4 }}>
                        <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>Maximum Salary</span>
                        <span style={{ fontSize: 14, color: "#181D27", fontWeight: 500 }}>{summary.maximumSalary}
                        <span style={{ color: "#6c757d", fontSize: 16, pointerEvents: "none", fontWeight: 500 }}>PHP</span>
                        </span>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}


