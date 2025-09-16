import api from "./api";

export async function generatePayroll(payload) {
  const { data } = await api.post("/payroll", payload);
  return data.payroll || data;
}

export async function getPayrollForEmployee(employeeId) {
  const { data } = await api.get(`/payroll/${employeeId}`);
  return data.payrolls || [];
}

export async function getPayrolls() {
  const { data } = await api.get("/payroll");
  return data.payrolls || [];
}

export async function getMyPayrolls() {
  const { data } = await api.get("/payroll/me");
  return data.payrolls || [];
}