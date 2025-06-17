import React, { useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { MobileDateRangePicker } from "@mui/x-date-pickers-pro";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const DateSelector = ({ dateRange, setDateRange, reset }) => {
  const [openPicker, setOpenPicker] = useState(false);
  const isSmall = useMediaQuery("(max-width:360px)");

  const handleDateChange = (newValue) => {
    if (newValue[0] && newValue[1]) {
      setDateRange(newValue);
    } else if (newValue[0]) {
      setDateRange([newValue[0], dateRange[1]]);
    } else if (newValue[1]) {
      setDateRange([dateRange[0], newValue[1]]);
    }
    reset();
  };

  const formattedDateRange = `${dateRange[0]?.format(
    "MMM D, YYYY"
  )} - ${dateRange[1]?.format("MMM D, YYYY")}`;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          gap: 1,
        }}
        onClick={() => setOpenPicker(true)}
      >
        <CalendarMonthOutlinedIcon
          fontSize="small"
          sx={{ color: "#000000", mr: 1 }}
        />
        <Typography
          variant="body2"
          sx={{
            color: "#2E2E2E",
            fontSize: isSmall ? "10px" : "13px", 
            paddingRight:"4px"
          }}
        >
          {formattedDateRange}
        </Typography>
      </Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MobileDateRangePicker
          open={openPicker}
          onOpen={() => setOpenPicker(true)}
          onClose={() => setOpenPicker(false)}
          value={dateRange}
          onAccept={handleDateChange}
          format="DD-MM-YYYY"
          slots={{ fieldRoot: () => null }}
        /> 
      </LocalizationProvider>
    </>
  );
};

export default DateSelector;
