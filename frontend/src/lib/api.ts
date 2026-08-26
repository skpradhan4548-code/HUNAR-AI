// API client for the FastAPI backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Agents ──────────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  voice_persona: string;
  persona_name: string;
  language: string;
  status: string;
  custom_variables: string[];
  result_schema: Record<string, string>;
  result_variables: string[];
  agent_code?: string;
  required_variables: string[];
  summary?: string;
  agent_prompt?: string;
  introduction?: string;
  objective?: string;
  created_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const agentsApi = {
  list: (params?: { language?: string; status?: string; page?: number; page_size?: number }) => {
    const qs = new URLSearchParams(
      Object.entries(params || {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return fetchAPI<PaginatedResponse<Agent>>(`/api/agents${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => fetchAPI<Agent>(`/api/agents/${id}`),
  create: (data: Partial<Agent> & { agent_prompt: string; objective: string; introduction: string; result_prompt: string; result_schema: Record<string, string> }) =>
    fetchAPI<Agent>("/api/agents", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Calls ───────────────────────────────────────────────────────────────────

export interface Call {
  id: string;
  callee_name: string;
  mobile_number: string;
  agent_id: string;
  status: string;
  lifecycle_status: string;
  duration_minutes?: number;
  duration_seconds?: number;
  recording_url?: string;
  result?: Record<string, string>;
  custom_data?: Record<string, string>;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  engagement_status?: string;
  answered_by?: string;
}

export const callsApi = {
  list: (params?: { status?: string; agent_id?: string; page?: number; page_size?: number }) => {
    const qs = new URLSearchParams(
      Object.entries(params || {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return fetchAPI<PaginatedResponse<Call>>(`/api/calls${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => fetchAPI<Call>(`/api/calls/${id}`),
  create: (data: {
    agent_id: string;
    callee_name: string;
    mobile_number: string;
    custom_data?: Record<string, string>;
    from_phone_number?: string;
    request_id?: string;
  }) => fetchAPI<Call>("/api/calls", { method: "POST", body: JSON.stringify(data) }),
  createBulk: (data: {
    agent_id: string;
    data: { callee_name: string; mobile_number: string; custom_data?: Record<string, string> }[];
    from_phone_number?: string;
    request_id?: string;
  }) => fetchAPI<Call[]>("/api/calls/bulk", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Numbers ─────────────────────────────────────────────────────────────────

export interface PhoneNumber {
  phone_number: string;
  allowed_countries: string[];
}

export const numbersApi = {
  list: () => fetchAPI<PaginatedResponse<PhoneNumber>>("/api/numbers"),
};

// ─── People Search ───────────────────────────────────────────────────────────

export interface Candidate {
  id: string;
  full_name: string;
  job_title: string;
  job_company_name: string;
  location_name: string;
  linkedin_url: string;
  skills: string[];
  experience_years: number;
  education: string;
  email: string;
  phone_numbers: string[];
  summary: string;
  _score?: number;
}

export interface SearchResponse {
  total: number;
  results: Candidate[];
  source: "pdl" | "mock";
  note?: string;
}

export const searchApi = {
  search: (data: { job_description: string; location?: string; limit?: number }) =>
    fetchAPI<SearchResponse>("/api/search", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Outreach ─────────────────────────────────────────────────────────────────

export const outreachApi = {
  initiate: (data: {
    agent_id: string;
    candidate: Candidate;
    mobile_number: string;
    from_phone_number?: string;
    job_title?: string;
    company_name?: string;
  }) => fetchAPI<Call>("/api/outreach", { method: "POST", body: JSON.stringify(data) }),
  getResults: () =>
    fetchAPI<{ results: { call_id: string; candidate: Candidate; status: string; result?: Record<string, string> }[]; count: number }>("/api/outreach/results"),
};

// ─── Attendance Demo ──────────────────────────────────────────────────────────

export interface AttendanceLog {
  id: string;
  employee_id: string;
  employee_name: string;
  location: string;
  channel: string;
  verified: boolean;
  timestamp: string;
}

export const attendanceApi = {
  log: (data: { employee_id: string; employee_name: string; location: string; channel: string; verified?: boolean }) =>
    fetchAPI<AttendanceLog>("/api/attendance/log", { method: "POST", body: JSON.stringify(data) }),
  getLogs: () => fetchAPI<{ logs: AttendanceLog[]; count: number }>("/api/attendance/logs"),
};
