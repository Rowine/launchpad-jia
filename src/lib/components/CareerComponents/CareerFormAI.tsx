"use client"

import React from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

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
};

export default function CareerFormAI({ questions, setQuestions, requireVideo, setRequireVideo, screeningSetting, setScreeningSetting, screeningSettingList }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, padding: "4px 12px" }}>3. AI Interview Setup</span>
                </div>
                <div className="layered-card-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>Require video response</span>
                        <label className="switch" style={{ width: 36, height: 20, margin: 0, display: "flex", alignItems: "center" }}>
                            <input type="checkbox" checked={!!requireVideo} onChange={() => setRequireVideo(!requireVideo)} />
                            <span className="slider round" style={{ width: 36, height: 20 }}></span>
                        </label>
                    </div>
                    <div>
                        <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Screening Setting</span>
                        <CustomDropdown
                            onSelectSetting={(v) => setScreeningSetting(v)}
                            screeningSetting={screeningSetting}
                            settingList={screeningSettingList}
                            placeholder="Choose screening setting"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}


