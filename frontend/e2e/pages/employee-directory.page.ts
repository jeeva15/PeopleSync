import { expect, type Locator, type Page } from "@playwright/test";

export class EmployeeDirectoryPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/employees");
    await expect(this.page.getByRole("heading", { name: "Employees" })).toBeVisible();
    await expect(this.page.getByLabel("Loading employees")).toBeHidden();
  }

  employeeRow(name: string): Locator {
    return this.page.getByRole("row").filter({ has: this.page.getByRole("link", { name }) });
  }

  async searchFor(value: string) {
    await this.page.getByLabel("Search employees").fill(value);
  }

  async filterByDepartment(name: string) {
    await this.page.getByLabel("Filter by department").selectOption({ label: name });
  }

  async filterByStatus(status: "Active" | "Inactive") {
    await this.page.getByLabel("Filter by status").selectOption({ label: status });
  }

  async startCreatingEmployee() {
    await this.page.getByRole("link", { name: "Add employee" }).first().click();
    await expect(this.page.getByRole("heading", { name: "Add employee" })).toBeVisible();
  }

  async openEmployee(name: string) {
    await this.employeeRow(name).getByTestId(/employee-details-/).click();
  }
}
