"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createWorker } from "tesseract.js";
import { maskText } from "@/lib/masking";
import { getHistory, countThisMonth } from "@/lib/history";

type Rect = { x: number; y: number; width: number; height: number };
type Point = { x: number; y: number };

const BRUSH_WIDTH = 14; // 화면에 보이는 형광펜 굵기(px)

function scaleRectToNatural(
    displayRect: Rect,
    displaySize: { width: number; height: number },
    naturalSize: { width: number; height: number }
): Rect {
    const scaleX = naturalSize.width / displaySize.width;
    const scaleY = naturalSize.height / displaySize.height;
    return {
        x: Math.round(displayRect.x * scaleX),
        y: Math.round(displayRect.y * scaleY),
        width: Math.round(displayRect.width * scaleX),
        height: Math.round(displayRect.height * scaleY),
    };
}

function cropImageToBlob(img: HTMLImageElement, rectNatural: Rect): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        canvas.width = rectNatural.width;
        canvas.height = rectNatural.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas context 생성 실패"));
        ctx.drawImage(img, rectNatural.x, rectNatural.y, rectNatural.width, rectNatural.height, 0, 0, rectNatural.width, rectNatural.height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("crop 실패"))), "image/jpeg", 0.92);
    });
}

function applyStrokeRedactions(
    img: HTMLImageElement,
    strokesNatural: { points: Point[]; width: number }[]
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas context 생성 실패"));
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = "#14171B";
        ctx.fillStyle = "#14171B";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (const stroke of strokesNatural) {
            if (stroke.points.length === 0) continue;
            ctx.lineWidth = stroke.width;
            if (stroke.points.length === 1) {
                const p = stroke.points[0];
                ctx.beginPath();
                ctx.arc(p.x, p.y, stroke.width / 2, 0, Math.PI * 2);
                ctx.fill();
                continue;
            }
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        }

        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("가리기 처리 실패"))), "image/jpeg", 0.92);
    });
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

function computeAverageBrightness(img: HTMLImageElement): number {
    const canvas = document.createElement("canvas");
    const w = 80;
    const h = Math.round((img.naturalHeight / img.naturalWidth) * w) || 80;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 255;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let total = 0;
    const count = w * h;
    for (let i = 0; i < data.length; i += 4) {
        total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }
    return total / count;
}

export default function HomePage() {
    const router = useRouter();
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [monthCount, setMonthCount] = useState(0);
    const [recentTitle, setRecentTitle] = useState<string | null>(null);

    const [mode, setMode] = useState<"home" | "tips" | "crop" | "mask">("home");
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

    const [dragStart, setDragStart] = useState<Point | null>(null);
    const [dragRect, setDragRect] = useState<Rect | null>(null);

    const [maskStrokes, setMaskStrokes] = useState<Point[][]>([]);
    const [currentStroke, setCurrentStroke] = useState<Point[] | null>(null);

    useEffect(() => {
        const history = getHistory();
        setMonthCount(countThisMonth(history));
        setRecentTitle(history[0]?.title ?? null);
    }, []);

    const resetToStep = (nextMode: "home" | "tips" | "crop" | "mask") => {
        setDragStart(null);
        setDragRect(null);
        if (nextMode === "mask") {
            setMaskStrokes([]);
            setCurrentStroke(null);
        }
        setMode(nextMode);
    };

    const handleFileSelected = async (file: File) => {
        const url = URL.createObjectURL(file);
        try {
            const img = await loadImage(url);
            const brightness = computeAverageBrightness(img);
            console.log("사진 밝기(0~255):", brightness);
            if (brightness < 55) {
                alert("사진이 너무 어두워요. 밝은 곳에서 다시 찍어주세요.");
                URL.revokeObjectURL(url);
                return;
            }
        } catch (err) {
            console.error(err);
        }
        setImgUrl(url);
        resetToStep("crop");
    };

    const handleImgLoad = () => {
        if (imgRef.current) {
            setNaturalSize({ width: imgRef.current.naturalWidth, height: imgRef.current.naturalHeight });
        }
    };

    const getRelativePoint = (clientX: number, clientY: number): Point => {
        const box = containerRef.current?.getBoundingClientRect();
        if (!box) return { x: 0, y: 0 };
        return {
            x: Math.min(Math.max(clientX - box.left, 0), box.width),
            y: Math.min(Math.max(clientY - box.top, 0), box.height),
        };
    };

    const handleCropPointerDown = (e: React.PointerEvent) => {
        const p = getRelativePoint(e.clientX, e.clientY);
        setDragStart(p);
        setDragRect({ x: p.x, y: p.y, width: 0, height: 0 });
    };
    const handleCropPointerMove = (e: React.PointerEvent) => {
        if (!dragStart) return;
        const p = getRelativePoint(e.clientX, e.clientY);
        setDragRect({
            x: Math.min(dragStart.x, p.x),
            y: Math.min(dragStart.y, p.y),
            width: Math.abs(p.x - dragStart.x),
            height: Math.abs(p.y - dragStart.y),
        });
    };
    const handleCropPointerUp = () => setDragStart(null);

    const handleMaskPointerDown = (e: React.PointerEvent) => {
        const p = getRelativePoint(e.clientX, e.clientY);
        setCurrentStroke([p]);
    };
    const handleMaskPointerMove = (e: React.PointerEvent) => {
        if (!currentStroke) return;
        const p = getRelativePoint(e.clientX, e.clientY);
        setCurrentStroke((prev) => (prev ? [...prev, p] : [p]));
    };
    const handleMaskPointerUp = () => {
        if (currentStroke && currentStroke.length > 0) {
            setMaskStrokes((strokes) => [...strokes, currentStroke]);
        }
        setCurrentStroke(null);
    };
    const handleUndoLastMask = () => setMaskStrokes((prev) => prev.slice(0, -1));
    const handleClearMasks = () => setMaskStrokes([]);

    const runOcrOnBlob = async (blob: Blob, redactedDataUrl: string) => {
        setLoading(true);
        try {
            const worker = await createWorker("kor");
            const { data } = await worker.recognize(blob);
            await worker.terminate();

            console.log("OCR 확신도:", data.confidence);

            const CONFIDENCE_THRESHOLD = 45;
            if (data.confidence < CONFIDENCE_THRESHOLD) {
                alert("사진이 잘 안 읽혔어요. 문서를 평평하게 펴고, 밝은 곳에서 필요한 부분만 크게 다시 찍어주세요.");
                setLoading(false);
                setMode("home");
                return;
            }

            const { masked } = maskText(data.text);
            sessionStorage.setItem("ddobaki_masked_text", masked);
            sessionStorage.setItem("ddobaki_redacted_image", redactedDataUrl);
            router.push("/confirm");
        } catch (err) {
            console.error(err);
            alert("사진을 읽는 데 실패했어요. 사진이 흐리거나 파일이 너무 클 수 있어요. 다른 사진으로 다시 시도해주세요.");
            setLoading(false);
            setMode("home");
        }
    };

    const handleUseFullImage = () => resetToStep("mask");

    const handleConfirmCrop = async () => {
        if (!imgRef.current || !naturalSize || !containerRef.current || !dragRect) return;
        if (dragRect.width < 20 || dragRect.height < 20) {
            alert("선택한 영역이 너무 작아요. 좀 더 크게 그려주세요.");
            return;
        }
        const box = containerRef.current.getBoundingClientRect();
        const natural = scaleRectToNatural(dragRect, { width: box.width, height: box.height }, naturalSize);
        const blob = await cropImageToBlob(imgRef.current, natural);
        const newUrl = URL.createObjectURL(blob);
        if (imgUrl) URL.revokeObjectURL(imgUrl);
        setImgUrl(newUrl);
        resetToStep("mask");
    };

    const handleFinishMasking = async () => {
        if (!imgRef.current || !naturalSize || !containerRef.current) return;
        const box = containerRef.current.getBoundingClientRect();
        const scaleX = naturalSize.width / box.width;
        const scaleY = naturalSize.height / box.height;

        const strokesNatural = maskStrokes.map((stroke) => ({
            points: stroke.map((p) => ({ x: p.x * scaleX, y: p.y * scaleY })),
            width: BRUSH_WIDTH * scaleX,
        }));

        const blob = await applyStrokeRedactions(imgRef.current, strokesNatural);
        const dataUrl = await blobToDataUrl(blob);
        setMode("home");
        await runOcrOnBlob(blob, dataUrl);
    };

    const handleCancelAll = () => {
        if (imgUrl) URL.revokeObjectURL(imgUrl);
        setImgUrl(null);
        setMode("home");
    };

    const hiddenInputStyle: React.CSSProperties = {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
    };

    const fileInputEl = (
        <input
            id="ddobaki-file-input"
            type="file"
            accept="image/*"
            style={hiddenInputStyle}
            onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) handleFileSelected(file);
                e.currentTarget.value = "";
            }}
        />
    );

    const strokeToSvgPoints = (stroke: Point[]) => stroke.map((p) => `${p.x},${p.y}`).join(" ");

    // ===== 촬영 전 안내 화면 =====
    if (mode === "tips") {
        return (
            <main className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-center relative">
                        <button onClick={() => setMode("home")} className="absolute left-0">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                <path d="M15 5L8 12L15 19" stroke="#14171B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="text-[15px] font-bold">촬영 전 안내</div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-3 bg-white border border-line rounded-2xl p-3.5">
                            <div className="w-9 h-9 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="4.2" stroke="#14171B" strokeWidth="1.6" />
                                    <path d="M12 3.5V6M12 18V20.5M20.5 12H18M6 12H3.5M17.3 6.7L15.6 8.4M8.4 15.6L6.7 17.3M17.3 17.3L15.6 15.6M8.4 8.4L6.7 6.7" stroke="#14171B" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold">밝은 곳에서 찍어주세요</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-line rounded-2xl p-3.5">
                            <div className="w-9 h-9 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="4.5" y="6" width="15" height="12" rx="1.5" stroke="#14171B" strokeWidth="1.6" />
                                    <path d="M7.5 12H16.5" stroke="#14171B" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold">종이를 평평하게 펴주세요</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-line rounded-2xl p-3.5">
                            <div className="w-9 h-9 rounded-lg bg-hlwash flex items-center justify-center flex-shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 4H5C4.44772 4 4 4.44772 4 5V9" stroke="#14171B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15 20H19C19.5523 20 20 19.5523 20 19V15" stroke="#14171B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold">여러 장이 겹쳐 있으면, 필요한 부분만 확대해서 찍어주세요</p>
                        </div>
                    </div>

                    {fileInputEl}
                    <label
                        htmlFor="ddobaki-file-input"
                        className="w-full h-[50px] rounded-2xl bg-ink text-white font-bold text-sm flex items-center justify-center cursor-pointer mt-1"
                    >
                        네, 확인했어요. 사진 선택하기
                    </label>
                </div>
            </main>
        );
    }

    // ===== 자르기 화면 =====
    if (mode === "crop" && imgUrl) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-center relative">
                        <button onClick={handleCancelAll} className="absolute left-0">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                <path d="M15 5L8 12L15 19" stroke="#14171B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="text-[15px] font-bold">필요한 부분만 선택</div>
                    </div>
                    <div className="bg-hlwash rounded-2xl px-3.5 py-3 flex flex-col gap-1.5">
                        <p className="text-sm font-bold text-inksoft text-center leading-snug">
                            필요한 부분만<br />손가락으로 네모를 그려주세요
                        </p>
                        <p className="text-[11px] text-muted text-center leading-relaxed">
                            여러 구역이 겹친 문서일 때 유용해요<br />
                            안 그리셔도 괜찮아요, 아래 &quot;전체 사용&quot;을 누르셔도 돼요
                        </p>
                    </div>
                    <div
                        ref={containerRef}
                        onPointerDown={handleCropPointerDown}
                        onPointerMove={handleCropPointerMove}
                        onPointerUp={handleCropPointerUp}
                        className="relative w-full rounded-2xl overflow-hidden border border-line"
                        style={{ touchAction: "none" }}
                    >
                        <img ref={imgRef} src={imgUrl} onLoad={handleImgLoad} alt="선택한 문서" className="w-full h-auto block select-none pointer-events-none" draggable={false} />
                        {dragRect && (
                            <>
                                <div className="absolute bg-black/55" style={{ left: 0, top: 0, right: 0, height: dragRect.y }} />
                                <div className="absolute bg-black/55" style={{ left: 0, top: dragRect.y + dragRect.height, right: 0, bottom: 0 }} />
                                <div className="absolute bg-black/55" style={{ left: 0, top: dragRect.y, width: dragRect.x, height: dragRect.height }} />
                                <div className="absolute bg-black/55" style={{ left: dragRect.x + dragRect.width, top: dragRect.y, right: 0, height: dragRect.height }} />
                                <div className="absolute border-2" style={{ left: dragRect.x, top: dragRect.y, width: dragRect.width, height: dragRect.height, borderColor: "#DCEB4A" }} />
                            </>
                        )}
                    </div>
                    <div className="flex flex-col gap-2.5 mt-1">
                        <button onClick={handleConfirmCrop} disabled={!dragRect || dragRect.width < 20 || dragRect.height < 20} className="w-full h-[50px] rounded-2xl bg-ink text-white font-bold text-sm disabled:opacity-40">
                            이 부분만 사용하기
                        </button>
                        <button onClick={handleUseFullImage} className="w-full h-[50px] rounded-2xl bg-white border border-line font-bold text-sm">
                            전체 사용
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // ===== 가리기 화면 (형광펜 문지르기) =====
    if (mode === "mask" && imgUrl) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-center relative">
                        <button onClick={handleCancelAll} className="absolute left-0">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                <path d="M15 5L8 12L15 19" stroke="#14171B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="text-[15px] font-bold">개인정보 가리기</div>
                    </div>

                    <div className="bg-hlwash rounded-2xl px-3.5 py-3 flex flex-col gap-1.5">
                        <p className="text-sm font-bold text-inksoft text-center leading-snug">
                            이름처럼 못 가린 부분만<br />손가락으로 문질러주세요
                        </p>
                        <p className="text-[11px] text-muted text-center leading-relaxed">
                            숫자(주민번호·전화번호)는 다음 단계에서 한 번 더 확인해요<br />
                            가릴 게 없으면 바로 아래 버튼을 눌러도 괜찮아요
                        </p>
                    </div>

                    <div
                        ref={containerRef}
                        onPointerDown={handleMaskPointerDown}
                        onPointerMove={handleMaskPointerMove}
                        onPointerUp={handleMaskPointerUp}
                        className="relative w-full rounded-2xl overflow-hidden border border-line"
                        style={{ touchAction: "none" }}
                    >
                        <img ref={imgRef} src={imgUrl} onLoad={handleImgLoad} alt="선택한 문서" className="w-full h-auto block select-none pointer-events-none" draggable={false} />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {maskStrokes.map((stroke, i) =>
                                stroke.length === 1 ? (
                                    <circle key={i} cx={stroke[0].x} cy={stroke[0].y} r={BRUSH_WIDTH / 2} fill="#14171B" />
                                ) : (
                                    <polyline
                                        key={i}
                                        points={strokeToSvgPoints(stroke)}
                                        fill="none"
                                        stroke="#14171B"
                                        strokeWidth={BRUSH_WIDTH}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )
                            )}
                            {currentStroke && currentStroke.length === 1 && (
                                <circle cx={currentStroke[0].x} cy={currentStroke[0].y} r={BRUSH_WIDTH / 2} fill="#14171B" opacity={0.85} />
                            )}
                            {currentStroke && currentStroke.length > 1 && (
                                <polyline
                                    points={strokeToSvgPoints(currentStroke)}
                                    fill="none"
                                    stroke="#14171B"
                                    strokeWidth={BRUSH_WIDTH}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity={0.85}
                                />
                            )}
                        </svg>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-bold text-inksoft">{maskStrokes.length}곳 가려짐</p>
                        <div className="flex gap-3">
                            {maskStrokes.length > 0 && (
                                <button onClick={handleUndoLastMask} className="text-xs font-bold text-inksoft underline">
                                    방금 것 취소
                                </button>
                            )}
                            {maskStrokes.length > 0 && (
                                <button onClick={handleClearMasks} className="text-xs font-bold underline" style={{ color: "#B23A2E" }}>
                                    전체 초기화
                                </button>
                            )}
                        </div>
                    </div>

                    <button onClick={handleFinishMasking} className="w-full h-[50px] rounded-2xl bg-ink text-white font-bold text-sm mt-1">
                        다 가렸어요, 다음으로
                    </button>
                </div>
            </main>
        );
    }

    // ===== 홈 화면 =====
    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="font-display text-xl">또박이</div>
                    <Link href="/settings" className="w-9 h-9 rounded-full bg-hlwash flex items-center justify-center">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                            <path d="M4 7H14M18 7H20" stroke="#14171B" strokeWidth="1.6" strokeLinecap="round" />
                            <circle cx="16" cy="7" r="2" stroke="#14171B" strokeWidth="1.6" />
                            <path d="M4 17H6M10 17H20" stroke="#14171B" strokeWidth="1.6" strokeLinecap="round" />
                            <circle cx="8" cy="17" r="2" stroke="#14171B" strokeWidth="1.6" />
                        </svg>
                    </Link>
                </div>

                <h1 className="font-display text-2xl leading-relaxed">어려운 안내문,<br />또박또박 읽어드릴게요.</h1>
                <p className="text-sm text-inksoft leading-relaxed">사진을 넣으면 중요한 부분만<br />형광펜으로 표시해 알려드려요.</p>

                <div className="bg-white border border-line rounded-3xl p-4 relative flex flex-col gap-2">
                    <div className="h-2.5 rounded bg-line w-1/2 opacity-60" />
                    <div className="h-2 rounded bg-line w-11/12" />
                    <div className="h-2 rounded bg-hl w-3/4" />
                    <div className="h-2 rounded bg-line w-4/5" />
                    <div className="h-2 rounded bg-line w-3/5" />
                </div>

                <button onClick={() => setMode("tips")} disabled={loading} className="w-full h-[52px] rounded-2xl bg-ink text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? (
                        "문서를 읽는 중이에요..."
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M4 8H7L9 5H15L17 8H20V19H4V8Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
                                <circle cx="12" cy="13" r="3.2" stroke="white" strokeWidth="1.6" />
                            </svg>
                            사진 선택하기
                        </>
                    )}
                </button>

                <Link href="/history" className="flex items-center justify-between bg-white border border-line rounded-2xl px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-hlwash flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15.5 9.2" stroke="#14171B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="9" stroke="#14171B" strokeWidth="1.6" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xs font-bold">
                                {monthCount > 0 ? `이번 달 ${monthCount}건 확인` : "아직 확인한 문서가 없어요"}
                            </div>
                            <div className="text-[11px] text-muted">{recentTitle ? `가장 최근: ${recentTitle}` : "첫 문서를 확인해보세요"}</div>
                        </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6L15 12L9 18" stroke="#8B9088" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>

                <p className="text-[11px] text-muted text-center">원본은 확인이 끝나면 자동으로 삭제돼요</p>
            </div>
        </main>
    );
}