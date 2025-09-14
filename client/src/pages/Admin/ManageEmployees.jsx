import { useEffect, useState } from "react";
import {
  getEmployees,
  addEmployee,
  deleteEmployee,
} from "../../api/employeeApi";

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [withUser, setWithUser] = useState(false);
  const [form, setForm] = useState({ 
    firstName: "",
    lastName: "",
    email: "", 
    username: "",
    password: "",
    department: "" 

  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res || []);
    } catch (err) {
      console.error("Failed to load employees:", err.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      // If withUser is false, strip out login fields
      const payload = withUser ? form : {
        firstName: form.firstName,
        lastName: form.lastName,
        department: form.department,
      };

      await addEmployee(payload);

      // Reset
      setForm({ 
        firstName: "", 
        lastName: "", 
        email: "",
        username: "",
        password: "", 
        department: "" 
      });
      setWithUser(false);
      loadEmployees();
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      loadEmployees();
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  return (
    <div className="container my-5">
      <h1 className="fw-bold text-primary mb-4">👥 Manage Employees</h1>

      {/* Employee Form */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-2">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* Toggle: wit or without User account */}
        <div className="col-md-3 d-flex align-items-center">
          <input 
            type="checkbox"
            id="withUser"
            checked={withUser}
            onChange={() => setWithUser(!withUser)}
            className="form-check-input me-2" 
          />
          <label htmlFor="withUser" className="form-check-label fw-semibold">
            Create login account
          </label>
        </div>

        {withUser && (
          <>
            <div className="col-md-2">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="form-control"
              required={withUser}
            />
          </div>
          <div className="col-md-2">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              required={withUser}
            />
          </div>
          <div className="col-md-2">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              required={withUser}
            />
          </div>
          </>
        )}
        
        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-success">
            ➕ Add
          </button>
        </div>
      </form>

      {/* Employee List */}
      <ul className="list-group shadow-sm">
        {employees.length > 0 ? (
          employees.map((emp) => (
            <li
              key={emp._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >              
              <div>
                <strong>
                  {emp.firstName} {emp.lastName}
                </strong>{" "}
                — {emp.department?.name || "No Department"}
                <br />
                <small className="text-muted">
                  {emp.user
                    ? `${emp.user.username} | ${emp.user.email} | Role: ${emp.user.role}`
                    : "No user account linked"}
                </small>
              </div>
              <button
                onClick={() => handleDelete(emp._id)}
                className="btn btn-sm btn-outline-danger"
              >
                🗑️ Delete
              </button>
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted fst-italic">
            No employees yet. Add some above.
          </li>
        )}
      </ul>
    </div>
  );
}