import { expect, type Page } from "@playwright/test";

export class EmployeeDetailsPage {
  constructor(private readonly page: Page) {}

  async expectEmployee(values: { fullName: string; email: string; jobTitle: string; department: string }) {
    await expect(this.page.getByRole("heading", { name: values.fullName, exact: true })).toBeVisible();
    await expect(this.page.getByRole("link", { name: values.email })).toBeVisible();
    await expect(this.page.getByText(values.jobTitle, { exact: true }).first()).toBeVisible();
    await expect(this.page.getByText(values.department, { exact: true }).first()).toBeVisible();
  }

  async edit() {
    await this.page.getByRole("link", { name: "Edit employee" }).click();
    await expect(this.page.getByRole("heading", { name: "Edit employee" })).toBeVisible();
  }

  async expectSaved(action: "created" | "updated") {
    await expect(this.page.getByRole("status")).toContainText(`Employee ${action} successfully.`);
  }
}
