import { expect, test } from "@playwright/test";
import { installEmployeeApi } from "./fixtures/employee-api";
import { EmployeeDetailsPage } from "./pages/employee-details.page";
import { EmployeeDirectoryPage } from "./pages/employee-directory.page";
import { EmployeeFormPage } from "./pages/employee-form.page";

test.describe("Employee Management critical journeys", () => {
  test("@critical journey 1: view, search, and filter employee records", async ({ page }) => {
    await installEmployeeApi(page);
    const directory = new EmployeeDirectoryPage(page);

    await directory.open();
    await expect(directory.employeeRow("Aisha Tan")).toBeVisible();
    await expect(directory.employeeRow("Daniel Lim")).toBeVisible();

    await directory.searchFor("aisha@example.com");
    await directory.filterByDepartment("Engineering");
    await directory.filterByStatus("Active");

    await expect(directory.employeeRow("Aisha Tan")).toBeVisible();
    await expect(directory.employeeRow("Daniel Lim")).toBeHidden();
    await expect(page.getByText("1–1")).toBeVisible();
  });

  test("@critical journey 2: create an employee and verify the new record", async ({ page }) => {
    await installEmployeeApi(page);
    const directory = new EmployeeDirectoryPage(page);
    const form = new EmployeeFormPage(page);
    const details = new EmployeeDetailsPage(page);
    const employee = {
      fullName: "Priya Nair",
      email: "priya.nair.e2e@example.com",
      jobTitle: "Platform Engineer",
      department: "Engineering",
      joiningDate: "2024-02-12",
    };

    await directory.open();
    await directory.startCreatingEmployee();
    await form.fill(employee);
    await form.create();

    await details.expectSaved("created");
    await details.expectEmployee(employee);
  });

  test("@critical journey 3: edit an employee and verify persisted changes", async ({ page }) => {
    await installEmployeeApi(page);
    const directory = new EmployeeDirectoryPage(page);
    const form = new EmployeeFormPage(page);
    const details = new EmployeeDetailsPage(page);

    await directory.open();
    await directory.openEmployee("Aisha Tan");
    await details.edit();
    await form.fill({
      fullName: "Aisha Tan-Smith",
      email: "aisha@example.com",
      jobTitle: "Principal Software Engineer",
      department: "Engineering",
      joiningDate: "2023-04-17",
    });
    await form.save();

    await details.expectSaved("updated");
    await details.expectEmployee({
      fullName: "Aisha Tan-Smith",
      email: "aisha@example.com",
      jobTitle: "Principal Software Engineer",
      department: "Engineering",
    });
    await page.reload();
    await details.expectEmployee({
      fullName: "Aisha Tan-Smith",
      email: "aisha@example.com",
      jobTitle: "Principal Software Engineer",
      department: "Engineering",
    });
  });

  test("@critical journey 4: show client validation and an API conflict", async ({ page }) => {
    await installEmployeeApi(page, { duplicateEmails: ["duplicate@example.com"] });
    const directory = new EmployeeDirectoryPage(page);
    const form = new EmployeeFormPage(page);

    await directory.open();
    await directory.startCreatingEmployee();
    await form.create();
    await form.expectValidation("Full name is required.");
    await form.expectValidation("Enter a valid business email.");
    await form.expectValidation("Select a department.");

    await form.fill({
      fullName: "Duplicate User",
      email: "duplicate@example.com",
      jobTitle: "Engineer",
      department: "Engineering",
      joiningDate: "2024-03-01",
    });
    await form.create();

    await form.expectServerError("An employee with this email already exists");
    await expect(page).toHaveURL(/\/employees\/new$/);
  });
});
