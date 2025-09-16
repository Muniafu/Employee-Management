import api from "./api";

export async function clockIn(employeeId) {
  const { data } = await api.post("/attendance/clock-in", { employeeId });
  return data; // { success, message, data }
}

export async function clockOut(employeeId) {
  const { data } = await api.post("/attendance/clock-out", { employeeId });
  return data;
}

export async function getAttendance() {
  const { data } = await api.get("/attendance");
  return data;
}

export async function getMyAttendance() {
  const { data } = await api.get("/attendance/me");
  return data; // { success, message, data }
}

export async function getAttendanceForEmployee(employeeId) {
  try {
    const { data } = await api.get(`/attendance/${employeeId}`);
    return data;
  } catch {
    const { data } = await api.get("/attendance", { params: { employeeId } });
    return data.attendance || data;
  }
}