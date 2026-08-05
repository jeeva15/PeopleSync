import { Link } from "react-router-dom";
import EmployeeForm from "../../components/EmployeeForm";
import "./style.css";
export default function NewEmployeePage() {
  return (
    <>
      <div className="page-heading compact">
        <div>
          <Link to="/employees" className="back-link">
            ← Employees
          </Link>
          <h1>Add employee</h1>
          <p>
            Create a new employee record. Required fields are marked with an
            asterisk.
          </p>
        </div>
      </div>
      <EmployeeForm />
    </>
  );
}
