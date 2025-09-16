import api from "./api";

export async function login({ usernameOrEmail, password }) {
  const { data } = await api.post("/auth/login", { usernameOrEmail, password });
  if (data?.data?.token) localStorage.setItem("token", data.data.token);
  return data.data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  if (data?.data?.token) localStorage.setItem("token", data.data.token);
  return data.data;
}

export async function me() {
  const { data } = await api.get("/auth/me");
  return data.data.user;
}

export function logout() {
  localStorage.removeItem("token");
}