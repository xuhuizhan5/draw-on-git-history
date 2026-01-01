import type {
  GenerateRequest,
  GenerateResponse,
  PreviewRequest,
  PreviewResponse,
} from "../../../shared/src/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * Generic API error.
 */
export class ApiError extends Error {
  readonly status: number;

  /**
   * @param message Error message.
   * @param status HTTP status code.
   */
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the preview endpoint.
 *
 * @param payload Preview request.
 * @return Preview response.
 */
export async function previewPlan(
  payload: PreviewRequest
): Promise<PreviewResponse> {
  return sendJson<PreviewResponse>(`${API_BASE}/api/preview`, payload);
}

/**
 * Calls the generate endpoint.
 *
 * @param payload Generate request.
 * @return Generate response.
 */
export async function generatePlan(
  payload: GenerateRequest
): Promise<GenerateResponse> {
  return sendJson<GenerateResponse>(`${API_BASE}/api/generate`, payload);
}

/**
 * Sends a JSON POST request.
 *
 * @param url Endpoint URL.
 * @param body Request body.
 * @return JSON response.
 */
async function sendJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(payload.error ?? "Request failed", response.status);
  }

  return response.json() as Promise<T>;
}
