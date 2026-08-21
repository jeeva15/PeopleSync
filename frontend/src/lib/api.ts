import type {
  ApiError,
  Department,
  Employee,
  EmployeeInput,
  PageResponse,
} from "./types";

const API_URL = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/$/, "");
const EMPLOYEE_FIELDS = new Set([
  "fullName",
  "email",
  "departmentId",
  "jobTitle",
  "status",
  "joiningDate",
]);

export class ApiRequestError extends Error {
  status: number;
  code: string;
  fieldErrors: Record<string, string>;
  constructor(status: number, error: ApiError) {
    super(
      error.message?.slice(0, 500) || "The request could not be completed.",
    );
    this.name = "ApiRequestError";
    this.status = status;
    this.code = error.code ?? "REQUEST_FAILED";
    this.fieldErrors = Object.fromEntries(
      (error.errors ?? [])
        .filter(
          (item) =>
            item &&
            typeof item.field === "string" &&
            typeof item.message === "string",
        )
        .map((item) => [
          item.field.split(".").at(-1) ?? "",
          item.message.slice(0, 300),
        ])
        .filter(([field]) => EMPLOYEE_FIELDS.has(field)),
    );
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body !== undefined;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body: ApiError = await response
      .json()
      .catch(() => ({ message: "The service is unavailable." }));
    throw new ApiRequestError(response.status, body);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export function parseEmployeeId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export const api = {
  employees: (query: URLSearchParams, signal?: AbortSignal) =>
    request<PageResponse<Employee>>(`/employees?${query}`, { signal }),
  employee: (id: number, signal?: AbortSignal) =>
    request<Employee>(`/employees/${id}`, { signal }),
  departments: (signal?: AbortSignal) =>
    request<Department[]>("/departments?activeOnly=true", { signal }),
  createEmployee: (body: EmployeeInput) =>
    request<Employee>("/employees", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateEmployee: (id: number, body: EmployeeInput) =>
    request<Employee>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deactivateEmployee: (id: number) =>
    request<void>(`/employees/${id}`, { method: "DELETE" }),
};
