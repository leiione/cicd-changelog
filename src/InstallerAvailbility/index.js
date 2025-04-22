import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  InputBase,
  Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery } from "@apollo/client";
import { INSTALLER_AVAILABILITY_QUERY } from "./InstallerGraphQL";
import DataGridTable from "Common/DataGridTable";
import ScheduleOffTimeDrawer from "./components/ScheduleOffTimeDrawer";
import ScheduledOffDialog from "./components/ScheduleOffDialog";

const InstallerAvailbility = () => {
  const ref = useRef(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScheduleOffDrawerOpen, setIsScheduleOffDrawerOpen] = useState(false);
  const [isScheduledOffDialogOpen, setIsScheduledOffDialogOpen] = useState(false);
  const [selectedScheduledOff, setSelectedScheduledOff] = useState(null);



  const { loading, data } = useQuery(INSTALLER_AVAILABILITY_QUERY, {
    fetchPolicy: "network-only",
  });

  const realData = React.useMemo(() =>
    data?.installerAvailability?.map((installer, index) => ({
      id: index + 1,
      user_id: installer.user_id,
      installerName: installer.user_name,
      skills: installer.skills,
      workDays: !installer.work_days || installer.work_days === "" ? "None" : installer.work_days,
      workHours: !installer.work_hours || installer.work_hours === "" || installer.work_hours === " - " ? "None" : installer.work_hours,
      scheduledOff: installer.Scheduled_off || "None",
    })) || [],
    [data]
  );

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return realData;
    return realData.filter((item) =>
      item.installerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, realData]);

  const columns = [
    { field: "installerName", headerName: "Technician Name", width: 200, flex: 1 },
    { field: "skills", headerName: "Skills", width: 100, flex: 0.3 },
    { field: "workDays", headerName: "Work Days", width: 150, flex: 1 },
    { field: "workHours", headerName: "Work Hours", width: 150, flex: 1.5 },
    {
      field: 'scheduledOff',
      headerName: 'Scheduled Off',
      flex: 2.2,
      renderCell: (params) => (
        <Typography 
          className="w-100 text-truncate"
          sx={{
            color: params.value !== 'None' ? '#1976d2' : 'inherit',
            cursor: params.value !== 'None' ? 'pointer' : 'default',
            '&:hover': {
              textDecoration: params.value !== 'None' ? 'underline' : 'none'
            }
          }}
        >
          {params.value}
        </Typography>
      )
    }
  ];

  const handleCellClick = (params) => {
    if (params.field === 'scheduledOff' && params.value !== 'None') {
      setSelectedScheduledOff(params.row);
      setIsScheduledOffDialogOpen(true);
    }
  };
  

  return (
    <>
      <Box sx={{ height: "100%", width: "100%", p: 2 }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Technician Availability
            </Typography>
            {showSearch ? (
              <Box sx={{ display: "flex", alignItems: "center", bgcolor: "background.paper", borderRadius: 1 }}>
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <IconButton size="small" onClick={() => setShowSearch(true)}>
                <SearchIcon />
              </IconButton>
            )}
          </Box>
          <Box sx={{ height: '400px', overflow: 'auto' }}>
            <DataGridTable
              containerHeight={ref.current ? ref.current.clientHeight : 300}
              rows={filteredData}
              columns={columns}
              loading={loading}
              handleRowClick={null}
              onCellClick={handleCellClick} // Add this line to pass your cell click handler
              disableRowSelectionOnClick={true}
              
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setIsScheduleOffDrawerOpen(true)}
            >
              Schedule Off-Day
            </Button>
          </Box>
        </Paper>
      </Box>
      <ScheduleOffTimeDrawer
        open={isScheduleOffDrawerOpen}
        onClose={() => setIsScheduleOffDrawerOpen(false)}
      />
      <ScheduledOffDialog
        open={isScheduledOffDialogOpen}
        onClose={() => setIsScheduledOffDialogOpen(false)}
        scheduledOffData={selectedScheduledOff}
      />
    </>
  );
};

export default React.memo(InstallerAvailbility);