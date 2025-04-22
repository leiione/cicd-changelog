/**
 * Date formatting utilities to reduce redundant processing
 */

// Cache for already formatted dates to prevent repeated processing
const dateFormatCache = new Map();

/**
 * Format date to "Mar 10 2025 03:39:28 am" with caching for performance
 * 
 * @param {string|number} dateValue - The date value to format
 * @returns {string} Formatted date string or '-' if invalid
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  
  // Check if we've already formatted this exact date value
  const cacheKey = String(dateValue);
  if (dateFormatCache.has(cacheKey)) {
    return dateFormatCache.get(cacheKey);
  }
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    
    // Month names array
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    // Format the complete string
    const formattedDate = `${month} ${day} ${year} ${hours}:${minutes}:${seconds} ${ampm}`;
    
    // Cache the result to avoid future formatting of the same date
    dateFormatCache.set(cacheKey, formattedDate);
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Clear the date format cache if it gets too large
 * Call this periodically if processing many unique dates
 */
export const clearDateFormatCache = () => {
  dateFormatCache.clear();
};

/**
 * Process tickets data to format all date fields once during data receipt
 * rather than repeatedly during rendering
 * 
 * @param {Array} tickets - Array of ticket objects
 * @returns {Array} Processed ticket objects with formatted dates
 */
export const processTicketDates = (tickets) => {
  if (!tickets || !Array.isArray(tickets)) {
    return [];
  }
  
  return tickets.map(ticket => {
    const formattedTicket = {
      ...ticket,
      id: ticket.ticket_id || Math.random().toString(), // Required for DataGridTable
    };
    
    // Format all date fields
    if (ticket.date_added) formattedTicket.date_added = formatDate(ticket.date_added);
    if (ticket.last_modified) formattedTicket.last_modified = formatDate(ticket.last_modified);
    if (ticket.start) formattedTicket.start = formatDate(ticket.start);
    if (ticket.end) formattedTicket.end = formatDate(ticket.end);
    if (ticket.open_timestamp) formattedTicket.open_date = formatDate(parseInt(ticket.open_timestamp));
    if (ticket.timestamp) formattedTicket.timestamp_date = formatDate(parseInt(ticket.timestamp));
    
    return formattedTicket;
  });
};

// Create a named exported object rather than an anonymous default export
const dateUtils = {
  formatDate,
  clearDateFormatCache,
  processTicketDates
};

export default dateUtils;
