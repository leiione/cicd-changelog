import React, { useState, useEffect } from "react";
import {
  Chip,
  Popover,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";

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
    const currentDate = new Date();
    const logEntry = {
      date: currentDate.toLocaleDateString(),
      duration: formatTime(seconds),
      timeRange: `${currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(currentDate.getTime() + seconds * 1000).toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}`,
    };

    if (isActive) {
      setLogs((prevLogs) => [...prevLogs, logEntry]);
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
    <Grid container spacing={2} className="pt-3">
      <Grid item xs>
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
      </Grid>
      <Grid item>
        <Chip
          label="Logs"
          className="bg-white f-12"
          onClick={handleLogsClick}
          variant="outlined"
          color="primary"
          aria-label="View Logs"
        />

        <Popover
          id="logs-popover"
          open={isLogsOpen}
          anchorEl={anchorEl}
          onClose={handleLogsClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Card>
            {/* Popover Header */}
            <CardContent className="d-flex align-items-center justify-content-between">
              <Typography variant="h6">
                Logs
              </Typography>
              <IconButton size="small" onClick={handleLogsClose}>
                <CloseIcon />
              </IconButton>
            </CardContent>

            {/* Popover Body */}
            <CardContent>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <Grid
                    container
                    key={index}
                    spacing={1}
                    sx={{
                      mb: 2,
                      borderBottom: "1px solid #ddd",
                      pb: 1,
                    }}
                  >
                    <Grid item xs={4}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
                      >
                        {log.date}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.9rem", textAlign: "center" }}
                      >
                        {log.duration}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.8rem", textAlign: "right" }}
                      >
                        {log.timeRange}
                      </Typography>
                    </Grid>
                  </Grid>
                ))
              ) : (
                <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
                  No logs available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Popover>
      </Grid>
    </Grid>
  );
};

export default Stopwatch;
