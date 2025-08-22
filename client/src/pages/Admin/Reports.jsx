import { useEffect, useState } from "react";
import { getEmployees } from "../../api/employeeApi";
import { getAttendanceForEmployee } from "../../api/attendanceApi";
import { getPayrolls } from "../../api/payrollApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Reports() {
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const emp = await getEmployees();
      const att = await getAttendanceForEmployee();
      const pay = await getPayrolls();

      setReportData([
        { name: "Employees", value: emp.success ? emp.data.length : 0 },
        { name: "Attendance", value: att.success ? att.data.length : 0 },
        { name: "Payrolls", value: pay.success ? pay.data.length : 0 },
      ]);
    }
    loadData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Reports & Analytics</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={reportData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3182ce" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}