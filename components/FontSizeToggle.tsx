"use client";

import { useEffect, useState } from "react";

export const TEXT_SCALE_LEVELS = ["normal", "large", "xlarge"] as const;
export type TextScaleLevel = (typeof TEXT_SCALE_LEVELS)[number];

export function applyTextScale(level: TextScaleLevel) {
    document.documentElement.setAttribute("data-text-scale", level);
    localStorage.setItem("ddobaki_text_scale", level);
}

const LEVELS = TEXT_SCALE_LEVELS;
type Level = TextScaleLevel;

export default function FontSizeToggle() {
    const [level, setLevel] = useState<Level>("normal");

    useEffect(() => {
        const saved = localStorage.getItem("ddobaki_text_scale") as Level | null;
        if (saved && LEVELS.includes(saved)) {
            setLevel(saved);
            document.documentElement.setAttribute("data-text-scale", saved);
        }
    }, []);

    const cycle = () => {
        const currentIndex = LEVELS.indexOf(level);
        const next = LEVELS[(currentIndex + 1) % LEVELS.length];
        setLevel(next);
        applyTextScale(next);
    };
    const label = level === "normal" ? "보통 글씨" : level === "large" ? "큰 글씨" : "아주 큰 글씨";
    const previewSize = level === "normal" ? "14px" : level === "large" ? "17px" : "20px";

    return (
        <button
            onClick={cycle}
            className="fixed bottom-5 right-5 z-50 h-12 px-4 rounded-full bg-ink text-white font-bold shadow-lg flex items-center gap-1.5"
            aria-label="글자 크기 조절"
        >
            <span style={{ fontSize: previewSize }}>가</span>
            <span className="text-[10px] font-semibold opacity-80">{label}</span>
        </button>
    );
}