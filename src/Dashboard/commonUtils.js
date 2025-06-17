import moment from "moment-timezone";

export const filterTypes = ["assignee", "status", "type", "date"]

export const getDueDateMessage = (dateValue) => {
  let date = dateValue;
  const dateFormat = "YYYY-MM-DD"
  if (Array.isArray(date)) {
    date = date[0];
  }
    
  const dateRange = getDateRange(date.operator, date.frequency, date.period);
  const startDate = moment(dateRange.startDate).format(dateFormat);
  const endDate = dateRange.endDate ? moment(dateRange.endDate).format(dateFormat) : 'Open-ended';
  const range = moment(startDate).isSame(moment(endDate)) ? startDate : `${startDate} - ${endDate}`;
  
  return range;
}

export const getDateRange = (operator, frequency, period, ispTimeZone) => {
  const today = new Date();
  let startDate, endDate;
  let freq = Number(frequency);
  switch (period) {
    case 'weeks':
      freq *= 7;
      break;
    case 'months':
      freq *= 30; // Approximate month as 30 days
      break;
    default:
      break;
  }
    
  if (operator === '<') {
    startDate = new Date(today);
    endDate = new Date(today.setDate(today.getDate() + freq - 1));
  } else if (operator === '>') {
    startDate = new Date(today.setDate(today.getDate() + freq + 1));
    endDate = null; // Open-ended future range
  } else if (operator === '=') {
    startDate = new Date(today.setDate(today.getDate() + freq));
    endDate = startDate;
  }
    
  return { startDate: moment.tz(startDate, ispTimeZone).format('YYYY-MM-DD'), endDate: endDate ? moment.tz(endDate, ispTimeZone).format('YYYY-MM-DD') : null };
}

export const getFilterTableVariables = (variables, filters, ispTimeZone) => {
  let fStart = null;
  let fEnd = null;
  filters.forEach(filter => {
    switch (filter.filterType) {
      case 'assignee':
        variables.technicianId = variables.technicianId && variables.technicianId.length > 0 ? variables.technicianId : []
        filter.value.forEach(item => variables.technicianId.push(item.value));
        break;
      case 'status':
        variables.status = variables.status && variables.status.length > 0 ? variables.status : []
        filter.value.forEach(item => variables.status.push(item.label));
        break;
      case 'type':
        variables.ticketType = variables.ticketType && variables.ticketType.length > 0 ? variables.ticketType : []
        filter.value.forEach(item => variables.ticketType.push(item.value));
        break;
      case 'date':
        if (filter.value?.length > 0 && (filter.value[0].operator === "=" || (filter.value[0].operator && filter.value[0].frequency && filter.value[0].period))) {
          const { startDate, endDate } = getDateRange(filter.value[0].operator, filter.value[0].frequency, filter.value[0].period, ispTimeZone);
          fStart = fStart && moment(fStart).isBefore(startDate) ? fStart : startDate;
          fEnd = fEnd && moment(fEnd).isAfter(endDate) ? fEnd : endDate;
          // Format dates as strings in YYYY-MM-DD HH:MM:SS format
          variables.dueDateRange = {
            startDate: moment(fStart).format('YYYY-MM-DD HH:mm:ss'),
            endDate: fEnd ? moment(fEnd).format('YYYY-MM-DD HH:mm:ss') : null
          };
        }
        break;
      default:
        break;
    }
  });
  return variables;
}