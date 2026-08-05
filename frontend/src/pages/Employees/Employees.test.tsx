import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeesPage from "./index";
import { api } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  api: {
    departments: vi.fn(),
    employees: vi.fn(),
    deactivateEmployee: vi.fn(),
  },
}));

describe("EmployeesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.departments).mockResolvedValue([]);
  });

  it("shows an explicit loading state while employees are requested", () => {
    vi.mocked(api.employees).mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><EmployeesPage /></MemoryRouter>);
    expect(screen.getByLabelText("Loading employees")).toBeInTheDocument();
  });

  it("shows the empty state when no employee matches", async () => {
    vi.mocked(api.employees).mockResolvedValue({
      items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0,
    });
    render(<MemoryRouter><EmployeesPage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "No employees found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add employee" })).toHaveAttribute("href", "/employees/new");
  });
});
