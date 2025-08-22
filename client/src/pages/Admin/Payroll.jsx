import { useEffect, useState } from "react";
import { getPayrolls } from "../../api/payrollApi";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    loadPayrolls();
  }, []);

  const loadPayrolls = async () => {
    const res = await getPayrolls();
    if (res.success) setPayrolls(res.data);
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
              <td className="border px-2 py-1">${pay.amount}</td>
              <td className="border px-2 py-1">{new Date(pay.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}