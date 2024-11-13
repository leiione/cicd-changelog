import React, { useMemo, useState, useCallback } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@apollo/client";
import { GET_ACTIVITIES } from "TicketDetails/TicketGraphQL";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Activity = (props) => {
  const { appuser_id, customer } = props;

  const { data, loading, error } = useQuery(GET_ACTIVITIES, {
    variables: { ticket_id: customer.ticket_id },
    fetchPolicy: "network-only",
  });

  const [searchText, setSearchText] = useState("");

  const rows = useMemo(() => {
    if (loading || error || !data) return [];
    const allRows = data.activities.map((activity, index) => ({
      id: index + 1,
      date: activity.date_time,
      appuser: activity.appuser,
      type: activity.action,
      details: activity.details,
    }));
    return allRows.filter((row) =>
      row.details.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, loading, error, searchText]);

  const columns = [
    { field: "date", headerName: "Date", width: 150, flex: 1 },
    { field: "appuser", headerName: "Users", width: 150, flex: 1 },
    { field: "type", headerName: "Type", width: 120, flex: 1 },
    { field: "details", headerName: "Details", width: 500, flex: 3 },
  ];

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
  }, []);

  return (
    <AccordionCard
      label="Activity"
      menuOption={
        <div className="d-flex align-items-center">
          <HeaderMenuOptions appuser_id={appuser_id} category="Activity Card" />
        </div>
      }
    >
      <div className="text-right">
        <TextField
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
      </div>
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
