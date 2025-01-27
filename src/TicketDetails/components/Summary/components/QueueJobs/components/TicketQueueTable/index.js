import React, { useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import { checkIfCacheExists } from "config/apollo";
import { queueTicketColumns } from "../../../TicketConstants"
import { GET_QUEUED_JOBS } from "TicketDetails/TicketGraphQL";
import DataGridTable from "Common/DataGridTable";
import { makeStyles } from "@mui/styles";
import { Loader } from "react-bootstrap-typeahead";
import { filter } from "lodash";

const useStyles = makeStyles({
  tableHeightWrapper: {
    height: 500,
  },
});

const TicketQueueTable = (props) => {
  const classes = useStyles();
  const ref = useRef(null);
  const { ticket, radius = 3, handleOpenTicket } = props
  const [selectedRow, setSelectedRow] = useState([])

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
    getQueuedJobs = filter(data.queuedJobs, (job) => job.ticket_id !== ticket.ticket_id);
  }

  const handleCellClick = (event, params) => {
    setSelectedRow([params.id])
    handleOpenTicket(params.row, 'docked', ticket);
  };

  return (
     <div className={classes.tableHeightWrapper}>
      <React.Suspense fallback={<Loader />}>
        <DataGridTable
          containerHeight={ref.current ? ref.current.clientHeight : 300}
          rows={getQueuedJobs}
          columns={queueTicketColumns}
          loading={loading}
          handleRowClick={handleCellClick}
          selectedRow={selectedRow}
        />
      </React.Suspense>
      </div>
  );
};

export default TicketQueueTable;