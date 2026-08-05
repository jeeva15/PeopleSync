import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import "./style.css";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = useLocation().pathname;
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link to="/employees" className="brand" aria-label="PeopleSync home">
          <span className="brand-mark">P</span>
          <span>
            <strong>PeopleSync</strong>
            <small>Employee workspace</small>
          </span>
        </Link>
        <nav className="primary-nav" aria-label="Main navigation">
          <Link
            to="/employees"
            className={pathname.startsWith("/employees") ? "active" : ""}
          >
            <span className="nav-icon">⌁</span> Employees
          </Link>
          <span className="nav-disabled">
            <span className="nav-icon">◇</span> Departments <small>Soon</small>
          </span>
          <span className="nav-disabled">
            <span className="nav-icon">↗</span> Reports <small>Soon</small>
          </span>
        </nav>
      </aside>
      <div className="content-frame">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">P</span>
            <strong>PeopleSync</strong>
          </div>
          <div className="topbar-actions">
            <span className="environment-pill">Development</span>
            <span className="avatar" aria-label="Signed in as Admin">
              AD
            </span>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
