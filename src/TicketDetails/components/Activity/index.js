import React, { useMemo, useState, useCallback } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { useQuery } from "@apollo/client";
import { GET_ACTIVITIES } from "TicketDetails/TicketGraphQL";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import h2p from "html2plaintext";
import HistoryDialog from "components/HistoryDialog";
import { preventEvent } from "Common/helper";
import { cloneDeep, isEmpty, replace } from "lodash";
import Filter from "./components/Filter";

const Activity = (props) => {
  const apiRef = useGridApiRef();
  const { appuser_id, customer } = props;
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    history: {},
  });
  const { data, loading, error } = useQuery(GET_ACTIVITIES, {
    variables: { ticket_id: customer.ticket_id },
    fetchPolicy: "network-only",
  });

  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(["All"]);

  const rows = useMemo(() => {
    if (loading || error || !data) return [];
    
    const allRows = data.activities.map((activity, index) => ({
      id: index + 1,
      date: activity.date_time,
      appuser: activity.appuser,
      type: activity.action,
      category: activity.category, // Use the category field directly
      details: h2p(activity.details),
      raw_details: activity.details,
    }));
  
    let filteredRows = allRows;
  
    // Apply filter logic
    if (!selectedFilters.includes("All")) {
      filteredRows = allRows.filter((row) =>
        selectedFilters.includes(row.category) // Compare with exact category
      );
    }
  
    // Apply search filter
    return filteredRows.filter((row) =>
      row.details.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, loading, error, searchText, selectedFilters]);
  
  

  const columns = [
    { field: "date", headerName: "Date", width: 150, flex: 1 },
    { field: "appuser", headerName: "Users", width: 150, flex: 1 },
    { field: "type", headerName: "Type", width: 120, flex: 1 },
    { field: "details", headerName: "Details", width: 500, flex: 3 },
  ];

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
  }, []);

  const handleCellClick = (params, event) => {
    event.stopPropagation();
    preventEvent(event);
    apiRef.current.setRowSelectionModel([params.id]);
    setDetailDialog({ open: true, history: params.row });
  };

  let html = detailDialog.open ? cloneDeep(detailDialog.history.raw_details) : "";
  html = replace(html, /<p[^>]*>/g, "");
  html = replace(html, /<\/p>/g, "");
  html = replace(html, /&lt;/g, "<");
  html = replace(html, /&gt;/g, ">");
  html = replace(html, /undefined/g, "");
  html = replace(html, /&nbsp/g, "  ");
  const detailText = !isEmpty(html) ? html : "";

  return (
    <AccordionCard
      label="Activity"
      menuOption={
        <div className="d-flex align-items-center">
          <HeaderMenuOptions appuser_id={appuser_id} category="Activity Card" />
        </div>
      }
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Filter setFilter={setSelectedFilters} />
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
            apiRef={apiRef}
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableColumnMenu
            autoHeight
            onCellClick={handleCellClick}
          />
        )}
      </div>
      {detailDialog.open && (
        <HistoryDialog
          open={detailDialog.open}
          handleClose={() => {
            setDetailDialog({ open: false, history: {} });
            apiRef.current.setRowSelectionModel([]);
          }}
          timestamp={detailDialog.history.date}
        >
          {detailText}
        </HistoryDialog>
      )}
    </AccordionCard>
  );
};

export default Activity;
