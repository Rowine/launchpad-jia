"use client"

import React, { useState, useEffect } from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

type Props = {
    jobTitle?: string;
    screeningSetting: string;
    setScreeningSetting: (v: string) => void;
    screeningSettingList: { name: string; icon?: string }[];
    cvSecretPrompt: string;
    setCvSecretPrompt: (v: string) => void;
};

export default function CareerFormCV({ jobTitle, screeningSetting, setScreeningSetting, screeningSettingList, cvSecretPrompt, setCvSecretPrompt }: Props) {
    const [showHelpTooltip, setShowHelpTooltip] = useState(false);
    const [preScreeningQuestions, setPreScreeningQuestions] = useState<any[]>([]);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    const draftTitle = jobTitle?.trim() ? jobTitle : "Untitled Role";

    const questionTypes = [
        { name: "Short Answer", icon: "la la-user" },
        { name: "Long Answer", icon: "la la-bars" },
        { name: "Dropdown", icon: "la la-chevron-circle-down" },
        { name: "Checkboxes", icon: "la la-check-square" },
        { name: "Range", icon: "la la-list-ol" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId !== null) {
                const target = event.target as HTMLElement;
                if (!target.closest('[data-dropdown-container]')) {
                    setOpenDropdownId(null);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openDropdownId]);

    const suggestedQuestions = [
        {
            id: "notice-period",
            title: "Notice Period",
            question: "How long is your notice period?",
            defaultOptions: ["Immediately", "< 30 days", "> 30 days"],
        },
        {
            id: "work-setup",
            title: "Work Setup",
            question: "How often are you willing to report to the office?",
            defaultOptions: [
                "At most 1-2x a week",
                "At most 3-4x a week",
                "Open to fully onsite work",
                "Only open to fully remote work",
            ],
        },
        {
            id: "asking-salary",
            title: "Asking Salary",
            question: "How much is your expected monthly salary?",
            defaultOptions: [],
        },
    ];

    const handleAddQuestion = (suggested: any) => {
        const isAskingSalary = suggested.id === "asking-salary";
        const newQuestion = {
            id: Date.now(),
            suggestedId: suggested.id,
            question: suggested.question,
            type: isAskingSalary ? "Range" : "Dropdown",
            options: isAskingSalary ? [] : suggested.defaultOptions.map((opt: string, idx: number) => ({
                id: Date.now() + idx,
                value: opt,
            })),
            ...(isAskingSalary && {
                minimumRange: "",
                maximumRange: "",
            }),
        };
        setPreScreeningQuestions([...preScreeningQuestions, newQuestion]);
    };

    const handleDeleteQuestion = (questionId: number) => {
        setPreScreeningQuestions(preScreeningQuestions.filter((q) => q.id !== questionId));
    };

    const handleUpdateQuestion = (questionId: number, field: string, value: any) => {
        setPreScreeningQuestions(
            preScreeningQuestions.map((q) => {
                if (q.id === questionId) {
                    const updated = { ...q, [field]: value };
                    // Initialize range values if switching to Range type
                    if (field === "type" && value === "Range" && !updated.minimumRange && !updated.maximumRange) {
                        updated.minimumRange = "";
                        updated.maximumRange = "";
                    }
                    return updated;
                }
                return q;
            })
        );
    };

    const handleUpdateRange = (questionId: number, field: "minimumRange" | "maximumRange", value: string) => {
        setPreScreeningQuestions(
            preScreeningQuestions.map((q) =>
                q.id === questionId ? { ...q, [field]: value } : q
            )
        );
    };

    const handleAddOption = (questionId: number) => {
        setPreScreeningQuestions(
            preScreeningQuestions.map((q) =>
                q.id === questionId
                    ? {
                          ...q,
                          options: [...q.options, { id: Date.now(), value: "" }],
                      }
                    : q
            )
        );
    };

    const handleRemoveOption = (questionId: number, optionId: number) => {
        setPreScreeningQuestions(
            preScreeningQuestions.map((q) =>
                q.id === questionId
                    ? {
                          ...q,
                          options: q.options.filter((opt: any) => opt.id !== optionId),
                      }
                    : q
            )
        );
    };

    const handleUpdateOption = (questionId: number, optionId: number, value: string) => {
        setPreScreeningQuestions(
            preScreeningQuestions.map((q) =>
                q.id === questionId
                    ? {
                          ...q,
                          options: q.options.map((opt: any) => (opt.id === optionId ? { ...opt, value } : opt)),
                      }
                    : q
            )
        );
    };

    const handleAddCustomQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            suggestedId: null, // Custom questions don't have a suggestedId
            question: "",
            type: "Dropdown",
            options: [{ id: Date.now(), value: "" }],
        };
        setPreScreeningQuestions([...preScreeningQuestions, newQuestion]);
    };

    const isQuestionAdded = (suggestedId: string) => {
        return preScreeningQuestions.some((q) => q.suggestedId === suggestedId);
    };

    const isCustomQuestion = (question: any) => {
        return question.suggestedId === null || question.suggestedId === undefined;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>1. CV Review Settings</span>
                </div>
                <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* CV Screening Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, display: "block" }}>CV Screening</span>
                        <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>Jia automatically endorses candidates who meet the chosen criteria.</span>
                        <CustomDropdown
                            onSelectSetting={setScreeningSetting}
                            screeningSetting={screeningSetting}
                            settingList={screeningSettingList}
                            placeholder="Choose screening setting"
                        />
                          <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%", padding: "12px 0" }}></div>
                    </div>
                  

                    {/* CV Secret Prompt Section */}
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

                            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, display: "block" }}>CV Secret Prompt</span>
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
                            value={cvSecretPrompt}
                            onChange={(e) => setCvSecretPrompt(e.target.value)}
                            placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)"
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

            {/* Pre-Screening Questions Section */}
            <div className="layered-card-middle" style={{ marginTop: 24 }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "4px 12px" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>2. Pre-Screening Questions</span>
                        <span style={{ fontSize: 16, color: "#414651", fontWeight: 500 }}>(optional)</span>
                        <div
                            style={{
                                backgroundColor: "#E9EAEB",
                                borderRadius: 12,
                                padding: "2px 8px",
                                fontSize: 14,
                                color: "#667085",
                                fontWeight: 500,
                            }}
                        >
                            {preScreeningQuestions.length}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddCustomQuestion}
                        style={{
                            backgroundColor: "#181D27",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: 20,
                            padding: "8px 16px",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <i className="la la-plus" style={{ fontSize: 16 }}></i>
                        <span>Add custom</span>
                    </button>
                </div>
                <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {preScreeningQuestions.length === 0 ? (
                        <>
                        <span style={{ fontSize: 16, color: "#414651", fontWeight: 500, padding: "8px 0" }}>No pre-screening questions added yet.</span>
                        <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%" }}></div>
                        </>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {preScreeningQuestions.map((question) => {
                                const isDropdownOpen = openDropdownId === question.id;
                                const selectedType = questionTypes.find((t) => t.name === question.type) || questionTypes[0];
                                return (
                                <div
                                    key={question.id}
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        gap: 12,
                                        alignItems: "center",
                                    }}
                                >
                                    {/* Drag Handle - Outside the card */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "grab",
                                        }}
                                    >
                                        <svg width="20" height="36" viewBox="0 0 20 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.16683 23C9.16683 23.9167 8.41683 24.6667 7.50016 24.6667C6.5835 24.6667 5.8335 23.9167 5.8335 23C5.8335 22.0834 6.5835 21.3334 7.50016 21.3334C8.41683 21.3334 9.16683 22.0834 9.16683 23ZM7.50016 16.3334C6.5835 16.3334 5.8335 17.0834 5.8335 18C5.8335 18.9167 6.5835 19.6667 7.50016 19.6667C8.41683 19.6667 9.16683 18.9167 9.16683 18C9.16683 17.0834 8.41683 16.3334 7.50016 16.3334ZM7.50016 11.3334C6.5835 11.3334 5.8335 12.0834 5.8335 13C5.8335 13.9167 6.5835 14.6667 7.50016 14.6667C8.41683 14.6667 9.16683 13.9167 9.16683 13C9.16683 12.0834 8.41683 11.3334 7.50016 11.3334ZM12.5002 14.6667C13.4168 14.6667 14.1668 13.9167 14.1668 13C14.1668 12.0834 13.4168 11.3334 12.5002 11.3334C11.5835 11.3334 10.8335 12.0834 10.8335 13C10.8335 13.9167 11.5835 14.6667 12.5002 14.6667ZM12.5002 16.3334C11.5835 16.3334 10.8335 17.0834 10.8335 18C10.8335 18.9167 11.5835 19.6667 12.5002 19.6667C13.4168 19.6667 14.1668 18.9167 14.1668 18C14.1668 17.0834 13.4168 16.3334 12.5002 16.3334ZM12.5002 21.3334C11.5835 21.3334 10.8335 22.0834 10.8335 23C10.8335 23.9167 11.5835 24.6667 12.5002 24.6667C13.4168 24.6667 14.1668 23.9167 14.1668 23C14.1668 22.0834 13.4168 21.3334 12.5002 21.3334Z" fill="#A4A7AE" />
                                        </svg>
                                    </div>

                                    {/* Question Card */}
                                    <div
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            border: "1px solid #E9EAEB",
                                            borderRadius: 8,
                                            backgroundColor: "#FFFFFF",
                                        }}
                                    >
                                        {/* Question Content */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {/* Question Input and Type Dropdown */}
                                            <div style={{ display: "flex", flexDirection: "row", gap: 0, alignItems: "center", backgroundColor: "#F2F4F7", padding: "22px 16px", borderRadius: 8 }}>
                                                {isCustomQuestion(question) ? (
                                                    <input
                                                        type="text"
                                                        value={question.question}
                                                        onChange={(e) => handleUpdateQuestion(question.id, "question", e.target.value)}
                                                        placeholder="Write your question..."
                                                        style={{
                                                            flex: 1,
                                                            border: "none",
                                                            borderRadius: 0,
                                                            padding: "0",
                                                            fontSize: 14,
                                                            color: "#181D27",
                                                            outline: "none",
                                                            backgroundColor: "transparent",
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        style={{
                                                            flex: 1,
                                                            fontSize: 14,
                                                            color: "#181D27",
                                                            fontWeight: 500,
                                                            padding: "0",
                                                        }}
                                                    >
                                                        {question.question}
                                                    </span>
                                                )}
                                                <div style={{ position: "relative", marginLeft: 12 }} data-dropdown-container>
                                                    <div
                                                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : question.id)}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 12,
                                                            border: isDropdownOpen ? "1.5px solid #6366F1" : "1px solid #D0D5DD",
                                                            borderRadius: 12,
                                                            padding: "10px 16px",
                                                            minWidth: 220,
                                                            backgroundColor: "#FFFFFF",
                                                            cursor: "pointer",
                                                            boxShadow: isDropdownOpen ? "0px 1px 2px rgba(16, 24, 40, 0.1)" : "none",
                                                            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: 28,
                                                                height: 28,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                color: "#414651",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <i className={selectedType.icon} style={{ fontSize: 20 }}></i>
                                                        </div>
                                                        <span style={{ fontSize: 14, color: "#181D27", fontWeight: 500, flex: 1 }}>{question.type}</span>
                                                        <i className="la la-angle-down" style={{ fontSize: 16, color: "#98A2B3" }}></i>
                                                    </div>
                                                    {isDropdownOpen && (
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                top: "calc(100% + 6px)",
                                                                left: 0,
                                                                right: 0,
                                                                backgroundColor: "#FFFFFF",
                                                                border: "1px solid #E4E7EC",
                                                                borderRadius: 12,
                                                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                                                                zIndex: 1000,
                                                                overflow: "hidden",
                                                                minWidth: 220,
                                                            }}
                                                        >
                                                            {questionTypes.map((type) => (
                                                                <div
                                                                    key={type.name}
                                                                    onClick={() => {
                                                                        handleUpdateQuestion(question.id, "type", type.name);
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: 12,
                                                                        padding: "10px 12px",
                                                                        cursor: "pointer",
                                                                        backgroundColor: question.type === type.name ? "#F8FAFC" : "#FFFFFF",
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (question.type !== type.name) {
                                                                            e.currentTarget.style.backgroundColor = "#F9FAFB";
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        if (question.type !== type.name) {
                                                                            e.currentTarget.style.backgroundColor = "#FFFFFF";
                                                                        }
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: 28,
                                                                            height: 28,
                                                                            borderRadius: "50%",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            color: "#414651",
                                                                            flexShrink: 0,
                                                                        }}
                                                                    >
                                                                        <i className={type.icon} style={{ fontSize: 14 }}></i>
                                                                    </div>
                                                                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: question.type === type.name ? 700 : 500, flex: 1 }}>
                                                                        {type.name}
                                                                    </span>
                                                                    {question.type === type.name && (
                                                                        <i className="la la-check" style={{ fontSize: 14, color: "#3B82F6" }}></i>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Options or Range Input */}
                                            {question.type === "Range" ? (
                                                <div style={{ display: "flex", flexDirection: "row", gap: 16, padding: "12px 16px" }}>
                                                    {/* Minimum Range */}
                                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                                                        <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Minimum</span>
                                                        <div style={{ position: "relative" }}>
                                                            <span
                                                                style={{
                                                                    position: "absolute",
                                                                    left: 12,
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    color: "#414651",
                                                                    fontSize: 16,
                                                                    pointerEvents: "none",
                                                                    zIndex: 1,
                                                                }}
                                                            >
                                                                ₱
                                                            </span>
                                                            <input
                                                                type="number"
                                                                value={question.minimumRange || ""}
                                                                onChange={(e) => handleUpdateRange(question.id, "minimumRange", e.target.value)}
                                                                placeholder="0"
                                                                min={0}
                                                                style={{
                                                                    border: "1px solid #E9EAEB",
                                                                    borderRadius: 5,
                                                                    color: "#181D27",
                                                                    fontSize: 14,
                                                                    width: "100%",
                                                                    paddingLeft: 28,
                                                                    paddingRight: 60,
                                                                    paddingTop: 8,
                                                                    paddingBottom: 8,
                                                                    outline: "none",
                                                                }}
                                                            />
                                                            <div
                                                                style={{
                                                                    position: "absolute",
                                                                    right: 12,
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 4,
                                                                    pointerEvents: "none",
                                                                }}
                                                            >
                                                                <span style={{ color: "#414651", fontSize: 14, fontWeight: 500 }}>PHP</span>
                                                                <i className="la la-angle-down" style={{ fontSize: 12, color: "#667085" }}></i>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Maximum Range */}
                                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                                                        <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Maximum</span>
                                                        <div style={{ position: "relative" }}>
                                                            <span
                                                                style={{
                                                                    position: "absolute",
                                                                    left: 12,
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    color: "#414651",
                                                                    fontSize: 16,
                                                                    pointerEvents: "none",
                                                                    zIndex: 1,
                                                                }}
                                                            >
                                                                ₱
                                                            </span>
                                                            <input
                                                                type="number"
                                                                value={question.maximumRange || ""}
                                                                onChange={(e) => handleUpdateRange(question.id, "maximumRange", e.target.value)}
                                                                placeholder="0"
                                                                min={0}
                                                                style={{
                                                                    border: "1px solid #E9EAEB",
                                                                    borderRadius: 5,
                                                                    color: "#181D27",
                                                                    fontSize: 14,
                                                                    width: "100%",
                                                                    paddingLeft: 28,
                                                                    paddingRight: 60,
                                                                    paddingTop: 8,
                                                                    paddingBottom: 8,
                                                                    outline: "none",
                                                                }}
                                                            />
                                                            <div
                                                                style={{
                                                                    position: "absolute",
                                                                    right: 12,
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 4,
                                                                    pointerEvents: "none",
                                                                }}
                                                            >
                                                                <span style={{ color: "#414651", fontSize: 14, fontWeight: 500 }}>PHP</span>
                                                                <i className="la la-angle-down" style={{ fontSize: 12, color: "#667085" }}></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                    {question.options.map((option: any, optIdx: number) => (
                                                        <div
                                                            key={option.id}
                                                            style={{
                                                                display: "flex",
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                gap: 0,
                                                                padding: "0 12px",
                                                            }}
                                                        >
                                                            {/* Connected Number and Input Container */}
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                    border: "1px solid #E9EAEB",
                                                                    borderRadius: 5,
                                                                    backgroundColor: "#FFFFFF",
                                                                    flex: 1,
                                                                }}
                                                            >
                                                                {/* Number Circle */}
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        width: 32,
                                                                        height: 32,
                                                                        backgroundColor: "#FFFFFF",
                                                                        fontSize: 14,
                                                                        color: "#181D27",
                                                                        fontWeight: 500,
                                                                        margin: 4,
                                                                        flexShrink: 0,
                                                                    }}
                                                                >
                                                                    {optIdx + 1}
                                                                </div>
                                                                {/* Divider Line */}
                                                                <div
                                                                    style={{
                                                                        width: 1,
                                                                        alignSelf: "stretch",
                                                                        backgroundColor: "#E9EAEB",
                                                                        marginTop: 4,
                                                                        marginBottom: 4,
                                                                    }}
                                                                />
                                                                {/* Input Field */}
                                                                <input
                                                                    type="text"
                                                                    value={option.value}
                                                                    onChange={(e) => handleUpdateOption(question.id, option.id, e.target.value)}
                                                                    placeholder={`Option ${optIdx + 1}`}
                                                                    style={{
                                                                        flex: 1,
                                                                        maxWidth: 300,
                                                                        border: "none",
                                                                        padding: "8px 12px",
                                                                        fontSize: 14,
                                                                        color: "#181D27",
                                                                        outline: "none",
                                                                        backgroundColor: "transparent",
                                                                    }}
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveOption(question.id, option.id)}
                                                                style={{
                                                                    backgroundColor: "transparent",
                                                                    border: "1px solid #E9EAEB",
                                                                    borderRadius: "50%",
                                                                    cursor: "pointer",
                                                                    padding: 4,
                                                                    width: 24,
                                                                    height: 24,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    color: "#667085",
                                                                    marginLeft: 32,
                                                                }}
                                                            >
                                                                <i className="la la-times" style={{ fontSize: 16 }}></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddOption(question.id)}
                                                        style={{
                                                            backgroundColor: "transparent",
                                                            border: "none",
                                                            borderRadius: 5,
                                                            padding: "8px 12px",
                                                            fontSize: 14,
                                                            color: "#667085",
                                                            fontWeight: 500,
                                                            cursor: "pointer",
                                                            alignSelf: "flex-start",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 6,
                                                            marginLeft: 20,
                                                        }}
                                                    >
                                                        <i className="la la-plus" style={{ fontSize: 14 }}></i>
                                                        <span>Add Option</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div
                                            style={{
                                                borderBottom: "1px solid #E9EAEB",
                                                marginTop: 16,
                                                marginBottom: 0,
                                                marginLeft: 12,
                                                marginRight: 12,
                                            }}
                                        ></div>

                                        {/* Delete Button */}
                                        <div style={{ display: "flex", justifyContent: "flex-end", padding: "24px 16px" }}>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteQuestion(question.id)}
                                                style={{
                                                    backgroundColor: "transparent",
                                                    border: "1px solid #FDA29B",
                                                    borderRadius: "50px",
                                                    cursor: "pointer",
                                                    padding: "6px 12px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    color: "#B32318",
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                <i className="la la-trash" style={{ fontSize: 20 }}></i>
                                                <span>Delete Question</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                            <div style={{ borderBottom: "2px solid #E9EAEB", width: "100%" }}></div>
                        </div>
                    )}
    
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <span style={{ fontSize: 16, color: "#414651", fontWeight: 700, display: "block" }}>Suggested Pre-screening Questions:</span>
                        {suggestedQuestions.map((suggested, index) => {
                            const isAdded = isQuestionAdded(suggested.id);
                            return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 0",
                                }}
                            >
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <span style={{ fontSize: 14, color: "#414651", fontWeight: 700 }}>{suggested.title}</span>
                                    <span style={{ fontSize: 14, color: "#717680", fontWeight: 500 }}>{suggested.question}</span>
                                </div>
                                <button
                                    type="button"
                                        onClick={() => !isAdded && handleAddQuestion(suggested)}
                                        disabled={isAdded}
                                    style={{
                                            backgroundColor: isAdded ? "#E9EAEB" : "#FFFFFF",
                                            color: isAdded ? "#667085" : "#181D27",
                                        border: "1px solid #E9EAEB",
                                        borderRadius: 20,
                                        padding: "6px 16px",
                                        fontSize: 14,
                                        fontWeight: 500,
                                            cursor: isAdded ? "not-allowed" : "pointer",
                                            opacity: isAdded ? 0.6 : 1,
                                    }}
                                >
                                        {isAdded ? "Added" : "Add"}
                                </button>
                            </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}


