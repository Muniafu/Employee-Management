import { differenceInCalendarDays, isWithinInterval, parseISO, isBefore } from 'date-fns';

/**
 * Calculates total number of days in a leave period
 * @param {Date|string} startDate - Start date of leave
 * @param {Date|string} endDate - End date of leave
 * @returns {number} Total days (inclusive)
 */
export function calculateLeaveDays(startDate, endDate) {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return differenceInCalendarDays(end, start) + 1;
  } catch (error) {
    console.error('Error calculating leave days:', error);
    return 0;
  }
}

/**
 * Checks if leave period overlaps with existing leaves
 * @param {Date|string} newStart - New leave start date
 * @param {Date|string} newEnd - New leave end date
 * @param {Array} existingLeaves - Array of existing leave periods
 * @returns {boolean} True if overlap exists */
export function checkLeaveOverlap(newStart, newEnd, existingLeaves = []) {
  try {
    const start = parseISO(newStart);
    const end = parseISO(newEnd);
    
    return existingLeaves.some(leave => {
      const leaveStart = parseISO(leave.startDate);
      const leaveEnd = parseISO(leave.endDate);
      
      return isWithinInterval(start, { start: leaveStart, end: leaveEnd }) ||
             isWithinInterval(end, { start: leaveStart, end: leaveEnd }) ||
             (isBefore(start, leaveStart) && isBefore(end, leaveStart));
    });
  } catch (error) {
    console.error('Error checking leave overlap:', error);
    return false;
  }
}

/**
 * Formats leave dates for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Desired format (default: 'MMM d, yyyy')
 * @returns {string} Formatted date */
export function formatLeaveDate(date = 'MMM d, yyyy') {
  try {
    const parsedDate = parseISO(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(parsedDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Determines leave status based on dates and approval
 * @param {Object} leave - Leave object with dates and status
 * @returns {string} Calculated status */
export function determineLeaveStatus(leave) {
  try {
    const today = new Date();
    const startDate = parseISO(leave.startDate);
    const endDate = parseISO(leave.endDate);
    
    if (leave.status === 'rejected') return 'rejected';
    if (leave.status === 'approved') {
      if (isWithinInterval(today, { start: startDate, end: endDate })) {
        return 'on_leave';
      }
      return today > endDate ? 'completed' : 'upcoming';
    }
    return leave.status || 'pending';
  } catch (error) {
    console.error('Error determining leave status:', error);
    return 'error';
  }
}

/**
 * Prepares leave data for chart display
 * @param {Array} leaves - Array of leave records
 * @returns {Object} Chart-ready data */
export function prepareLeaveChartData(leaves = []) {
  const counts = leaves.reduce((acc, leave) => {
    acc[leave.status] = (acc[leave.status] || 0) + 1;
    return acc;
  }, {});
  
  return {
    labels: ['Accepted', 'Pending', 'Rejected', 'Upcoming'],
    datasets: [{
      data: [
        counts.accepted || 0,
        counts.pending || 0,
        counts.rejected || 0,
        counts.upcoming || 0
      ],
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#2196F3']
    }]
  };
}