import { useEffect, useState } from "react";
import { getAttendance } from "../../api/attendanceApi";

export default function Attendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    const res = await getAttendance();
    if (res.success) setRecords(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Attendance Records</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Employee</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec._id}>
              <td className="border px-2 py-1">{rec.employee?.name || "N/A"}</td>
              <td className="border px-2 py-1">{new Date(rec.date).toLocaleDateString()}</td>
              <td className="border px-2 py-1">{rec.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}