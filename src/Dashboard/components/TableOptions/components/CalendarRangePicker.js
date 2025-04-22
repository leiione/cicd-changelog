import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateRangePicker, createStaticRanges } from 'react-date-range';
import { format, addDays, endOfDay, startOfDay } from 'date-fns';
import { TextField, Popover, InputAdornment } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EventIcon from '@mui/icons-material/Event';
import { setDateRangeFilter } from '../../../../config/store';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const CalendarRangePicker = () => {
  const dispatch = useDispatch();
  const datePickerFilter = useSelector(state => state.ticketTablePreferences?.dateRange || { 
    startDate: format(new Date(2000, 0, 1), 'yyyy-MM-dd HH:mm:ss'), 
    endDate: format(new Date(2050, 11, 31), 'yyyy-MM-dd HH:mm:ss') 
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(datePickerFilter.startDate),
    endDate: new Date(datePickerFilter.endDate),
    key: 'selection'
  });

  // Initialize date range on component mount
  useEffect(() => {
    const startDate = new Date(2000, 0, 1);
    const endDate = new Date(2050, 11, 31);
    
    dispatch(setDateRangeFilter({
      startDate: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
      endDate: format(endDate, 'yyyy-MM-dd HH:mm:ss')
    }));
  }, [dispatch]);

  useEffect(() => {
    // Update local state when Redux state changes
    if (datePickerFilter.startDate && datePickerFilter.endDate) {
      // We need special handling for the Today option
      // Just check if it's our special "yesterday to today" filter
      const yesterday = addDays(new Date(), -1);
      const yesterdayStr = format(new Date(yesterday.setHours(0, 0, 0, 0)), 'yyyy-MM-dd HH:mm:ss');
      
      if (datePickerFilter.startDate === yesterdayStr && datePickerFilter.endDate.includes(format(new Date(), 'yyyy-MM-dd'))) {
        // Special case for "Today" - only show today in the calendar
        const today = new Date();
        setSelectedRange({
          startDate: startOfDay(today),
          endDate: endOfDay(today),
          key: 'selection'
        });
      } else {
        // Normal case - show the actual date range
        setSelectedRange({
          startDate: new Date(datePickerFilter.startDate),
          endDate: new Date(datePickerFilter.endDate),
          key: 'selection'
        });
      }
    }
  }, [datePickerFilter]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRangeChange = (ranges) => {
    setSelectedRange(ranges.selection);
  };

  const handleSetFilter = () => {
    const today = new Date();
    const yesterday = addDays(today, -1);
    
    // Check which preset is selected based on the date range values
    const isToday = 
      selectedRange.startDate.getDate() === today.getDate() &&
      selectedRange.startDate.getMonth() === today.getMonth() &&
      selectedRange.startDate.getFullYear() === today.getFullYear() &&
      selectedRange.endDate.getDate() === today.getDate() &&
      selectedRange.endDate.getMonth() === today.getMonth() &&
      selectedRange.endDate.getFullYear() === today.getFullYear();
      
    // Check if it's Last 7 Days
    const isLast7Days = 
      Math.abs(selectedRange.startDate.getTime() - addDays(today, -6).getTime()) < 86400000 &&
      Math.abs(selectedRange.endDate.getTime() - today.getTime()) < 86400000;
      
    // Check if it's Last 30 Days
    const isLast30Days = 
      Math.abs(selectedRange.startDate.getTime() - addDays(today, -29).getTime()) < 86400000 &&
      Math.abs(selectedRange.endDate.getTime() - today.getTime()) < 86400000;
      
    // Check if it's Last 90 Days
    const isLast90Days = 
      Math.abs(selectedRange.startDate.getTime() - addDays(today, -89).getTime()) < 86400000 &&
      Math.abs(selectedRange.endDate.getTime() - today.getTime()) < 86400000;
      
    // Check if it's Last 360 Days
    const isLast360Days = 
      Math.abs(selectedRange.startDate.getTime() - addDays(today, -359).getTime()) < 86400000 &&
      Math.abs(selectedRange.endDate.getTime() - today.getTime()) < 86400000;
    
    if (isToday) {
      // Only today is shown in the calendar UI
      // But we'll use yesterday and today for the actual filter
      const yesterdayStart = new Date(yesterday);
      yesterdayStart.setHours(0, 0, 0, 0); // 00:00:00
      
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 0); // 23:59:59
      
      // Format dates as strings in YYYY-MM-DD HH:MM:SS format
      const startDateStr = format(yesterdayStart, 'yyyy-MM-dd HH:mm:ss');
      const endDateStr = format(todayEnd, 'yyyy-MM-dd HH:mm:ss');
      
      // This sends the actual filter date range (yesterday to today)
      dispatch(setDateRangeFilter({
        startDate: startDateStr,
        endDate: endDateStr
      }));
    } else if (isLast7Days) {
      // Range: April 9 00:00:00 to April 14 23:59:59
      const startDate = addDays(today, -6); // April 9
      
      const startTime = new Date(startDate);
      startTime.setHours(0, 0, 0, 0); // 00:00:00
      
      const endTime = new Date(yesterday);
      endTime.setHours(23, 59, 59, 0); // 23:59:59
      
      // Format dates as strings in YYYY-MM-DD HH:MM:SS format
      const startDateStr = format(startTime, 'yyyy-MM-dd HH:mm:ss');
      const endDateStr = format(endTime, 'yyyy-MM-dd HH:mm:ss');
      
      dispatch(setDateRangeFilter({
        startDate: startDateStr,
        endDate: endDateStr
      }));
    } else if (isLast30Days) {
      // Range: March 17 00:00:00 to April 14 23:59:59
      const startDate = addDays(today, -29); // March 17
      
      const startTime = new Date(startDate);
      startTime.setHours(0, 0, 0, 0); // 00:00:00
      
      const endTime = new Date(yesterday);
      endTime.setHours(23, 59, 59, 0); // 23:59:59
      
      // Format dates as strings in YYYY-MM-DD HH:MM:SS format
      const startDateStr = format(startTime, 'yyyy-MM-dd HH:mm:ss');
      const endDateStr = format(endTime, 'yyyy-MM-dd HH:mm:ss');
      
      dispatch(setDateRangeFilter({
        startDate: startDateStr,
        endDate: endDateStr
      }));
    } else if (isLast90Days) {
      // Range: January 16 00:00:00 to April 14 23:59:59
      const startDate = addDays(today, -89); // January 16
      
      const startTime = new Date(startDate);
      startTime.setHours(0, 0, 0, 0); // 00:00:00
      
      const endTime = new Date(yesterday);
      endTime.setHours(23, 59, 59, 0); // 23:59:59
      
      // Format dates as strings in YYYY-MM-DD HH:MM:SS format
      const startDateStr = format(startTime, 'yyyy-MM-dd HH:mm:ss');
      const endDateStr = format(endTime, 'yyyy-MM-dd HH:mm:ss');
      
      dispatch(setDateRangeFilter({
        startDate: startDateStr,
        endDate: endDateStr
      }));
    } else if (isLast360Days) {
      // Range: April 21, 2024 00:00:00 to April 14, 2025 23:59:59
      const startDate = addDays(today, -359); // April 21, 2024
      
      const startTime = new Date(startDate);
      startTime.setHours(0, 0, 0, 0); // 00:00:00
      
      const endTime = new Date(yesterday);
      endTime.setHours(23, 59, 59, 0); // 23:59:59
      
      // Format dates as strings in YYYY-MM-DD HH:MM:SS format
      const startDateStr = format(startTime, 'yyyy-MM-dd HH:mm:ss');
      const endDateStr = format(endTime, 'yyyy-MM-dd HH:mm:ss');
      
      dispatch(setDateRangeFilter({
        startDate: startDateStr,
        endDate: endDateStr
      }));
    } else {
      // Any other manual selection: use exact times 00:00:00 to 23:59:59
      const startTime = new Date(selectedRange.startDate);
      startTime.setHours(0, 0, 0, 0); // 00:00:00
      
      const endTime = new Date(selectedRange.endDate);
      endTime.setHours(23, 59, 59, 0); // 23:59:59
      
      // Format dates as strings in YYYY-MM-DD HH:MM:SS format
      const startDateStr = format(startTime, 'yyyy-MM-dd HH:mm:ss');
      const endDateStr = format(endTime, 'yyyy-MM-dd HH:mm:ss');
      
      dispatch(setDateRangeFilter({
        startDate: startDateStr,
        endDate: endDateStr
      }));
    }
    
    handleClose();
  };

  const handleResetFilter = () => {
    const startDate = new Date(2000, 0, 1);
    const endDate = new Date(2050, 11, 31);
    
    setSelectedRange({
      startDate,
      endDate,
      key: 'selection'
    });
    
    // Format dates as strings in YYYY-MM-DD HH:MM:SS format
    dispatch(setDateRangeFilter({
      startDate: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
      endDate: format(endDate, 'yyyy-MM-dd HH:mm:ss')
    }));
    
    handleClose();
  };

  const getStaticRanges = () => {
    return [
      ...createStaticRanges([
        {
          label: "Today",
          range: () => ({
            // Calendar shows: only today (April 15)
            startDate: startOfDay(new Date()),
            endDate: endOfDay(new Date())
          })
        },
        {
          label: "Last 7 Days",
          range: () => {
            // Calendar shows: April 9 to April 14 (excluding today)
            const yesterday = addDays(new Date(), -1);
            return {
              startDate: addDays(new Date(), -6),
              endDate: endOfDay(yesterday) // Yesterday at 23:59:59
            };
          }
        },
        {
          label: "Last 30 Days",
          range: () => {
            // Calendar shows: March 17 to April 14 (excluding today)
            const yesterday = addDays(new Date(), -1);
            return {
              startDate: addDays(new Date(), -29),
              endDate: endOfDay(yesterday) // Yesterday at 23:59:59
            };
          }
        },
        {
          label: "Last 60 Days",
          range: () => {
            // Calendar shows: Feb 15 to April 14 (excluding today)
            const yesterday = addDays(new Date(), -1);
            return {
              startDate: addDays(new Date(), -59),
              endDate: endOfDay(yesterday) // Yesterday at 23:59:59
            };
          }
        },
        {
          label: "Last 90 Days",
          range: () => {
            // Calendar shows: January 16 to April 14 (excluding today)
            const yesterday = addDays(new Date(), -1);
            return {
              startDate: addDays(new Date(), -89),
              endDate: endOfDay(yesterday) // Yesterday at 23:59:59
            };
          }
        },
        {
          label: "Last 360 Days",
          range: () => {
            // Calendar shows: April 21, 2024 to April 14, 2025 (excluding today)
            const yesterday = addDays(new Date(), -1);
            return {
              startDate: addDays(new Date(), -359),
              endDate: endOfDay(yesterday) // Yesterday at 23:59:59
            };
          }
        },
        {
          label: "All",
          range: () => ({
            startDate: new Date(2000, 0, 1),
            endDate: new Date(2050, 11, 31)
          })
        }
      ])
    ];
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  // Format dates for display
  const formatDateDisplay = () => {
    try {
      const startDateStr = format(selectedRange.startDate, 'MMM dd, yyyy');
      const endDateStr = format(selectedRange.endDate, 'MMM dd, yyyy');
      return `${startDateStr} - ${endDateStr}`;
    } catch (error) {
      return 'Select date range';
    }
  };

  return (
    <>
      <TextField
        variant="standard"
        fullWidth
        id="date-range-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EventIcon color="primary" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <ArrowDropDownIcon />
            </InputAdornment>
          ),
          readOnly: true
        }}
        value={formatDateDisplay()}
        onClick={handleClick}
        sx={{ minWidth: '160px', cursor: 'pointer' }}
      />
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{ 
          '& .rdrStaticRange': {
            fontSize: '13px',
            padding: '5px 10px'
          }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DateRangePicker
            ranges={[selectedRange]}
            onChange={handleRangeChange}
            staticRanges={getStaticRanges()}
            inputRanges={[]}
            months={2}
            direction="horizontal"
            showMonthAndYearPickers={true}
            showDateDisplay={false}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
            <button 
              onClick={handleResetFilter}
              style={{ 
                marginRight: '8px', 
                padding: '6px 12px', 
                backgroundColor: '#f5f5f5', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Reset
            </button>
            <button 
              onClick={handleSetFilter}
              style={{ 
                padding: '6px 12px', 
                backgroundColor: '#1976d2', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Popover>
    </>
  );
};

export default CalendarRangePicker;
