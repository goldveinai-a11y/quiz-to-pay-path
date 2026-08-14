import { useCallback, useEffect, useState } from "react";
import type { Answers } from "./types";

const KEY = "bible-quiz-answers-v1";
const UTM_KEY = "bible-quiz-utm-v1";

export function loadAnswers(): Answers {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Answers;
  } catch {
    return {};
  }
}

export function saveAnswers(a: Answers) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(a));
}

export function captureUtm() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const data: Record<string, string> = {};
  params.forEach((v, k) => {
    if (k.startsWith("utm_") || k.includes("_id") || k === "mode" || k.startsWith("ad_")) {
      data[k] = v;
    }
  });
  if (Object.keys(data).length) {
    window.localStorage.setItem(UTM_KEY, JSON.stringify(data));
  }
}

export function useAnswers() {
  const [answers, setAnswers] = useState<Answers>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAnswers(loadAnswers());
    setHydrated(true);
  }, []);

  const setAnswer = useCallback((id: string, value: string | string[] | number) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      saveAnswers(next);
      return next;
    });
  }, []);

  return { answers, setAnswer, hydrated };
}