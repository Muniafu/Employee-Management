export default function isOnLeave(leaveHistory = []) {
  // Get today's date without time for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check each leave period
  return leaveHistory.some(leave => {
    // Skip if leave status is not accepted
    if (leave.status !== 'accepted') return false;
    
    // Parse dates
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    
    // Set time to midnight for consistent comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // Check if today is between start and end dates (inclusive)
    return today >= startDate && today <= endDate;
  });
}