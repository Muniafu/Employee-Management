export default function EmployeeCard({ employee }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition">
      <img
        src={employee.avatar || "https://via.placeholder.com/50"}
        alt={employee.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <h3 className="text-lg font-semibold">{employee.name}</h3>
        <p className="text-sm text-gray-500">{employee.department}</p>
        <p className="text-sm text-gray-400">{employee.role}</p>
      </div>
    </div>
  );
}