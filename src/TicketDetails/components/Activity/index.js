import React, { useMemo, useState, useCallback } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@apollo/client";
import { GET_ACTIVITIES } from "TicketDetails/TicketGraphQL";
import { TextField, Box, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { makeStyles } from "@mui/styles";

// Custom styles
const useStyles = makeStyles(() => ({
  searchWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "8px 16px", // Adjust padding for spacing
    marginBottom: "10px",
  },
  searchField: {
    width: "100%",
    maxWidth: "200px", // Optional: Set max width to keep it compact
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px", // Rounded corners
      paddingRight: "8px", // Space between text and icon
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px 14px", // Adjust padding inside the input
    },
  },
}));

const Activity = (props) => {
  const { appuser_id, customer } = props;
  const classes = useStyles();
  
  const { data, loading, error } = useQuery(GET_ACTIVITIES, {
    variables: { ticket_id: customer.ticket_id },
    fetchPolicy: "network-only",
  });

  const [searchText, setSearchText] = useState("");

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const rows = useMemo(() => {
    if (loading || error || !data) return [];
    const allRows = data.activities.map((activity, index) => ({
      id: index + 1,
      date: activity.date_time,
      // lastModified: formatDate(activity.last_modified),
      type: activity.action,
      details: activity.details,
    }));
    return allRows.filter((row) =>
      row.details.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, loading, error, searchText]);

  const columns = [
    { field: "date", headerName: "Date", width: 150, flex: 1 },
    // { field: "lastModified", headerName: "Last Modified", width: 150, flex: 1 },
    { field: "type", headerName: "Type", width: 120, flex: 1 },
    { field: "details", headerName: "Details", width: 500, flex: 3 },
  ];

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
  }, []);

  return (
    <AccordionCard
      label="Activity"
      className="pt-0"
      menuOption={
        <div className="d-flex align-items-center">
          <HeaderMenuOptions appuser_id={appuser_id} category="Activity Card" />
        </div>
      }
    >
      <Box className={classes.searchWrapper}>
        <TextField
          className={classes.searchField}
          variant="outlined"
          size="small"
          placeholder="Search"
          value={searchText}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <div style={{ width: "100%" }}>
        {loading ? (
          <p>Loading activities...</p>
        ) : error ? (
          <p>Error loading activities: {error.message}</p>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableColumnMenu
            autoHeight
            disableSelectionOnClick
          />
        )}
      </div>
    </AccordionCard>
  );
};

export default Activity;
