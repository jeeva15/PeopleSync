import { expect, type Page } from "@playwright/test";

export interface EmployeeFormValues {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  status?: "Active" | "Inactive";
}

export class EmployeeFormPage {
  constructor(private readonly page: Page) {}

  async fill(values: EmployeeFormValues) {
    await this.page.getByLabel(/^Full name/).fill(values.fullName);
    await this.page.getByLabel(/^Business email/).fill(values.email);
    await this.page.getByLabel(/^Job title/).fill(values.jobTitle);
    await this.page.getByLabel(/^Department/).selectOption({ label: values.department });
    await this.page.getByLabel(/^Joining date/).fill(values.joiningDate);
    if (values.status) await this.page.getByLabel(/^Employment status/).selectOption({ label: values.status });
  }

  async create() {
    await this.page.getByRole("button", { name: "Create employee" }).click();
  }

  async save() {
    await this.page.getByRole("button", { name: "Save changes" }).click();
  }

  async expectValidation(message: string) {
    await expect(this.page.getByText(message, { exact: true })).toBeVisible();
  }

  async expectServerError(message: string) {
    await expect(this.page.getByRole("alert")).toContainText(message);
  }
}
