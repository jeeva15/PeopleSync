import { Link } from "react-router-dom";
import "./style.css";
export default function NotFound() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>Page not found</h1>
      <p>The page you’re looking for may have moved or no longer exists.</p>
      <Link to="/employees" className="btn btn-primary">
        Go to employees
      </Link>
    </main>
  );
}
