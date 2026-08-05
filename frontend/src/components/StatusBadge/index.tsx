import type { EmploymentStatus } from "../../lib/types";
import "./style.css";
export default function StatusBadge({ status }: { status: EmploymentStatus }) {
  return (
    <span className={`status-badge ${status.toLowerCase()}`}>
      <span />
      {status === "ACTIVE" ? "Active" : "Inactive"}
    </span>
  );
}
