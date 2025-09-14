import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Hero Section */}
      <header className="d-flex flex-column justify-content-center align-items-center text-center flex-grow-1">
        <h1 className="display-4 fw-bold text-primary mb-3">
          Welcome to Employee Performance System
        </h1>
        <p className="lead text-muted mb-4 px-3" style={{ maxWidth: "600px" }}>
          Streamline performance tracking, boost productivity, and empower
          employees with a modern platform designed for growth and collaboration.
        </p>

        {/* Action Buttons */}
        <div className="d-flex gap-3 flex-wrap justify-content-center">
          <Link
            to="/login"
            className="btn btn-primary btn-lg px-4 fw-semibold shadow-sm"
            aria-label="Login to your account"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="btn btn-success btn-lg px-4 fw-semibold shadow-sm"
            aria-label="Register a new account"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Footer Section */}
      <footer className="text-center py-3 bg-white border-top">
        <small className="text-muted">
          © {new Date().getFullYear()} Employee Performance System. All rights reserved.
        </small>
      </footer>
    </div>
  );
}