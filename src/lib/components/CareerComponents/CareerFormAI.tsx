"use client"

import React, { useState } from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";

type QuestionCategory = {
    id: number;
    category: string;
    questionCountToAsk: number | null;
    questions: any[];
};

type Props = {
    questions: QuestionCategory[];
    setQuestions: (q: QuestionCategory[]) => void;
    requireVideo: boolean;
    setRequireVideo: (v: boolean) => void;
    screeningSetting: string;
    setScreeningSetting: (v: string) => void;
    screeningSettingList: { name: string; icon?: string }[];
    jobTitle: string;
    description: string;
};

export default function CareerFormAI({ questions, setQuestions, requireVideo, setRequireVideo, screeningSetting, setScreeningSetting, screeningSettingList, jobTitle, description }: Props) {
    const [aiInterviewSecretPrompt, setAiInterviewSecretPrompt] = useState("");
    const [showHelpTooltip, setShowHelpTooltip] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>1. AI Interview Settings</span>
                </div>
                <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, display: "block" }}>AI Interview Screening</span>
                        <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>Jia automatically endorses candidates who meet the chosen criteria.</span>
                        <div style={{ width: "40%" }}>
                            <CustomDropdown
                                onSelectSetting={setScreeningSetting}
                                screeningSetting={screeningSetting}
                                settingList={screeningSettingList}
                                placeholder="Choose screening setting"
                            />
                        </div>
                        <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, display: "block" }}>Require Video on Interview </span>
                        <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>Require candidates to keep their camera on. Recordings will appear on their analysis page.</span>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 16, color: "#414651", fontWeight: 500, display: "flex", alignItems: "center", gap: 10 }}><i className="la la-video" style={{ color: "#181D27", fontSize: 24 }}></i>Require video Interview</span>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <label className="switch" style={{ width: 36, height: 20, margin: 0, display: "flex", alignItems: "center" }}>
                                    <input type="checkbox" checked={!!requireVideo} onChange={() => setRequireVideo(!requireVideo)} />
                                    <span className="slider round" style={{ width: 36, height: 20 }}></span>
                                </label>
                                <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 12 }}>{requireVideo ? "Yes" : "No"}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_1_12599)">
                                    <path d="M15.8333 7.50001L16.875 5.20834L19.1666 4.16668L16.875 3.12501L15.8333 0.833344L14.7916 3.12501L12.5 4.16668L14.7916 5.20834L15.8333 7.50001Z" fill="url(#paint0_linear_1_12599)" />
                                    <path d="M15.8333 12.5L14.7916 14.7917L12.5 15.8333L14.7916 16.875L15.8333 19.1667L16.875 16.875L19.1666 15.8333L16.875 14.7917L15.8333 12.5Z" fill="url(#paint1_linear_1_12599)" />
                                    <path d="M9.58331 7.91668L7.49998 3.33334L5.41665 7.91668L0.833313 10L5.41665 12.0833L7.49998 16.6667L9.58331 12.0833L14.1666 10L9.58331 7.91668ZM8.32498 10.825L7.49998 12.6417L6.67498 10.825L4.85831 10L6.67498 9.17501L7.49998 7.35834L8.32498 9.17501L10.1416 10L8.32498 10.825Z" fill="url(#paint2_linear_1_12599)" />
                                </g>
                                <defs>
                                    <linearGradient id="paint0_linear_1_12599" x1="0.833027" y1="19.1666" x2="19.1664" y2="0.83312" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FCCEC0" />
                                        <stop offset="0.33" stopColor="#EBACC9" />
                                        <stop offset="0.66" stopColor="#CEB6DA" />
                                        <stop offset="1" stopColor="#9FCAED" />
                                    </linearGradient>
                                    <linearGradient id="paint1_linear_1_12599" x1="0.833027" y1="19.1666" x2="19.1664" y2="0.83312" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FCCEC0" />
                                        <stop offset="0.33" stopColor="#EBACC9" />
                                        <stop offset="0.66" stopColor="#CEB6DA" />
                                        <stop offset="1" stopColor="#9FCAED" />
                                    </linearGradient>
                                    <linearGradient id="paint2_linear_1_12599" x1="0.833027" y1="19.1666" x2="19.1664" y2="0.83312" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FCCEC0" />
                                        <stop offset="0.33" stopColor="#EBACC9" />
                                        <stop offset="0.66" stopColor="#CEB6DA" />
                                        <stop offset="1" stopColor="#9FCAED" />
                                    </linearGradient>
                                    <clipPath id="clip0_1_12599">
                                        <rect width="20" height="20" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>

                            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, display: "block" }}>AI Interview Secret Prompt</span>
                            <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>(optional)</span>
                            <div
                                style={{ position: "relative", display: "inline-block" }}
                                onMouseEnter={() => setShowHelpTooltip(true)}
                                onMouseLeave={() => setShowHelpTooltip(false)}
                            >
                                <div
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        backgroundColor: "#E9EAEB",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        fontSize: 12,
                                        color: "#667085",
                                        fontWeight: 600,
                                    }}
                                >
                                    ?
                                </div>
                                {showHelpTooltip && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "100%",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            marginBottom: 8,
                                            backgroundColor: "#181D27",
                                            color: "#FFFFFF",
                                            padding: "12px 16px",
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            lineHeight: 1.5,
                                            zIndex: 1000,
                                            maxWidth: 600,
                                            width: 450,
                                            whiteSpace: "normal",
                                        }}
                                    >
                                        These prompts remain hidden from candidates and the public job portal.
                                        Additionally, only Admins and the Job Owner can view the secret prompt.
                                    </div>
                                )}
                            </div>
                        </div>
                        <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>
                            Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                        </span>
                        <textarea
                            value={aiInterviewSecretPrompt}
                            onChange={(e) => setAiInterviewSecretPrompt(e.target.value)}
                            placeholder="Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally. Focus on clarity, coherence, and confidence rather than language preference or accent.)"
                            rows={2}
                            style={{
                                border: "1px solid #E9EAEB",
                                borderRadius: 5,
                                color: "#333",
                                fontSize: "1rem",
                                width: "100%",
                                padding: "8px 12px",
                                outline: "none",
                                boxSizing: "border-box",
                                height: 180,
                                minHeight: 180,
                                maxHeight: 180,
                                fontFamily: "inherit",
                                overflow: "hidden",
                                resize: "vertical",
                            }}
                        />
                    </div>
                </div>
            </div>
            <InterviewQuestionGeneratorV2 questions={questions} setQuestions={(questions) => setQuestions(questions)} jobTitle={jobTitle} description={description} />
        </div>
    );
}


