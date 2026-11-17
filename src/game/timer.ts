import { ADVENTURE_TIME_LIMIT_SEC } from '../config';

/** 실제 시각(deadlineMs - nowMs) 기준으로 남은 초를 올림 계산한다(0 미만 방지). */
export function computeRemainingSeconds(
  deadlineMs: number,
  nowMs: number,
): number {
  const remainingMs = Math.max(0, deadlineMs - nowMs);
  return remainingMs === 0 ? 0 : Math.ceil(remainingMs / 1000);
}

/** 남은 초를 MM:SS 형식 문자열로 변환한다. */
export function formatRemainingTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/** 표시할 남은 시간을 0 이상 정수로 보정한다. */
export function resolveDisplayedRemainingSeconds(
  localRemainingSeconds: number = ADVENTURE_TIME_LIMIT_SEC,
): number {
  return Math.max(0, Math.floor(localRemainingSeconds));
}
