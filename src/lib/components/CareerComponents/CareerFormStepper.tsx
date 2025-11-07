"use client"

import React from "react";

type CareerFormStepperProps = {
    steps?: string[];
    currentStep: number; // 0-based index
    progressEnabled?: boolean; // controls whether progress gradient is shown
    errorStepIndex?: number | null;
};

const DEFAULT_STEPS = [
    "Career Details & Team Access",
    "CV Review & Pre-screening",
    "AI Interview Setup",
    "Pipeline Stages",
    "Review Career",
];

export default function CareerFormStepper({ steps = DEFAULT_STEPS, currentStep, progressEnabled = true, errorStepIndex = null }: CareerFormStepperProps) {
    const safeCurrent = Math.min(Math.max(currentStep, 0), steps.length - 1);

    return (
        <div style={{ width: "100%", padding: "8px 0 8px 0" }}>
            {/* per-step columns with dot + (optional) line on top and label below */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
                {steps.map((label, index) => {
                    const isActive = index === safeCurrent;
                    const isCompleted = index < safeCurrent;
                    const hasError = errorStepIndex === index;
                    const align = index === 0 ? "flex-start" : "flex-start"
                    return (
                        <div key={`step-${index}`} style={{ display: "flex", flexDirection: "column", alignItems: index === 0 ? "flex-start" : index === steps.length - 1 ? "flex-start" : "center", marginRight: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", width: "100%", height: 24, justifyContent: align }}>
                                {hasError ? (
                                    <div
                                        style={{
                                            width: 20,
                                            height: 20,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <i className="la la-exclamation-triangle" style={{ fontSize: 24, color: "#F04438" }}></i>
                                    </div>
                                ) : isCompleted ? (
                                    <div
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            backgroundColor: "#000000",
                                            border: "2px solid #000000",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <i className="la la-check" style={{ fontSize: 10, color: "#FFFFFF" }}></i>
                                    </div>
                                ) : (
                                    <i className="la la-dot-circle" style={{ fontSize: 24, color: isActive ? "#000000" : "#D5D7DA" }}></i>
                                )}
                                {index < steps.length - 1 && (() => {
                                    const computedPct = index < safeCurrent ? 100 : index === safeCurrent ? 50 : 0;
                                    const fillPct = progressEnabled ? computedPct : 0;
                                    const gradient = "linear-gradient(90deg, #9FCAED 0%, #CEB6DA 33%, #EBACC9 66%, #FCCEC0 100%)";
                                    const baseStyle: React.CSSProperties = {
                                        flex: 1,
                                        height: 4,
                                        borderRadius: 2,
                                        marginLeft: 6,
                                        backgroundColor: "#E4E7EC",
                                    };
                                    if (fillPct === 0) {
                                        return <div style={baseStyle}></div>;
                                    }
                                    return (
                                        <div
                                            style={{
                                                ...baseStyle,
                                                backgroundImage: gradient,
                                                backgroundRepeat: "no-repeat",
                                                backgroundSize: `${fillPct}% 100%`,
                                                backgroundPosition: "left center",
                                            }}
                                        ></div>
                                    );
                                })()}
                            </div>
                            <div style={{ marginTop: 6, textAlign: "left", width: "100%" }}>
                                <span
                                    style={{
                                        fontSize: 14,
                                        color: isActive ? "#181D27" : isCompleted ? "#181D27" : "#98A2B3",
                                        fontWeight: hasError ? 700 : isActive ? 700 : isCompleted ? 700 : 500,
                                    }}
                                    title={label}
                                >
                                    {label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}