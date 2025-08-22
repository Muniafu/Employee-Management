import { useEffect, useState } from "react";
import { getDepartments, createDepartment, deleteDepartment } from "../../api/employeeApi";

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
    await createDepartment({ name });
    setName("");
    loadDepartments();
  };

  const handleDelete = async (id) => {
    await deleteDepartment(id);
    loadDepartments();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Departments</h1>
      <form onSubmit={handleSubmit} className="space-x-2 mb-4">
        <input
          type="text"
          placeholder="Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {departments.map((dept) => (
          <li key={dept._id} className="flex justify-between bg-gray-100 p-2 rounded">
            <span>{dept.name}</span>
            <button
              onClick={() => handleDelete(dept._id)}
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