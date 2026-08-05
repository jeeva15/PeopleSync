import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeeForm from "./index";
import { api } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  api: {
    departments: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
  },
  ApiRequestError: class ApiRequestError extends Error {
    fieldErrors = {};
  },
}));

describe("EmployeeForm", () => {
  beforeEach(() => {
    vi.mocked(api.departments).mockResolvedValue([]);
    vi.clearAllMocks();
  });

  it("shows field-level validation and prevents an invalid submission", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([{ path: "/", element: <EmployeeForm /> }]);
    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "Create employee" }));

    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid business email.")).toBeInTheDocument();
    expect(screen.getByText("Select a department.")).toBeInTheDocument();
    expect(screen.getByText("Joining date is required.")).toBeInTheDocument();
    expect(api.createEmployee).not.toHaveBeenCalled();
  });

  it("warns before discarding client-side changes", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        { path: "/employees", element: <div>Employees</div> },
        { path: "/employees/new", element: <EmployeeForm /> },
      ],
      { initialEntries: ["/employees", "/employees/new"], initialIndex: 1 },
    );
    render(<RouterProvider router={router} />);

    await user.type(screen.getByLabelText(/Full name/), "Aisha Tan");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("alertdialog", { name: "Discard unsaved changes?" })).toBeInTheDocument();
    expect(screen.queryByText("Employees")).not.toBeInTheDocument();
  });
});
