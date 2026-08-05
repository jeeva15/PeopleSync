import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EmployeeForm from "../../components/EmployeeForm";
import { api, parseEmployeeId } from "../../lib/api";
import type { Employee } from "../../lib/types";
import "./style.css";

export default function EditEmployeePage() {
  const id = parseEmployeeId(useParams().id);
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
        <h1>Employee unavailable</h1>
        <p>{error}</p>
        <Link to="/employees" className="btn btn-primary">
          Return to employees
        </Link>
      </div>
    );
  return (
    <>
      <div className="page-heading compact">
        <div>
          <Link
            to={employee && id !== null ? `/employees/${id}` : "/employees"}
            className="back-link"
          >
            ← Employee profile
          </Link>
          <h1>Edit employee</h1>
          <p>Update employment and contact information.</p>
        </div>
      </div>
      {employee ? (
        <EmployeeForm employee={employee} />
      ) : (
        <div className="detail-skeleton">
          <div />
          <div />
        </div>
      )}
    </>
  );
}
