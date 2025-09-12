import { useEffect, useState } from "react";
import { getEmployees } from "../../api/employeeApi";
import { getAttendance } from "../../api/attendanceApi";
import { getAllPayrolls } from "../../api/payrollApi";

export default function Dashboard() {
  const [stats, setStats] = useState({ employees: 0, attendance: 0, payrolls: 0 });

  useEffect(() => {
    async function fetchStats() {
      const emp = await getEmployees();
      const att = await getAttendance();
      const pay = await getAllPayrolls();


      setStats({
        employees: emp.success ? emp.data.length : 0,
        attendance: att.success ? att.data.length : 0,
        payrolls: pay.success ? pay.data.length : 0,
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Employees</h2>
          <p className="text-2xl">{stats.employees}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Attendance Records</h2>
          <p className="text-2xl">{stats.attendance}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Payroll Entries</h2>
          <p className="text-2xl">{stats.payrolls}</p>
        </div>
      </div>
    </div>
  );
}