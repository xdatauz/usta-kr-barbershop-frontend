import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// ── ApiError ──────────────────────────────────────────────────────────────────

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  fields?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;
  raw?: unknown;

  constructor(params: { message: string; status: number; code?: string; fields?: Record<string, string>; raw?: unknown }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.fields = params.fields;
    this.raw = params.raw;
  }
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export const ACCESS_TOKEN_KEY = "usta_access_token";
export const REFRESH_TOKEN_KEY = "usta_refresh_token";

export const getAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem("access_token");

export const setAccessToken = (token: string | null) => {
  if (!token) { localStorage.removeItem(ACCESS_TOKEN_KEY); return; }
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string | null) => {
  if (!token) { localStorage.removeItem(REFRESH_TOKEN_KEY); return; }
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearStoredTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("access_token");
};

// ── Axios instance ────────────────────────────────────────────────────────────

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/$/, "") ?? "";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  withCredentials: true,
  // 30s ceiling so a hanging request fails loudly instead of leaving the user
  // staring at a spinner for a minute (#18 in the audit).
  timeout: 30_000,
});

// Attach auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});

// ── Token refresh ─────────────────────────────────────────────────────────────

let refreshRequest: Promise<string | null> | null = null;

const requestAccessTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) { clearStoredTokens(); return null; }

  const response = await axios.post(
    `${API_BASE_URL}/api/v1/auth/refresh`,
    { refreshToken },
    { headers: { Accept: "application/json", "Content-Type": "application/json" }, withCredentials: true },
  );

  const payload = response.data;
  if (payload?.success === false) { clearStoredTokens(); return null; }

  const data = payload?.data ?? payload;
  const accessToken =
    typeof data?.accessToken === "string" ? data.accessToken
    : typeof data?.token === "string" ? data.token
    : null;
  const newRefreshToken = typeof data?.refreshToken === "string" ? data.refreshToken : null;

  if (!accessToken) { clearStoredTokens(); return null; }

  setAccessToken(accessToken);
  setRefreshToken(newRefreshToken ?? refreshToken);
  return accessToken;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshRequest) {
    refreshRequest = requestAccessTokenRefresh().finally(() => { refreshRequest = null; });
  }
  return refreshRequest;
};

// ── Response interceptor ──────────────────────────────────────────────────────

api.interceptors.response.use(
  // Success handler — backend always returns HTTP 200
  async (response: AxiosResponse) => {
    const payload = response.data;

    // Handle backend error (HTTP 200 but success: false)
    if (payload && typeof payload === "object" && payload.success === false) {
      const err = (payload.error ?? {}) as Record<string, unknown>;
      const originalRequest = response.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (err.statusCode === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
        originalRequest._retry = true;
        try {
          const token = await refreshAccessToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch { clearStoredTokens(); }
      }

      throw new ApiError({
        status: (err.statusCode as number) ?? 500,
        message: (err.message as string) ?? "Request failed",
        code: err.code as string | undefined,
        fields: err.fields as Record<string, string> | undefined,
        raw: payload,
      });
    }

    // Unwrap success envelope: { success: true, data: <actual> }
    if (payload && typeof payload === "object" && payload.success === true && "data" in payload) {
      response.data = payload.data;
    }

    return response;
  },

  // HTTP error handler (non-200 — fallback for old backend)
  async (error: AxiosError) => {
    if (!error.response) {
      throw new ApiError({ status: 0, message: error.message ?? "Network error", raw: error });
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response.status;
    const payload = error.response.data as Record<string, unknown> | undefined;
    const errObj = (payload?.error ?? {}) as Record<string, unknown>;

    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
      originalRequest._retry = true;
      try {
        const token = await refreshAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch { clearStoredTokens(); }
    }

    throw new ApiError({
      status,
      message: (errObj.message as string) ?? (payload?.message as string) ?? error.message ?? `Request failed`,
      code: errObj.code as string | undefined,
      fields: errObj.fields as Record<string, string> | undefined,
      raw: payload,
    });
  },
);

export default api;
export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
