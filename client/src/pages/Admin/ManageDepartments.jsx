import { useEffect, useState } from "react";
import {
  getDepartments,
  createDepartment,
  deleteDepartment,
} from "../../api/employeeApi";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    const res = await getDepartments();
    if (res.success) setDepartments(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createDepartment({ name });
    setName("");
    loadDepartments();
  };

  const handleDelete = async (id) => {
    await deleteDepartment(id);
    loadDepartments();
  };

  return (
    <div className="container my-5">
      <h1 className="fw-bold text-primary mb-4">🏢 Manage Departments</h1>

      {/* Add Department Form */}
      <form onSubmit={handleSubmit} className="d-flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control"
          aria-label="Department Name"
          required
        />
        <button type="submit" className="btn btn-success">
          ➕ Add
        </button>
      </form>

      {/* Department List */}
      <ul className="list-group shadow-sm">
        {departments.length > 0 ? (
          departments.map((dept) => (
            <li
              key={dept._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span className="fw-medium text-dark">{dept.name}</span>
              <button
                onClick={() => handleDelete(dept._id)}
                className="btn btn-sm btn-outline-danger"
              >
                🗑️ Delete
              </button>
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted fst-italic">
            No departments available. Add one above.
          </li>
        )}
      </ul>
    </div>
  );
}