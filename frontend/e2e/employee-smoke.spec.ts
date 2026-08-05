import { expect, test } from "@playwright/test";

const departments = [
  { id: 1, name: "Engineering", status: "ACTIVE", createdAt: null, updatedAt: null },
];

const employeePage = {
  items: [{
    id: 7,
    fullName: "Aisha Tan",
    email: "aisha@example.com",
    department: { id: 1, name: "Engineering", status: "ACTIVE" },
    jobTitle: "Software Engineer",
    status: "ACTIVE",
    joiningDate: "2023-04-17",
    createdAt: "2023-04-17T00:00:00Z",
    updatedAt: "2023-04-17T00:00:00Z",
  }],
  page: 1,
  pageSize: 10,
  totalItems: 1,
  totalPages: 1,
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/departments?**", route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(departments) }));
  await page.route("**/api/v1/employees?**", route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(employeePage) }));
});

test("@smoke displays the employee directory", async ({ page }) => {
  await page.goto("/employees");
  await expect(page.getByRole("heading", { name: "Employees" })).toBeVisible();
  await expect(page.locator('a.employee-cell[href="/employees/7"]')).toContainText("Aisha Tan");
  await expect(page.getByText("Software Engineer")).toBeVisible();
});

test("@smoke validates required fields before creating an employee", async ({ page }) => {
  await page.goto("/employees/new");
  await page.getByRole("button", { name: "Create employee" }).click();
  await expect(page.getByText("Full name is required.")).toBeVisible();
  await expect(page.getByText("Enter a valid business email.")).toBeVisible();
  await expect(page.getByText("Select a department.")).toBeVisible();
});
