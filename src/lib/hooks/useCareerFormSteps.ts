export type CareerDraft = Record<string, any>;

export function getStepFromUrl(defaultStep: number = 1): number {
    if (typeof window === "undefined") return defaultStep;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("step");
    const n = raw ? parseInt(raw, 10) : defaultStep;
    if (Number.isNaN(n)) return defaultStep;
    return Math.min(Math.max(n, 1), 5);
}

export function setStepInUrl(step: number) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("step", String(step));
    window.location.href = url.toString();
}

export function getDraftKey(orgID?: string | null) {
    return `careerFormDraft:${orgID || "anon"}`;
}

export function readDraft(orgID?: string | null): CareerDraft | null {
    if (typeof window === "undefined") return null;
    try {
        const key = getDraftKey(orgID);
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as CareerDraft) : null;
    } catch {
        return null;
    }
}

export function writeDraft(partial: CareerDraft, orgID?: string | null) {
    if (typeof window === "undefined") return;
    const key = getDraftKey(orgID);
    const existing = readDraft(orgID) || {};
    const merged = { ...existing, ...partial };
    window.localStorage.setItem(key, JSON.stringify(merged));
}

export function clearDraft(orgID?: string | null) {
    if (typeof window === "undefined") return;
    const key = getDraftKey(orgID);
    window.localStorage.removeItem(key);
}


