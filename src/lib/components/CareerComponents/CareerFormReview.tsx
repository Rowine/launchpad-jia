"use client"

import React, { useState } from "react";

type Props = {
    summary: any;
    onEditStep?: (step: number) => void;
};

const formatSalary = (salary: number | null | undefined, isNegotiable: boolean): string => {
    if (isNegotiable) {
        return "Negotiable";
    }
    if (salary === null || salary === undefined || salary === 0) {
        return "Not specified";
    }
    return new Intl.NumberFormat('en-PH', { 
        style: 'currency', 
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(salary).replace('PHP', '').trim();
};

export default function CareerFormReview({ summary, onEditStep }: Props) {
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
    const [isCvExpanded, setIsCvExpanded] = useState(true);
    const [isAiInterviewExpanded, setIsAiInterviewExpanded] = useState(true);
    const preScreeningQuestions: any[] = Array.isArray(summary?.preScreeningQuestions) ? summary.preScreeningQuestions : [];

    // Flatten all AI interview questions from all categories
    const aiInterviewQuestions = React.useMemo(() => {
        if (!summary.questions || !Array.isArray(summary.questions)) return [];
        return summary.questions.flatMap((category: any) => 
            Array.isArray(category.questions) ? category.questions : []
        );
    }, [summary.questions]);

    // Get total count of AI interview questions
    const totalAiInterviewQuestions = React.useMemo(() => {
        return aiInterviewQuestions.length;
    }, [aiInterviewQuestions]);

    // preScreeningQuestions are provided via summary; no localStorage reads

    const formatSecretPrompt = (prompt: string): string[] => {
        if (!prompt || !prompt.trim()) return [];
        // Split by newlines first, then by periods if no newlines found
        const lines = prompt.includes('\n') 
            ? prompt.split('\n')
            : prompt.split(/\.\s+/);
        
        return lines
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.match(/^\.+$/))
            .map(line => line.endsWith('.') ? line : line + '.');
    };

    const formatRangeSalary = (min: string | number | null | undefined, max: string | number | null | undefined): string => {
        const minVal = min ? Number(min) : null;
        const maxVal = max ? Number(max) : null;
        if (minVal && maxVal) {
            return `PHP ${new Intl.NumberFormat('en-PH').format(minVal)} - PHP ${new Intl.NumberFormat('en-PH').format(maxVal)}`;
        }
        if (minVal) {
            return `PHP ${new Intl.NumberFormat('en-PH').format(minVal)}`;
        }
        if (maxVal) {
            return `PHP ${new Intl.NumberFormat('en-PH').format(maxVal)}`;
        }
        return "Not specified";
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="layered-card-middle">
                <div 
                    style={{ 
                        display: "flex", 
                        flexDirection: "row", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        padding: "4px 12px",
                        cursor: "pointer"
                    }}
                    onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                >
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <i 
                            className={`la la-angle-${isDetailsExpanded ? 'up' : 'down'}`} 
                            style={{ fontSize: 16, color: "#181D27" }}
                        ></i>
                        <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Career Details & Team Access</span>
                    </div>
                    <i 
                        className="la la-pencil" 
                        style={{ fontSize: 16, color: "#181D27", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onEditStep) {
                                onEditStep(1);
                            }
                        }}
                    ></i>
                </div>
                {isDetailsExpanded && (
                    <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Job Title</span>
                            <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>{summary.jobTitle || "Not specified"}</span>
                        <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Employment Type</span>
                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>{summary.employmentType || "Not specified"}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Work Arrangement</span>
                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>{summary.workSetup || "Not specified"}</span>
                            </div>
                        </div>
                        <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Country</span>
                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>{summary.country || "Not specified"}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>State / Province</span>
                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>{summary.province || "Not specified"}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>City</span>
                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>{summary.city || "Not specified"}</span>
                            </div>
                        </div>
                        <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Minimum Salary</span>
                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>
                                    {formatSalary(summary.minimumSalary, summary.salaryNegotiable)}
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Maximum Salary</span>
                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>
                                    {formatSalary(summary.maximumSalary, summary.salaryNegotiable)}
                                </span>
                            </div>
                        </div>
                        <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>Job Description</span>
                            <div 
                                style={{ 
                                    fontSize: 16, 
                                    color: "#181D27", 
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    maxHeight: 200,
                                    overflowY: "auto"
                                }}
                                dangerouslySetInnerHTML={{ 
                                    __html: summary.description || "Not specified" 
                                }}
                            />
                        </div>
                        <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>Team Access</span>
                            {summary.teamMembers && Array.isArray(summary.teamMembers) && summary.teamMembers.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {summary.teamMembers.map((member: any, idx: number) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                display: "flex", 
                                                flexDirection: "row", 
                                                alignItems: "center", 
                                                gap: 12 
                                            }}
                                        >
                                            <img 
                                                src={member.image || "/images/user-avatar-placeholder.png"} 
                                                alt={member.name} 
                                                style={{ 
                                                    width: 36, 
                                                    height: 36, 
                                                    borderRadius: "50%", 
                                                    objectFit: "cover" 
                                                }} 
                                            />
                                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>
                                                    {member.name} {member.isYou && <span style={{ color: "#667085" }}>(You)</span>}
                                                </span>
                                                <span style={{ fontSize: 12, color: "#667085" }}>{member.email}</span>
                                            </div>
                                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>
                                                {member.role || "Viewer"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>No team members added</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="layered-card-middle">
                <div 
                    style={{ 
                        display: "flex", 
                        flexDirection: "row", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        padding: "4px 12px",
                        cursor: "pointer"
                    }}
                    onClick={() => setIsCvExpanded(!isCvExpanded)}
                >
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <i 
                            className={`la la-angle-${isCvExpanded ? 'up' : 'down'}`} 
                            style={{ fontSize: 16, color: "#181D27" }}
                        ></i>
                        <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>CV Review & Pre-Screening Questions</span>
                    </div>
                    <i 
                        className="la la-pencil" 
                        style={{ fontSize: 16, color: "#181D27", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onEditStep) {
                                onEditStep(2);
                            }
                        }}
                    ></i>
                </div>
                {isCvExpanded && (
                    <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* CV Screening Section */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>CV Screening</span>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>Automatically endorse candidates who are</span>
                                    <span 
                                        style={{ 
                                            backgroundColor: "#B2DDFF", 
                                            color: "#175CD3", 
                                            padding: "4px 12px",
                                            border: "1px solid #B2DDFF",
                                            borderRadius: "20px", 
                                            fontSize: 14, 
                                            fontWeight: 500 
                                        }}
                                    >
                                        {summary.cvScreeningSetting || "Good Fit"}
                                    </span>
                                    <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>and above</span>
                                </div>
                                <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "4px 0" }}></div>
                            </div>

                            {/* CV Secret Prompt */}
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
                                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>CV Secret Prompt</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 24 }}>
                                    {summary.cvSecretPrompt && summary.cvSecretPrompt.trim() ? (
                                        formatSecretPrompt(summary.cvSecretPrompt).map((point, idx) => (
                                            <div key={idx} style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                                <span style={{ fontSize: 16, color: "#181D27" }}>•</span>
                                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500, flex: 1 }}>{point}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>Not specified</span>
                                    )}
                                </div>
                            </div>
                        <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "4px 0" }}></div>
                        </div>

                        {/* Pre-Screening Questions Section */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Pre-Screening Questions</span>
                                {preScreeningQuestions.length > 0 && (
                                    <span 
                                        style={{ 
                                            backgroundColor: "#E9EAEB", 
                                            borderRadius: 12, 
                                            padding: "2px 8px", 
                                            fontSize: 14, 
                                            color: "#667085", 
                                            fontWeight: 500 
                                        }}
                                    >
                                        {preScreeningQuestions.length}
                                    </span>
                                )}
                            </div>
                            
                            {preScreeningQuestions.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {preScreeningQuestions.map((question: any, idx: number) => (
                                        <div key={question.id || idx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>{idx + 1}. {question.question}</span>
                                            </div>
                                            {question.type === "Range" ? (
                                                <div style={{ display: "flex", flexDirection: "row", gap: 8, paddingLeft: 24 }}>
                                                    <span style={{ fontSize: 16, color: "#181D27" }}>•</span>
                                                    <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>
                                                        Preferred: {formatRangeSalary(question.minimumRange, question.maximumRange)}
                                                    </span>
                                                </div>
                                            ) : question.options && Array.isArray(question.options) && question.options.length > 0 ? (
                                                <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 24 }}>
                                                    {question.options.map((option: any, optIdx: number) => (
                                                        <div key={option.id || optIdx} style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                                            <span style={{ fontSize: 16, color: "#181D27" }}>•</span>
                                                            <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>{option.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>No pre-screening questions added yet.</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="layered-card-middle">
                <div 
                    style={{ 
                        display: "flex", 
                        flexDirection: "row", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        padding: "4px 12px",
                        cursor: "pointer"
                    }}
                    onClick={() => setIsAiInterviewExpanded(!isAiInterviewExpanded)}
                >
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <i 
                            className={`la la-angle-${isAiInterviewExpanded ? 'up' : 'down'}`} 
                            style={{ fontSize: 16, color: "#181D27" }}
                        ></i>
                        <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>AI Interview Setup</span>
                    </div>
                    <i 
                        className="la la-pencil" 
                        style={{ fontSize: 16, color: "#181D27", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onEditStep) {
                                onEditStep(3);
                            }
                        }}
                    ></i>
                </div>
                {isAiInterviewExpanded && (
                    <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* AI Interview Section */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>AI Interview Screening</span>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>Automatically endorse candidates who are</span>
                                    <span 
                                        style={{ 
                                            backgroundColor: "#B2DDFF", 
                                            color: "#175CD3", 
                                            padding: "4px 12px",
                                            border: "1px solid #B2DDFF",
                                            borderRadius: "20px", 
                                            fontSize: 14, 
                                            fontWeight: 500 
                                        }}
                                    >
                                        {summary.aiInterviewScreeningSetting || "Good Fit"}
                                    </span>
                                    <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>and above</span>
                                </div>
                                <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "4px 0" }}></div>
                            </div>

                            {/* Require Video on Interview */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700, display: "block" }}>Require Video on Interview</span>
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{summary.requireVideo ? "Yes" : "No"}
                                        {summary.requireVideo ? (
                                                <i className="la la-check" style={{ color: "#12B76A", fontSize: 10, borderRadius: 100, border: "1px solid #A6F4C5", padding: 6, marginLeft: 4, backgroundColor: "#c8f7db" }}></i>
                                        )
                                        : (
                                                <i className="la la-times" style={{ color: "#EF4444", fontSize: 10, borderRadius: 100, border: "1px solid #FEE4E2", padding: 6, marginLeft: 4, backgroundColor: "#fee2e0" }}></i>
                                        )
                                    }
                                    </span>
                                </div>
                                <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "4px 0" }}></div>
                            </div>

                            {/* AI Interview Secret Prompt */}
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
                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>AI Interview Secret Prompt</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 24 }}>
                                    {summary.aiInterviewSecretPrompt && summary.aiInterviewSecretPrompt.trim() ? (
                                        formatSecretPrompt(summary.aiInterviewSecretPrompt).map((point, idx) => (
                                            <div key={idx} style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                                <span style={{ fontSize: 16, color: "#181D27" }}>•</span>
                                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500, flex: 1 }}>{point}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>Not specified</span>
                                    )}
                                </div>
                            </div>
                        <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "4px 0" }}></div>
                        </div>

                        {/* AI Interview Questions Section */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Interview Questions</span>
                                {totalAiInterviewQuestions > 0 && (
                                    <span 
                                        style={{ 
                                            backgroundColor: "#E9EAEB", 
                                            borderRadius: 12, 
                                            padding: "2px 8px", 
                                            fontSize: 14, 
                                            color: "#667085", 
                                            fontWeight: 500 
                                        }}
                                    >
                                        {totalAiInterviewQuestions}
                                    </span>
                                )}
                            </div>
                            
                            {summary.questions && Array.isArray(summary.questions) && summary.questions.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                    {summary.questions.map((category: any, categoryIdx: number) => {
                                        if (!category.questions || !Array.isArray(category.questions) || category.questions.length === 0) {
                                            return null;
                                        }
                                        return (
                                            <div key={category.id || categoryIdx} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>{category.category}</span>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 16 }}>
                                                    {category.questions.map((question: any, questionIdx: number) => (
                                                        <div key={question.id || questionIdx} style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                                            <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>
                                                                {questionIdx + 1}. {question.question}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>No AI interview questions added yet.</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


