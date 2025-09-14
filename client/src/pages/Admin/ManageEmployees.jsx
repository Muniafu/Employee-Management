import { useEffect, useState } from "react";
import {
  getEmployees,
  addEmployee,
  deleteEmployee,
} from "../../api/employeeApi";

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", department: "" });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const res = await getEmployees();
    if (res.success) setEmployees(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.department.trim()) return;
    const res = await addEmployee(form);
    if (res.success) {
      setForm({ name: "", department: "" });
      loadEmployees();
    }
  };

  const handleDelete = async (id) => {
    await deleteEmployee(id);
    loadEmployees();
  };

  return (
    <div className="container my-5">
      <h1 className="fw-bold text-primary mb-4">👥 Manage Employees</h1>

      {/* Employee Form */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-5">
          <input
            type="text"
            placeholder="Employee Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="form-control"
            aria-label="Employee Name"
            required
          />
        </div>
        <div className="col-md-5">
          <input
            type="text"
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="form-control"
            aria-label="Department"
            required
          />
        </div>
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
              <span className="fw-medium">
                {emp.name} —{" "}
                <span className="text-muted">
                  {emp.department?.name || "N/A"}
                </span>
              </span>
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