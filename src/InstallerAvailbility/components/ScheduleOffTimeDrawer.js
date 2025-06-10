import React, { useState, useMemo, useEffect } from "react";
import InnerDrawer from "Common/InnerDrawer";
import {
  Box,
  Button,
  Typography,
  TextField,
  ListItemText,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Autocomplete,
  List,
  ListItem,
  Snackbar,
  Alert
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from "dayjs";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useQuery, useMutation } from '@apollo/client';
import { INSTALLER_AVAILABILITY_QUERY, SCHEDULE_OFF_TIME, GET_INSTALLER_SCHEDULE_OFF_DETAIL, DELETE_SCHEDULE_OFF_TIME } from '../InstallerGraphQL';
import { GET_ASSIGNEES } from '../../TicketDetails/TicketGraphQL';
import HookTextField from "Common/hookFields/HookTextField";
import { useDispatch } from 'react-redux';
import { showSnackbar } from 'config/store';
import DialogAlert from "components/DialogAlert";


const ScheduleOffTimeDrawer = ({ open, onClose, editUserScheduleOffID, seteditUserScheduledOffID }) => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState([null, null]);
  const [isPartialDay, setIsPartialDay] = useState(false);
  const [startTime, setStartTime] = useState(dayjs().set('hour', 8).set('minute', 0));
  const [endTime, setEndTime] = useState(dayjs().set('hour', 17).set('minute', 0));
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savingOffTime, setSavingOffTime] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  const { loading, error, data } = useQuery(INSTALLER_AVAILABILITY_QUERY, {
    skip: !open,
    fetchPolicy: 'network-only' // Always fetch fresh data when drawer opens
  });
  const { loading: assigneesLoading, error: assigneesError, data: assigneesData } = useQuery(GET_ASSIGNEES, {
    skip: !open,
    fetchPolicy: 'network-only' // Always fetch fresh data when drawer opens
  });

  const { data: scheduleOffData } = useQuery(GET_INSTALLER_SCHEDULE_OFF_DETAIL, {
    variables: { id: editUserScheduleOffID },
    skip: !editUserScheduleOffID,
    fetchPolicy: 'network-only'
  });

  const resetForm = () => {
    // Reset form fields
    methods.reset({
      technicians: [],
      reason: "",
      isPartialDay: false
    });

    // Reset state variables
    setDateRange([null, null]);
    setIsPartialDay(false);
    setStartTime(dayjs().set('hour', 8).set('minute', 0));
    setEndTime(dayjs().set('hour', 17).set('minute', 0));
    setIsSelectingRange(false);
    seteditUserScheduledOffID(null)
    setIsEditMode(false);

  };

  const onCompleted = () => {
    resetForm();
    dispatch(showSnackbar({
      message: isEditMode ? "Schedule off time updated successfully" : "Schedule off time saved successfully",
      severity: "success"
    }));
    onClose();
  };


  const onError = (error) => {
    dispatch(showSnackbar({
      message: error.message,
      severity: "error"
    }));
  };

  const [scheduleOffTime] = useMutation(SCHEDULE_OFF_TIME, {
    refetchQueries: [{ query: INSTALLER_AVAILABILITY_QUERY }],
    onCompleted,
    onError
  });

  const [deleteScheduleOffTime] = useMutation(DELETE_SCHEDULE_OFF_TIME, {
    refetchQueries: [{ query: INSTALLER_AVAILABILITY_QUERY }],
    onCompleted,
    onError
  });


  const methods = useForm({
    defaultValues: {
      technicians: [],
      reason: "",
      isPartialDay: false
    },
    mode: "onChange"
  });

  useEffect(() => {
    if (editUserScheduleOffID && scheduleOffData?.getInstallerScheduleOffDetail) {
      setIsEditMode(true);
      const scheduleOffItem = scheduleOffData.getInstallerScheduleOffDetail;

      if (scheduleOffItem) {
        // Get flag_all_day status
        const isPartial = !scheduleOffItem.flag_all_day;
        setIsPartialDay(isPartial);
        methods.setValue('isPartialDay', isPartial);

        // Set reason
        methods.setValue('reason', scheduleOffItem.reason || '');

        if (assigneesData?.assignees) {
          const techUser = assigneesData.assignees.find(user =>
            user.appuser_id === scheduleOffItem.user_id
          );


          if (techUser) {
            const selectedAssigne = {
              value: techUser.appuser_id,
              label: techUser.realname

            }
            methods.setValue('technicians', [selectedAssigne]);
          }
        }

        // Parse start and end times
        try {
          // Extract only the date part from the timestamps to avoid timezone issues
          const startDate = scheduleOffItem.start_time.split('T')[0];
          const endDate = scheduleOffItem.end_time.split('T')[0];

          const startDateTime = dayjs(startDate);
          const endDateTime = dayjs(endDate);

          if (startDateTime.isValid() && endDateTime.isValid()) {
            // Set date range using the extracted dates
            setDateRange([startDateTime, endDateTime]);

            // If it's a partial day, set the time parts
            if (isPartial) {
              // Extract time parts from the original timestamps
              const startTimeParts = scheduleOffItem.start_time.split('T')[1].split(':');
              const endTimeParts = scheduleOffItem.end_time.split('T')[1].split(':');

              setStartTime(dayjs().set('hour', parseInt(startTimeParts[0])).set('minute', parseInt(startTimeParts[1])));
              setEndTime(dayjs().set('hour', parseInt(endTimeParts[0])).set('minute', parseInt(endTimeParts[1])));
            }
          }
        } catch (error) {
          console.error('Error parsing date/time:', error);
        }
      }
    } else {
      setIsEditMode(false);
    }
  }, [editUserScheduleOffID, scheduleOffData, assigneesData, methods]);



  const technicians = methods.watch("technicians");
  const reason = methods.watch("reason");
  const isValidTime = (time) => {
    return time && dayjs.isDayjs(time) && time.isValid() && !isNaN(time.hour()) && !isNaN(time.minute());
  };

  const isSaveDisabled = !technicians?.length ||
    savingOffTime ||
    !dateRange[0] ||
    !dateRange[1] ||
    !reason?.trim() ||
    (isPartialDay && (!isValidTime(startTime) || !isValidTime(endTime)));

  const handlePartialDayChange = (event) => {
    setIsPartialDay(event.target.checked);
    methods.setValue('isPartialDay', event.target.checked);
  };

  const handleDateSelect = (newDate) => {
    if (!isSelectingRange) {
      // Start new range
      setDateRange([newDate, newDate]);
      setIsSelectingRange(true);
    } else {
      // Complete range
      const start = dateRange[0];
      const end = newDate;
      if (end.isBefore(start)) {
        setDateRange([end, start]);
      } else {
        setDateRange([start, end]);
      }
      setIsSelectingRange(false);
    }
  };

  const handleSave = async () => {
    setSavingOffTime(true);
    const values = methods.getValues();
    const startDate = dateRange[0];
    const endDate = dateRange[1];

    try {
      await scheduleOffTime({
        variables: {
          userIds: values.technicians.map(tech => tech.value),
          startTime: isPartialDay ? `${startDate.format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}` : startDate.format('YYYY-MM-DD'),
          endTime: isPartialDay ? `${endDate.format('YYYY-MM-DD')} ${endTime.format('HH:mm:ss')}` : endDate.format('YYYY-MM-DD'),
          flagAllDay: !isPartialDay,
          reason: values.reason || 'None', // Add reason field
          id: isEditMode ? editUserScheduleOffID : undefined

        }
      });

      dispatch(showSnackbar({
        message: isEditMode ? "Schedule off time updated successfully" : "Schedule off time saved successfully",
        severity: "success"
      }));

      onClose();
    } catch (error) {
      dispatch(showSnackbar({
        message: error.message,
        severity: "error"
      }));
      console.error('Error scheduling off time:', error);
    } finally {
      setSavingOffTime(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Function to parse a date entry and return array of dates with time info
  const parseDateEntry = (entry) => {
    try {
      let dates = [];
      let timeRange = '';

      // Check if entry has time information
      const timeMatch = entry.match(/\((.*?)\)/);
      if (timeMatch) {
        timeRange = timeMatch[1];
        entry = entry.split('(')[0].trim();
      }

      // Handle date range with "TO"
      if (entry.includes(' TO ')) {
        const [startStr, endStr] = entry.split(' TO ').map(d => d.trim());
        const startDate = dayjs(startStr, 'MMM D, YYYY');
        const endDate = dayjs(endStr, 'MMM D, YYYY');

        if (startDate.isValid() && endDate.isValid()) {
          let currentDate = startDate;
          const endDateTime = endDate.endOf('day');

          while (currentDate.isBefore(endDateTime) || currentDate.isSame(endDateTime, 'day')) {
            dates.push({
              date: currentDate,
              timeRange
            });
            currentDate = dayjs(currentDate).add(1, 'day');
          }
        } else {
          console.error('Invalid date in range:', { startStr, endStr });
        }
      } else {
        // Handle single date
        const date = dayjs(entry, 'MMM D, YYYY');
        if (date.isValid()) {
          dates.push({
            date,
            timeRange
          });
        } else {
          console.error('Invalid single date:', entry);
        }
      }

      return dates;
    } catch (e) {
      console.error('Error parsing date entry:', e, entry);
      return [];
    }
  };

  // Function to check if a date has scheduled off
  const isScheduledOff = (date) => {
    if (!data?.installerAvailability) return false;

    const checkDate = dayjs(date);
    if (!checkDate.isValid()) {
      console.error('Invalid check date:', date);
      return false;
    }

    return data.installerAvailability.some(tech => {
      if (!tech.Scheduled_off) return false;

      const dateEntries = tech.Scheduled_off.split('|').map(entry => entry.trim());
      const allDates = dateEntries.flatMap(entry => parseDateEntry(entry));

      return allDates.some(({ date: parsedDate }) =>
        checkDate.startOf('day').isSame(parsedDate.startOf('day'))
      );
    });
  };

  const renderTechniciansList = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Typography color="error">
          Error loading technicians: {error.message}
        </Typography>
      );
    }

    if (!data?.installerAvailability) {
      return (
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      );
    }

    if (!dateRange[0] || !dateRange[1]) {
      return (
        <Typography variant="body2" color="text.secondary">
          Please select a date
        </Typography>
      );
    }

    // Group technicians by their ID
    const technicianGroups = new Map();

    data.installerAvailability
      .filter(tech => tech.Scheduled_off)
      .forEach(tech => {
        try {
          const dateEntries = tech.Scheduled_off.split('|').map(entry => entry.trim());

          dateEntries.forEach(entry => {
            const parsedDates = parseDateEntry(entry);
            const selectedStart = dayjs(dateRange[0]).startOf('day');
            const selectedEnd = dayjs(dateRange[1]).endOf('day');

            parsedDates.forEach(({ date, timeRange }) => {
              const dateStart = date.startOf('day');
              if (dateStart.isBetween(selectedStart, selectedEnd, 'day', '[]')) {
                if (!technicianGroups.has(tech.user_id)) {
                  technicianGroups.set(tech.user_id, {
                    ...tech,
                    dates: []
                  });
                }

                const techGroup = technicianGroups.get(tech.user_id);
                techGroup.dates.push({
                  date: dateStart,
                  timeRange,
                  displayText: timeRange
                    ? `${dateStart.format('MMM D, YYYY')} (${timeRange})`
                    : dateStart.format('MMM D, YYYY')
                });
              }
            });
          });
        } catch (e) {
          console.error('Error processing technician schedule:', e, tech);
        }
      });

    if (technicianGroups.size === 0) {
      const dateDisplay = dateRange[0].isSame(dateRange[1], 'day')
        ? dateRange[0].format('MMM D, YYYY')
        : `${dateRange[0].format('MMM D')} - ${dateRange[1].format('MMM D, YYYY')}`;

      return (
        <Typography variant="body2" color="text.secondary">
          No technicians scheduled off for {dateDisplay}
        </Typography>
      );
    }

    // Sort technicians by name
    const sortedTechnicians = Array.from(technicianGroups.values())
      .sort((a, b) => a.user_name.localeCompare(b.user_name));



    return (
      <List>
        {sortedTechnicians.map((tech) => (
          <ListItem key={tech.user_id}>
            <ListItemText
              primary={tech.user_name}
              secondary={
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {tech.dates
                    .sort((a, b) => a.date.valueOf() - b.date.valueOf())
                    .map(d => d.displayText)
                    .join('\n')}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };


  const handleDelete = () => {
    setOpenDialog(true);
  }


  const handleOnDelete = async () => {
    if (!editUserScheduleOffID) return;
    setSubmitting(true);


    try {
      await deleteScheduleOffTime({
        variables: {
          id: editUserScheduleOffID
        }
      });

      dispatch(showSnackbar({
        message: "Schedule off time deleted successfully",
        severity: "success"
      }));

      onClose();
    } catch (error) {
      dispatch(showSnackbar({
        message: error.message,
        severity: "error"
      }));
      console.error('Error deleting schedule off time:', error);
    }
    setSubmitting(false);
    setOpenDialog(false);
  };

  const isDateRangeInPast = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return false;
    const today = dayjs().startOf('day');
    // If start date is in the past, disable the form
    return dateRange[0].startOf('day').isBefore(today);
  }, [dateRange]);

  // // Show warning snackbar when past date is selected
  // useEffect(() => {
  //   if (isDateRangeInPast) {
  //     dispatch(showSnackbar({
  //       message: "Cannot schedule off time for past dates",
  //       severity: "warning"
  //     }));
  //   }
  // }, [isDateRangeInPast, dispatch]);

  return (
    <>
      <InnerDrawer
        header={isEditMode ? "Edit Schedule Off Time" : "Schedule Off Time"}
        open={open}
        width={"40vw"}
        onCloseDrawer={handleClose}
      >
        <FormProvider {...methods}>
          <Box sx={{ p: 2 }}>
            {/* First Row */}
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <Box sx={{
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 1,
                  '& .MuiPickersDay-root': {
                    position: 'relative',
                    '&[data-off="true"]::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: '#f44336'
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#1976d2',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#1565c0'
                      }
                    },
                    '&.in-range': {
                      backgroundColor: '#e3f2fd',
                      '&:hover': {
                        backgroundColor: '#bbdefb'
                      }
                    },
                    '&.MuiPickersDay-today': {
                      border: 'none'
                    }
                  }
                }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                      value={dateRange[1] || null}
                      defaultCalendarMonth={dayjs()}
                      autoFocus={false}
                      onChange={handleDateSelect}
                      slotProps={{
                        day: (props) => {
                          const date = dayjs(props.day);
                          const isInRange = dateRange[0] && dateRange[1] &&
                            date.isAfter(dateRange[0], 'day') &&
                            date.isBefore(dateRange[1], 'day');
                          const isSelected = dateRange[0] && dateRange[1] &&
                            (date.isSame(dateRange[0], 'day') ||
                              date.isSame(dateRange[1], 'day'));
                          return {
                            ...props,
                            className: `${props.className} ${isInRange ? 'in-range' : ''} ${isSelected ? 'Mui-selected' : ''}`,
                            'data-off': isScheduledOff(date)
                          };
                        }
                      }}
                    />

                  </LocalizationProvider>
                  {isDateRangeInPast && (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{
                        mt: 1,
                        textAlign: 'center',
                        fontWeight: 'small'
                      }}
                    >
                      Please select future dates for scheduling off time
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="subtitle1" gutterBottom>
                  Technicians Scheduled Off
                </Typography>
                <Box
                  sx={{
                    height: '320px', // Matches approximate calendar height
                    overflowY: 'auto',
                    // Custom scrollbar styling
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#888',
                      borderRadius: '4px',
                      '&:hover': {
                        background: '#666',
                      },
                    },
                  }}
                >
                  {renderTechniciansList()}
                </Box>
              </Grid>
            </Grid>

            {/* Second Row */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={7}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Technicians
                </Typography>
                <Controller
                  name="technicians"
                  control={methods.control}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      multiple
                      options={[
                        { value: 'all', label: 'All' },
                        ...(assigneesData?.assignees || []).map(assignee => ({
                          value: assignee.appuser_id,
                          label: assignee.realname
                        }))
                      ]}
                      value={value || []}
                      onChange={(event, newValue) => {
                        if (!isDateRangeInPast && !isEditMode) {
                          // Check if "All" is selected
                          if (newValue.some(item => item.value === 'all')) {
                            // If "All" is selected, select all technicians except the "All" option
                            const allTechnicians = assigneesData?.assignees.map(assignee => ({
                              value: assignee.appuser_id,
                              label: assignee.realname
                            })) || [];
                            onChange(allTechnicians);
                          } else {
                            onChange(newValue);
                          }
                        }
                      }}
                      getOptionLabel={(option) => option.label || ""}
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          placeholder={value?.length > 0 ? "" : "Select Technicians"}
                          error={!!assigneesError || (!technicians?.length && methods.formState.isSubmitted)}
                          helperText={
                            assigneesError
                              ? "Error loading technicians"
                              : (!technicians?.length && methods.formState.isSubmitted)
                                ? "Please select at least one technician"
                                : null
                          }
                          sx={{
                            '& .MuiInput-root': {
                              padding: '0 0 4px 0',
                              '&::before': {
                                borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                              },
                              '&:hover:not(.Mui-disabled, .Mui-error):before': {
                                borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                              }
                            },
                            '& .MuiAutocomplete-input': {
                              cursor: isDateRangeInPast ? 'not-allowed' : 'text'
                            }
                          }}
                          disabled={isEditMode || isDateRangeInPast}
                        />
                      )}
                      disabled={isEditMode || isDateRangeInPast}
                      loading={assigneesLoading}
                      sx={{
                        '& .MuiInput-root': {
                          padding: '0 0 4px 0',
                          '&::before': {
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                          },
                          '&:hover:not(.Mui-disabled, .Mui-error):before': {
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                          }
                        },
                        pointerEvents: isDateRangeInPast ? 'none' : 'auto'
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={5}>
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPartialDay}
                        onChange={handlePartialDayChange}
                        name="isPartialDay"
                        disabled={isDateRangeInPast}
                      />
                    }
                    label="Partial Off Time"
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Time Selection Row - Only shows when Partial Off Time is checked */}
            {isPartialDay && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Start Time
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      value={startTime}
                      onChange={(newValue) => setStartTime(newValue)}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderWidth: '0 0 1px 0',
                          borderColor: 'rgba(0, 0, 0, 0.12)'
                        },
                        '& .MuiOutlinedInput-root': {
                          padding: '0 0 4px 0',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.12)'
                          }
                        }
                      }}
                      disabled={isDateRangeInPast}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    End Time
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      value={endTime}
                      onChange={(newValue) => setEndTime(newValue)}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderWidth: '0 0 1px 0',
                          borderColor: 'rgba(0, 0, 0, 0.12)'
                        },
                        '& .MuiOutlinedInput-root': {
                          padding: '0 0 4px 0',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.12)'
                          }
                        }
                      }}
                      disabled={isDateRangeInPast}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            )}

            {/* Third Row - Reason */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Reason
                </Typography>
                <HookTextField
                  name="reason"
                  multiline
                  rows={2}
                  placeholder="Add Text Here"
                  fullWidth
                  rules={{ required: "Reason is required" }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '0 0 1px 0',
                      borderColor: 'rgba(0, 0, 0, 0.12)'
                    },
                    '& .MuiOutlinedInput-root': {
                      padding: '0 0 4px 0',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.12)'
                      }
                    }
                  }}
                  disabled={isDateRangeInPast}
                />
              </Grid>
            </Grid>

            {/* Fourth Row - Summary */}
            <Grid container sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Summary
                  </Typography>
                  {dateRange[0] && dateRange[1] && (
                    <Typography variant="body2">
                      Date: {dayjs(dateRange[0]).format('MMM D, YYYY')} - {dayjs(dateRange[1]).format('MMM D, YYYY')}
                    </Typography>
                  )}
                  {isPartialDay && isValidTime(startTime) && isValidTime(endTime) && (
                    <Typography variant="body2">
                      Time: {startTime.format('hh:mm A')} - {endTime.format('hh:mm A')}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                    <div>
                      {isEditMode && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={handleDelete}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isSaveDisabled || isDateRangeInPast}
                      >
                        {isEditMode ? "Update" : "Save"}
                      </Button>
                      <Button variant="outlined" onClick={handleClose}>
                        Cancel
                      </Button>

                    </div>
                  </Box>


                </Box>
              </Grid>
            </Grid>
          </Box>
        </FormProvider>
      </InnerDrawer>
      <Snackbar
        open={showSuccess}
        autoHideDuration={1500}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Successfully scheduled off time
        </Alert>
      </Snackbar>

      <DialogAlert
        open={openDialog}
        message={<span>Are you sure you want to delete?</span>}
        buttonsList={[
          {
            label: "Yes",
            size: "medium",
            color: "primary",
            onClick: handleOnDelete,
            isProgress: true,
            isSubmitting: submitting,
          },
          {
            label: "No",
            size: "medium",
            color: "default",
            onClick: () => setOpenDialog(false),
            disabled: submitting,
          },
        ]}
      />

    </>
  );
};

export default ScheduleOffTimeDrawer;