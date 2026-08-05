import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { api, parseEmployeeId } from "../../lib/api";
import type { Employee } from "../../lib/types";
import "./style.css";

export default function EmployeeDetailsPage() {
  const id = parseEmployeeId(useParams().id);
  const [searchParams] = useSearchParams();
  const saved = searchParams.get("saved");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (id === null) {
      setError("The employee identifier is invalid.");
      return;
    }
    const controller = new AbortController();
    setError("");
    api
      .employee(id, controller.signal)
      .then(setEmployee)
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name === "AbortError") return;
        setError("This employee does not exist or could not be loaded.");
      });
    return () => controller.abort();
  }, [id]);
  if (error)
    return (
      <div className="state-panel standalone">
        <span className="state-icon error">!</span>
        <h1>Employee unavailable</h1>
        <p>{error}</p>
        <Link to="/employees" className="btn btn-primary">
          Return to employees
        </Link>
      </div>
    );
  if (!employee)
    return (
      <div className="detail-skeleton">
        <div />
        <div />
        <div />
      </div>
    );
  const initials = employee.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <>
      <div className="page-heading compact">
        <div>
          <Link to="/employees" className="back-link">
            ← Employees
          </Link>
          <h1>Employee profile</h1>
          <p>View employment and contact information.</p>
        </div>
        <Link to={`/employees/${id}/edit`} className="btn btn-primary">
          Edit employee
        </Link>
      </div>
      {saved && (
        <div className="alert alert-success success-toast">
          Employee {saved} successfully.
        </div>
      )}
      <section className="profile-card">
        <div className="profile-hero">
          <span className="profile-avatar">{initials}</span>
          <div>
            <div className="profile-name">
              <h2>{employee.fullName}</h2>
              <StatusBadge status={employee.status} />
            </div>
            <p>
              {employee.jobTitle} · {employee.department.name}
            </p>
          </div>
        </div>
        <div className="profile-grid">
          <div>
            <span>Email address</span>
            <a href={`mailto:${employee.email}`}>{employee.email}</a>
          </div>
          <div>
            <span>Department</span>
            <strong>{employee.department.name}</strong>
          </div>
          <div>
            <span>Job title</span>
            <strong>{employee.jobTitle}</strong>
          </div>
          <div>
            <span>Joining date</span>
            <strong>
              {new Date(employee.joiningDate + "T00:00:00").toLocaleDateString(
                "en-GB",
                { day: "numeric", month: "long", year: "numeric" },
              )}
            </strong>
          </div>
          <div>
            <span>Employee ID</span>
            <strong>EMP-{String(employee.id).padStart(4, "0")}</strong>
          </div>
          <div>
            <span>Last updated</span>
            <strong>
              {new Date(employee.updatedAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
          </div>
        </div>
      </section>
    </>
  );
}
