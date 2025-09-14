import { useEffect, useState } from "react";
import { getPayrolls } from "../../api/payrollApi";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    loadPayrolls();
  }, []);

  const loadPayrolls = async () => {
    try {
      const data = await getPayrolls();
      setPayrolls(data);
    } catch (error) {
      console.error("Failed to load payrolls:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Payroll Records</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Employee</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Date</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((pay) => (
            <tr key={pay._id}>
              <td className="border px-2 py-1">{pay.employee?.name || "N/A"}</td>
              <td className="border px-2 py-1">${pay.netSalary || pay.amount}</td>
              <td className="border px-2 py-1">{new Date(pay.generatedAt || pay.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}