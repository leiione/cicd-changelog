import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@apollo/client";
import { checkIfCacheExists } from "config/apollo";
import { queueTicketColumns } from "../../../TicketConstants"
import { GET_QUEUED_JOBS } from "TicketDetails/TicketGraphQL";

const TicketQueueTable = (props) => {
  const { ticket, radius = 3 } = props
  const isSubscriber = ticket.category_type === "SUBSCRIBER";
  let variables = { radius_mile: radius };
  if (isSubscriber) {
    variables = { ...variables, cust_id: ticket.subscriber.customer_id };
  } else if (ticket.location_id > 0) {
    variables = { ...variables, location_id: ticket.location_id };
  } else if (ticket.equipment_id > 0) {
    variables = { ...variables, equipment_id: ticket.equipment_id };
  }
  const { loading, error, data, client } = useQuery(GET_QUEUED_JOBS, {
    variables,
    fetchPolicy: "cache-and-network"
  });
  const cacheExists = checkIfCacheExists(client, {
    query: GET_QUEUED_JOBS,
    variables,
  });

  let getQueuedJobs = []
  if (!loading && !error && cacheExists) {
    getQueuedJobs = data.queuedJobs;
  }
  return (
    <div>
      <DataGrid
        sx={{ height: 400, maxHeight: 400 }}
        density="compact"
        rowHeight={30}
        rows={getQueuedJobs}
        columns={queueTicketColumns}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        loading={loading}
      />
    </div>
  );
};

export default TicketQueueTable;