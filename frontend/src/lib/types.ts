export type EmploymentStatus = "ACTIVE" | "INACTIVE";

export interface Department {
  id: number;
  name: string;
  status: EmploymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  department: Pick<Department, "id" | "name" | "status">;
  jobTitle: string;
  status: EmploymentStatus;
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeInput {
  fullName: string;
  email: string;
  departmentId: number;
  jobTitle: string;
  status: EmploymentStatus;
  joiningDate: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  status?: number;
  code?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}
