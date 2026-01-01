import { EventEmitter } from "node:events";

/**
 * Status values for generation progress updates.
 */
export type ProgressStatus = "pending" | "running" | "complete" | "error";

/**
 * Progress payload emitted to listeners.
 */
export interface ProgressState {
  id: string;
  status: ProgressStatus;
  progress: number;
  message?: string;
  error?: string;
  updatedAt: string;
}

const CLEANUP_DELAY_MS = 10 * 60 * 1000;
const emitter = new EventEmitter();
const progressStore = new Map<string, ProgressState>();

emitter.setMaxListeners(100);

function nowIso(): string {
  return new Date().toISOString();
}

function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function publish(state: ProgressState): void {
  progressStore.set(state.id, state);
  emitter.emit(state.id, state);
}

function scheduleCleanup(id: string): void {
  const timeout = setTimeout(() => {
    progressStore.delete(id);
  }, CLEANUP_DELAY_MS);
  timeout.unref?.();
}

/**
 * Returns the latest progress state for an id.
 *
 * @param id Progress id.
 * @return Progress state or null.
 */
export function getProgress(id: string): ProgressState | null {
  return progressStore.get(id) ?? null;
}

/**
 * Ensures a progress record exists for an id.
 *
 * @param id Progress id.
 * @return Progress state.
 */
export function ensureProgress(id: string): ProgressState {
  const existing = progressStore.get(id);
  if (existing) {
    return existing;
  }
  const state: ProgressState = {
    id,
    status: "pending",
    progress: 0,
    message: "Waiting for generation",
    updatedAt: nowIso(),
  };
  progressStore.set(id, state);
  return state;
}

/**
 * Marks progress as started.
 *
 * @param id Progress id.
 * @param message Optional status message.
 * @return Progress state.
 */
export function startProgress(id: string, message?: string): ProgressState {
  const state: ProgressState = {
    id,
    status: "running",
    progress: 0,
    message: message ?? "Starting generation",
    updatedAt: nowIso(),
  };
  publish(state);
  return state;
}

/**
 * Updates progress percentage and message.
 *
 * @param id Progress id.
 * @param progress Progress percent.
 * @param message Optional status message.
 * @return Progress state.
 */
export function updateProgress(
  id: string,
  progress: number,
  message?: string
): ProgressState {
  const base = ensureProgress(id);
  const state: ProgressState = {
    ...base,
    status: "running",
    progress: clampProgress(progress),
    message: message ?? base.message,
    updatedAt: nowIso(),
  };
  publish(state);
  return state;
}

/**
 * Marks progress as complete.
 *
 * @param id Progress id.
 * @param message Optional status message.
 * @return Progress state.
 */
export function completeProgress(id: string, message?: string): ProgressState {
  const base = ensureProgress(id);
  const state: ProgressState = {
    ...base,
    status: "complete",
    progress: 100,
    message: message ?? "Complete",
    updatedAt: nowIso(),
  };
  publish(state);
  scheduleCleanup(id);
  return state;
}

/**
 * Marks progress as failed.
 *
 * @param id Progress id.
 * @param error Error message.
 * @return Progress state.
 */
export function failProgress(id: string, error: string): ProgressState {
  const base = ensureProgress(id);
  const state: ProgressState = {
    ...base,
    status: "error",
    error,
    message: "Generation failed",
    updatedAt: nowIso(),
  };
  publish(state);
  scheduleCleanup(id);
  return state;
}

/**
 * Subscribes to progress updates for an id.
 *
 * @param id Progress id.
 * @param listener Callback invoked with updates.
 * @return Cleanup function.
 */
export function subscribeProgress(
  id: string,
  listener: (state: ProgressState) => void
): () => void {
  emitter.on(id, listener);
  return () => emitter.off(id, listener);
}
