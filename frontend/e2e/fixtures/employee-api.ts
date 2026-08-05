import type { Page, Route } from "@playwright/test";

export type Status = "ACTIVE" | "INACTIVE";

export interface Department {
  id: number;
  name: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  department: Pick<Department, "id" | "name" | "status">;
  jobTitle: string;
  status: Status;
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeInput {
  fullName: string;
  email: string;
  departmentId: number;
  jobTitle: string;
  status: Status;
  joiningDate: string;
}

const now = "2026-01-15T08:30:00Z";

export const departments: Department[] = [
  { id: 1, name: "Engineering", status: "ACTIVE", createdAt: now, updatedAt: now },
  { id: 2, name: "Finance", status: "ACTIVE", createdAt: now, updatedAt: now },
];

const initialEmployees: Employee[] = [
  {
    id: 7,
    fullName: "Aisha Tan",
    email: "aisha@example.com",
    department: { id: 1, name: "Engineering", status: "ACTIVE" },
    jobTitle: "Software Engineer",
    status: "ACTIVE",
    joiningDate: "2023-04-17",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 8,
    fullName: "Daniel Lim",
    email: "daniel@example.com",
    department: { id: 2, name: "Finance", status: "ACTIVE" },
    jobTitle: "Financial Analyst",
    status: "ACTIVE",
    joiningDate: "2022-09-05",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 9,
    fullName: "Ravi Kumar",
    email: "ravi@example.com",
    department: { id: 1, name: "Engineering", status: "ACTIVE" },
    jobTitle: "Senior Engineer",
    status: "INACTIVE",
    joiningDate: "2020-06-22",
    createdAt: now,
    updatedAt: now,
  },
];

function apiError(status: number, code: string, message: string, errors: unknown[] = []) {
  return { timestamp: now, status, code, message, path: "/api/v1/employees", errors };
}

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

export async function installEmployeeApi(
  page: Page,
  options: { duplicateEmails?: string[] } = {},
) {
  const employees = structuredClone(initialEmployees);
  let nextId = 100;

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (method === "GET" && path.endsWith("/departments")) {
      await json(route, 200, departments);
      return;
    }

    if (path.endsWith("/employees") && method === "GET") {
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const departmentId = url.searchParams.get("departmentId");
      const status = url.searchParams.get("status");
      const pageNumber = Number(url.searchParams.get("page") ?? 1);
      const pageSize = Number(url.searchParams.get("pageSize") ?? 10);

      const filtered = employees.filter((employee) =>
        (!search || employee.fullName.toLowerCase().includes(search) || employee.email.toLowerCase().includes(search)) &&
        (!departmentId || String(employee.department.id) === departmentId) &&
        (!status || employee.status === status),
      );
      const start = (pageNumber - 1) * pageSize;
      await json(route, 200, {
        items: filtered.slice(start, start + pageSize),
        page: pageNumber,
        pageSize,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      });
      return;
    }

    if (path.endsWith("/employees") && method === "POST") {
      const input = request.postDataJSON() as EmployeeInput;
      const duplicate = employees.some((employee) => employee.email.toLowerCase() === input.email.toLowerCase()) ||
        options.duplicateEmails?.some((email) => email.toLowerCase() === input.email.toLowerCase());
      if (duplicate) {
        await json(route, 409, apiError(409, "CONFLICT", "An employee with this email already exists"));
        return;
      }
      const department = departments.find((item) => item.id === input.departmentId)!;
      const employee: Employee = {
        id: nextId++,
        fullName: input.fullName,
        email: input.email,
        department: { id: department.id, name: department.name, status: department.status },
        jobTitle: input.jobTitle,
        status: input.status,
        joiningDate: input.joiningDate,
        createdAt: now,
        updatedAt: now,
      };
      employees.push(employee);
      await json(route, 201, employee);
      return;
    }

    const employeeMatch = path.match(/\/employees\/(\d+)$/);
    if (employeeMatch) {
      const id = Number(employeeMatch[1]);
      const employee = employees.find((item) => item.id === id);
      if (!employee) {
        await json(route, 404, apiError(404, "RESOURCE_NOT_FOUND", "Employee not found"));
        return;
      }
      if (method === "GET") {
        await json(route, 200, employee);
        return;
      }
      if (method === "PUT") {
        const input = request.postDataJSON() as EmployeeInput;
        const department = departments.find((item) => item.id === input.departmentId)!;
        Object.assign(employee, input, {
          department: { id: department.id, name: department.name, status: department.status },
          updatedAt: "2026-01-16T09:00:00Z",
        });
        await json(route, 200, employee);
        return;
      }
      if (method === "DELETE") {
        employee.status = "INACTIVE";
        await route.fulfill({ status: 204, body: "" });
        return;
      }
    }

    await json(route, 404, apiError(404, "RESOURCE_NOT_FOUND", "Resource not found"));
  });

  return { employees };
}
