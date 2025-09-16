import { useState, useEffect, useContext } from "react";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeApi";
import { EmployeeContext } from "./EmployeeContext";
import { AuthContext } from "./AuthContext";

export const EmployeeProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    if (!token) return; // only fetch if authenticated
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("❌ Error fetching employees:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData) => {
    try {
      const newEmployee = await addEmployee(employeeData);
      setEmployees((prev) => [...prev, newEmployee]);
    } catch (err) {
      console.error("❌ Error adding employee:", err.response?.data || err.message);
    }
  };

  const editEmployee = async (id, updates) => {
    try {
      const updated = await updateEmployee(id, updates);
      setEmployees((prev) =>
        prev.map((emp) => (emp._id === id ? updated : emp))
      );
    } catch (err) {
      console.error("❌ Error updating employee:", err.response?.data || err.message);
    }
  };

  const removeEmployee = async (id) => {
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (err) {
      console.error("❌ Error deleting employee:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEmployees();
    } else {
      setEmployees([]); // clear when logged out
    }
  }, [token]);

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        fetchEmployees,
        createEmployee,
        editEmployee,
        removeEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};