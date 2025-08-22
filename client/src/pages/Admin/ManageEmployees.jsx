import { useEffect, useState } from "react";
import { getEmployees, addEmployee, deleteEmployee } from "../../api/employeeApi";

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
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Employees</h1>
      <form onSubmit={handleSubmit} className="space-x-2 mb-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {employees.map((emp) => (
          <li key={emp._id} className="flex justify-between bg-gray-100 p-2 rounded">
            <span>{emp.name} - {emp.department?.name || "N/A"}</span>
            <button
              onClick={() => handleDelete(emp._id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}