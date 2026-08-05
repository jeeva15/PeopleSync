import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import EmployeeDetailsPage from "./index";
import { api } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  api: { employee: vi.fn() },
  parseEmployeeId: (value: string | undefined) => Number(value),
}));

describe("EmployeeDetailsPage", () => {
  it("ignores an intentionally aborted request", async () => {
    vi.mocked(api.employee).mockRejectedValue(
      new DOMException("The operation was aborted", "AbortError"),
    );

    render(
      <MemoryRouter initialEntries={["/employees/7"]}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await Promise.resolve();
    expect(screen.queryByText("Employee unavailable")).not.toBeInTheDocument();
    expect(document.querySelector(".detail-skeleton")).toBeInTheDocument();
  });
});
