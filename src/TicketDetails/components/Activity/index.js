import React, { useMemo } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@apollo/client";
import { GET_ACTIVITIES } from "TicketDetails/TicketGraphQL";

const Activity = (props) => {
  const { appuser_id, customer } = props;
  console.log("props", props);

  const { data, loading, error } = useQuery(GET_ACTIVITIES, {
    variables: { ticket_id: customer.ticket_id },
    fetchPolicy: "network-only",
  });

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', // Jul
      day: '2-digit', // 09
      year: 'numeric', // 2024
      hour: '2-digit', // 02
      minute: '2-digit', // 04
      hour12: true, // AM/PM format
    }).format(date);
  };

  // Extract rows from query response
  const rows = useMemo(() => {
    if (loading || error || !data) return [];
    return data.activities.map((activity, index) => ({
      id: index + 1, // Unique ID for DataGrid
      date: formatDate(activity.date_time),
      lastModified: formatDate(activity.last_modified),
      type: activity.action, // Use the 'action' field as 'type'
      details: activity.details,
    }));
  }, [data, loading, error]);

  const columns = [
    { field: 'date', headerName: 'Date', width: 150, flex: 1 },
    { field: 'lastModified', headerName: 'Last Modified', width: 150, flex: 1 },
    { field: 'type', headerName: 'Type', width: 120, flex: 1 },
    { field: 'details', headerName: 'Details', width: 500, flex: 3 },
  ];

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
