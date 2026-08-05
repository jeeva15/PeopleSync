import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import AppShell from "./components/AppShell";
import EditEmployeePage from "./pages/EditEmployee";
import EmployeeDetailsPage from "./pages/EmployeeDetails";
import EmployeesPage from "./pages/Employees";
import NewEmployeePage from "./pages/NewEmployee";
import NotFoundPage from "./pages/NotFound";

const withinShell = (page: ReactNode) => <AppShell>{page}</AppShell>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/employees" replace />} />
      <Route path="/employees" element={withinShell(<EmployeesPage />)} />
      <Route path="/employees/new" element={withinShell(<NewEmployeePage />)} />
      <Route path="/employees/:id" element={withinShell(<EmployeeDetailsPage />)} />
      <Route path="/employees/:id/edit" element={withinShell(<EditEmployeePage />)} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
