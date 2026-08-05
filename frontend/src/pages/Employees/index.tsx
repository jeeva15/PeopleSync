import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { api } from "../../lib/api";
import type { Department, Employee, PageResponse } from "../../lib/types";
import "./style.css";

export default function EmployeesPage() {
  const [data, setData] = useState<PageResponse<Employee>>({
    items: [],
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("fullName");
  const [direction, setDirection] = useState("ASC");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deactivating, setDeactivating] = useState<Employee | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    api
      .departments()
      .then(setDepartments)
      .catch(() => undefined);
  }, []);
  const load = useCallback(
    (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
        sort,
        direction,
      });
      if (query) params.set("search", query);
      if (departmentId) params.set("departmentId", departmentId);
      if (status) params.set("status", status);
      api
        .employees(params, signal)
        .then(setData)
        .catch((e) => {
          if (e.name !== "AbortError")
            setError(
              "Employees could not be loaded. Make sure the backend API is running.",
            );
        })
        .finally(() => {
          if (!signal?.aborted) setLoading(false);
        });
    },
    [page, query, departmentId, status, sort, direction],
  );
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function changeSort(field: string) {
    if (sort === field) setDirection((d) => (d === "ASC" ? "DESC" : "ASC"));
    else {
      setSort(field);
      setDirection("ASC");
    }
    setPage(1);
  }
  async function deactivate() {
    if (!deactivating) return;
    setBusy(true);
    try {
      await api.deactivateEmployee(deactivating.id);
      setDeactivating(null);
      load();
    } catch {
      setError("The employee could not be deactivated.");
      setDeactivating(null);
    } finally {
      setBusy(false);
    }
  }
  const filtersActive = query || departmentId || status;

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">People directory</span>
          <h1>Employees</h1>
          <p>
            Manage employee records, roles, departments and employment status.
          </p>
        </div>
        <Link to="/employees/new" className="btn btn-primary add-button">
          <span>＋</span> Add employee
        </Link>
      </div>
      <section className="metric-strip" aria-label="Employee summary">
        <div>
          <span className="metric-icon violet">◎</span>
          <p>
            <strong>{data.totalItems}</strong>
            <small>Matching employees</small>
          </p>
        </div>
        <div>
          <span className="metric-icon green">✓</span>
          <p>
            <strong>
              {data.items.filter((e) => e.status === "ACTIVE").length}
            </strong>
            <small>Active on this page</small>
          </p>
        </div>
        <div>
          <span className="metric-icon amber">◇</span>
          <p>
            <strong>{departments.length}</strong>
            <small>Active departments</small>
          </p>
        </div>
      </section>
      <section className="data-card">
        <div className="toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              aria-label="Search employees"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter by department"
            className="form-select"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            className="form-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          {filtersActive && (
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setSearch("");
                setDepartmentId("");
                setStatus("");
              }}
            >
              Clear
            </button>
          )}
        </div>
        {error ? (
          <div className="state-panel">
            <span className="state-icon error">!</span>
            <h2>Unable to load employees</h2>
            <p>{error}</p>
            <button className="btn btn-outline-primary" onClick={() => load()}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="table-loading" aria-label="Loading employees">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <span />
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <div className="state-panel">
            <span className="state-icon">⌕</span>
            <h2>No employees found</h2>
            <p>Adjust your search or filters, or add a new employee.</p>
            {filtersActive ? (
              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  setSearch("");
                  setDepartmentId("");
                  setStatus("");
                }}
              >
                Clear filters
              </button>
            ) : (
              <Link to="/employees/new" className="btn btn-primary">
                Add employee
              </Link>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" onClick={() => changeSort("fullName")} aria-label={`Sort by employee name ${sort === "fullName" && direction === "ASC" ? "descending" : "ascending"}`}>
                      Employee{" "}
                      {sort === "fullName" && (direction === "ASC" ? "↑" : "↓")}
                    </button>
                  </th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>
                    <button type="button" onClick={() => changeSort("joiningDate")} aria-label={`Sort by joining date ${sort === "joiningDate" && direction === "ASC" ? "descending" : "ascending"}`}>
                      Joined{" "}
                      {sort === "joiningDate" &&
                        (direction === "ASC" ? "↑" : "↓")}
                    </button>
                  </th>
                  <th>Status</th>
                  <th>
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <Link
                        to={`/employees/${employee.id}`}
                        className="employee-cell"
                        data-testid={`employee-details-${employee.id}`}
                      >
                        <span className="employee-avatar">
                          {employee.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <span>
                          <strong>{employee.fullName}</strong>
                          <small>{employee.email}</small>
                        </span>
                      </Link>
                    </td>
                    <td>{employee.department.name}</td>
                    <td>{employee.jobTitle}</td>
                    <td>
                      {new Date(
                        employee.joiningDate + "T00:00:00",
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <StatusBadge status={employee.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link
                          to={`/employees/${employee.id}/edit`}
                          aria-label={`Edit ${employee.fullName}`}
                        >
                          Edit
                        </Link>
                        {employee.status === "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => setDeactivating(employee)}
                            aria-label={`Deactivate ${employee.fullName}`}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && data.items.length > 0 && (
          <div className="pagination-bar">
            <p>
              Showing{" "}
              <strong>
                {(data.page - 1) * data.pageSize + 1}–
                {Math.min(data.page * data.pageSize, data.totalItems)}
              </strong>{" "}
              of <strong>{data.totalItems}</strong>
            </p>
            <div>
              <button
                type="button"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <span>
                Page {data.page} of {data.totalPages}
              </span>
              <button
                type="button"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>
      {deactivating && (
        <div
          className="modal-backdrop-custom"
          role="presentation"
          onMouseDown={() => !busy && setDeactivating(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !busy) setDeactivating(null);
          }}
        >
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="warning-mark">!</span>
            <h2 id="dialog-title">Deactivate employee?</h2>
            <p>
              <strong>{deactivating.fullName}</strong> will no longer appear as
              active. Their record and history will remain available.
            </p>
            <div>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setDeactivating(null)}
                disabled={busy}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={deactivate}
                disabled={busy}
              >
                {busy ? "Deactivating…" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
