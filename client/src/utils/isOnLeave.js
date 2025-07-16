import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const isOnLeave = (leaveDates, checkDate = new Date()) => {
  try {
    if (!Array.isArray(leaveDates)) {
      toast.error('Invalid leave data format', {
        position: 'top-right',
        autoClose: 3000
      });
      return { isOnLeave: false };
    }

    const currentDate = new Date(checkDate);
    let leaveStatus = false;
    let leaveStart = null;
    let leaveEnd = null;

    for (const leave of leaveDates) {
      if (!leave.startDate || !leave.endDate) continue;
      
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);

      if (leave.status !== 'approved') continue;

      if (currentDate >= startDate && currentDate <= endDate) {
        leaveStatus = true;
        leaveStart = startDate;
        leaveEnd = endDate;
        break;
      }
    }

    return { 
      isOnLeave: leaveStatus,
      startDate: leaveStart,
      endDate: leaveEnd
    };
  } catch (error) {
    toast.error('Error checking leave status', {
      position: 'top-right',
      autoClose: 3000
    });
    console.error('Error in isOnLeave:', error);
    return { isOnLeave: false };
  }
};

export const userOnLeave = (employees) => {
  try {
    if (!Array.isArray(employees)) {
      toast.error('Invalid employee data', {
        position: 'top-right',
        autoClose: 3000
      });
      return [];
    }

    const today = new Date();
    const onLeaveUsers = [];

    employees.forEach(emp => {
      if (!emp.leaveDates || !Array.isArray(emp.leaveDates)) return;

      const { isOnLeave, startDate, endDate } = isOnLeave(emp.leaveDates, today);

      if (isOnLeave) {
        onLeaveUsers.push({
          id: emp._id,
          name: emp.name,
          image: emp.image,
          position: emp.position,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        });

        toast.info(`${emp.name} is on leave until ${endDate.toLocaleDateString()}`, {
          position: 'top-right',
          autoClose: 5000
        });
      }
    });

    return onLeaveUsers;
  } catch (error) {
    toast.error('Error processing leave data', {
      position: 'top-right',
      autoClose: 3000
    });
    console.error('Error in userOnLeave:', error);
    return [];
  }
};

// Format date helper function
export const formatLeaveDate = (dateString) => {
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};