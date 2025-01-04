import React, { useState, useEffect } from "react";
import { Chip, Popover, Typography, Box, Grid } from "@mui/material";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";

const Stopwatch = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggle = () => {
    const currentTime = new Date().toLocaleTimeString();
    if (isActive) {
      setLogs((prevLogs) => [...prevLogs, `Stopped at ${currentTime}`]);
    } else {
      setLogs((prevLogs) => [...prevLogs, `Started at ${currentTime}`]);
    }
    setIsActive(!isActive);
  };

  const formatTime = (sec) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(
      2,
      "0"
    )} : ${String(seconds).padStart(2, "0")}`;
  };

  const handleLogsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogsClose = () => {
    setAnchorEl(null);
  };

  const isLogsOpen = Boolean(anchorEl);

  return (


<Box display="flex" alignItems="center" gap={2}>

<Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      1
    </Grid>
    <Grid item xs={12} md={6}>
      2    </Grid>
  </Grid>
      <Chip
        label={formatTime(seconds)}
        icon={
          isActive ? (
            <StopCircleOutlinedIcon className="text-danger" />
          ) : (
            <PlayCircleFilledWhiteOutlinedIcon className="text-primary" />
          )
        }
        onClick={toggle}
        variant="outlined"
        color={isActive ? "error" : "primary"}
        sx={{
          borderColor: isActive ? "error.main" : "primary.main",
        }}
        aria-label={isActive ? "Pause Timer" : "Start Timer"}
      />

      <Chip
        label="Logs"
        className="bg-white f-12"
        onClick={handleLogsClick}
        variant="outlined"
        color="primary"
        aria-label="View Logs"
      />

      <Popover
        open={isLogsOpen}
        anchorEl={anchorEl}
        onClose={handleLogsClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Box p={2}>
          <Typography variant="subtitle2">Logs</Typography>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <Typography key={index} variant="body2">
                {log}
              </Typography>
            ))
          ) : (
            <Typography variant="body">
              No logs available.
            </Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default Stopwatch;
