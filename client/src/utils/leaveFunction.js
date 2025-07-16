import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const getLeaveData = (leaves) => {
  try {
    if (!Array.isArray(leaves)) {
      toast.error('Invalid leave data format', {
        position: 'top-right',
        autoClose: 3000
      });
      return 0;
    }

    const pendingLeaves = leaves.filter(
      (leave) => leave.status === 'pending'
    ).length;

    if (pendingLeaves > 0) {
      toast.info(`You have ${pendingLeaves} pending leave requests`, {
        position: 'top-right',
        autoClose: 3000
      });
    }

    return pendingLeaves;
  } catch (error) {
    toast.error('Error processing leave data', {
      position: 'top-right',
      autoClose: 3000
    });
    console.error('Error in getLeaveData:', error);
    return 0;
  }
};

export const calculateTotalDaysSelected = (start, end) => {
  try {
    if (!start || !end) {
      toast.warning('Please select both start and end dates', {
        position: 'top-right',
        autoClose: 3000
      });
      return 0;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error('Invalid date format provided', {
        position: 'top-right',
        autoClose: 3000
      });
      return 0;
    }

    if (startDate > endDate) {
      toast.error('End date must be after start date', {
        position: 'top-right',
        autoClose: 3000
      });
      return 0;
    }

    const differenceInMilliseconds = Math.abs(endDate - startDate);
    const totalDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

    if (totalDays > 90) {
      toast.warning('Maximum leave duration is 90 days', {
        position: 'top-right',
        autoClose: 3000
      });
      return 90;
    }

    toast.success(`Leave duration: ${totalDays} day${totalDays !== 1 ? 's' : ''}`, {
      position: 'top-right',
      autoClose: 2000
    });

    return totalDays;
  } catch (error) {
    toast.error('Error calculating leave duration', {
      position: 'top-right',
      autoClose: 3000
    });
    console.error('Error in calculateTotalDaysSelected:', error);
    return 0;
  }
};

export const formatLeaveDate = (dateString) => {
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if formatting fails
  }
};