import { useEffect, useRef, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import { api, ApiRequestError } from "../../lib/api";
import type { Department, Employee, EmployeeInput } from "../../lib/types";
import "./style.css";

const emptyForm: EmployeeInput = {
  fullName: "",
  email: "",
  departmentId: 0,
  jobTitle: "",
  status: "ACTIVE",
  joiningDate: "",
};

export default function EmployeeForm({ employee }: { employee?: Employee }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<EmployeeInput>(
    employee
      ? {
          fullName: employee.fullName,
          email: employee.email,
          departmentId: employee.department.id,
          jobTitle: employee.jobTitle,
          status: employee.status,
          joiningDate: employee.joiningDate,
        }
      : emptyForm,
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const allowNavigation = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !saving &&
      !allowNavigation.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    const controller = new AbortController();
    api
      .departments(controller.signal)
      .then(setDepartments)
      .catch((error: unknown) => {
        if (!(error instanceof Error && error.name === "AbortError")) {
          setMessage("Departments could not be loaded. Please try again.");
        }
      })
      .finally(() => setDepartmentsLoading(false));
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty && !saving) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);

  function update<K extends keyof EmployeeInput>(
    key: K,
    value: EmployeeInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    const fullName = form.fullName.trim();
    const jobTitle = form.jobTitle.trim();
    if (!fullName) {
      next.fullName = "Full name is required.";
    } else if (fullName.length > 150) {
      next.fullName = "Full name must be 150 characters or fewer.";
    }

    const email = form.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      next.email = "Enter a valid business email.";
    }

    if (!form.departmentId) {
      next.departmentId = "Select a department.";
    }

    if (!jobTitle) {
      next.jobTitle = "Job title is required.";
    } else if (jobTitle.length > 100) {
      next.jobTitle = "Job title must be 100 characters or fewer.";
    }

    if (!form.joiningDate) {
      next.joiningDate = "Joining date is required.";
    } else if (form.joiningDate > new Date().toISOString().slice(0, 10)) {
      next.joiningDate = "Joining date cannot be in the future.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        fullName: form.fullName.trim().replace(/\s+/g, " "),
        email: form.email.trim().toLowerCase(),
        jobTitle: form.jobTitle.trim().replace(/\s+/g, " "),
      };
      const saved = employee
        ? await api.updateEmployee(employee.id, payload)
        : await api.createEmployee(payload);
      allowNavigation.current = true;
      setDirty(false);
      navigate(
        `/employees/${saved.id}?saved=${employee ? "updated" : "created"}`,
      );
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setMessage(error.message);
        setErrors(error.fieldErrors);
      } else
        setMessage(
          "We could not save this employee. Check the API connection and try again.",
        );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="employee-form" noValidate>
      {message && (
        <div className="alert alert-danger" role="alert">
          {message}
        </div>
      )}
      <section className="form-section">
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <h2>Personal information</h2>
            <p>Basic identity and contact information.</p>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-md-6">
            <label htmlFor="fullName" className="form-label">
              Full name <em>*</em>
            </label>
            <input
              id="fullName"
              className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="e.g. Aisha Tan"
              autoComplete="name"
              maxLength={150}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              autoFocus
            />
            {errors.fullName && (
              <div id="fullName-error" className="invalid-feedback">{errors.fullName}</div>
            )}
          </div>
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">
              Business email <em>*</em>
            </label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              maxLength={254}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <div id="email-error" className="invalid-feedback">{errors.email}</div>
            )}
          </div>
        </div>
      </section>
      <section className="form-section">
        <div className="form-section-heading">
          <span>02</span>
          <div>
            <h2>Employment details</h2>
            <p>Role, team, status and start date.</p>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-md-6">
            <label htmlFor="jobTitle" className="form-label">
              Job title <em>*</em>
            </label>
            <input
              id="jobTitle"
              className={`form-control ${errors.jobTitle ? "is-invalid" : ""}`}
              value={form.jobTitle}
              onChange={(e) => update("jobTitle", e.target.value)}
              placeholder="e.g. Software Engineer"
              autoComplete="organization-title"
              maxLength={100}
              aria-invalid={Boolean(errors.jobTitle)}
              aria-describedby={errors.jobTitle ? "jobTitle-error" : undefined}
            />
            {errors.jobTitle && (
              <div id="jobTitle-error" className="invalid-feedback">{errors.jobTitle}</div>
            )}
          </div>
          <div className="col-md-6">
            <label htmlFor="department" className="form-label">
              Department <em>*</em>
            </label>
            <select
              id="department"
              className={`form-select ${errors.departmentId ? "is-invalid" : ""}`}
              value={form.departmentId}
              onChange={(e) => update("departmentId", Number(e.target.value))}
              disabled={departmentsLoading}
              aria-invalid={Boolean(errors.departmentId)}
              aria-describedby={errors.departmentId ? "department-error" : undefined}
            >
              <option value={0}>{departmentsLoading ? "Loading departments…" : "Select a department"}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <div id="department-error" className="invalid-feedback">{errors.departmentId}</div>
            )}
          </div>
          <div className="col-md-6">
            <label htmlFor="joiningDate" className="form-label">
              Joining date <em>*</em>
            </label>
            <input
              id="joiningDate"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              className={`form-control ${errors.joiningDate ? "is-invalid" : ""}`}
              value={form.joiningDate}
              onChange={(e) => update("joiningDate", e.target.value)}
              aria-invalid={Boolean(errors.joiningDate)}
              aria-describedby={errors.joiningDate ? "joiningDate-error" : undefined}
            />
            {errors.joiningDate && (
              <div id="joiningDate-error" className="invalid-feedback">{errors.joiningDate}</div>
            )}
          </div>
          <div className="col-md-6">
            <label htmlFor="status" className="form-label">
              Employment status <em>*</em>
            </label>
            <select
              id="status"
              className="form-select"
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as EmployeeInput["status"])
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </section>
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-light"
          onClick={() => navigate(-1)}
          disabled={saving}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <span className="spinner-border spinner-border-sm" />}{" "}
          {saving ? "Saving…" : employee ? "Save changes" : "Create employee"}
        </button>
      </div>
      {blocker.state === "blocked" && (
        <div className="modal-backdrop-custom" role="presentation">
          <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="unsaved-title" aria-describedby="unsaved-description">
            <span className="warning-mark" aria-hidden="true">!</span>
            <h2 id="unsaved-title">Discard unsaved changes?</h2>
            <p id="unsaved-description">Your changes have not been saved. Leaving this page will discard them.</p>
            <div>
              <button type="button" className="btn btn-light" onClick={() => blocker.reset()}>Keep editing</button>
              <button type="button" className="btn btn-danger" onClick={() => blocker.proceed()}>Discard changes</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
