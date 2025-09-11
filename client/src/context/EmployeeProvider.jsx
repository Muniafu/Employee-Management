import { useState, useEffect } from "react";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeApi";
import { EmployeeContext } from "./EmployeeContext";

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData) => {
    try {
      const newEmployee = await addEmployee(employeeData);
      setEmployees((prev) => [...prev, newEmployee]);
    } catch (err) {
      console.error("Error adding employee:", err);
    }
  };

  const editEmployee = async (id, updates) => {
    try {
      const updated = await updateEmployee(id, updates);
      setEmployees((prev) =>
        prev.map((emp) => (emp._id === id ? updated : emp))
      );
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  };

  const removeEmployee = async (id) => {
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // No token, skip fetching
    
    fetchEmployees();
  }, []);

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