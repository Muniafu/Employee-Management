import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login(form.usernameOrEmail, form.password);
      if (res.success) {
        const user = JSON.parse(localStorage.getItem("user"));
        navigate(user.role === "Admin" ? "/admin/dashboard" : "/employee/profile");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4 fw-bold text-primary">
            Welcome Back 👋
          </h2>

          {error && (
            <div className="alert alert-danger small text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username / Email */}
            <div className="mb-3">
              <label htmlFor="usernameOrEmail" className="form-label fw-semibold">
                Email or Username
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={form.usernameOrEmail}
                onChange={handleChange}
                placeholder="Enter your email or username"
                className="form-control"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="form-control"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="d-grid mb-3">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg fw-semibold"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          <p className="text-center mt-3 text-muted">
            Don’t have an account?{" "}
            <Link to="/register" className="fw-semibold text-decoration-none text-success">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}