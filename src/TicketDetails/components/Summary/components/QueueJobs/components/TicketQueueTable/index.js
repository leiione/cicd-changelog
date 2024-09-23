import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@apollo/client";
import { checkIfCacheExists } from "config/apollo";
import { queueTicketColumns } from "../../../TicketConstants"
import { GET_QUEUED_JOBS } from "TicketDetails/TicketGraphQL";

const TicketQueueTable = (props) => {
    const { custId, radiusMile } = props
    const {
        loading,
        error,
        data,
        client,
      } = useQuery(GET_QUEUED_JOBS, {
        variables: { custId, radiusMile },
        fetchPolicy: "cache-and-network"
      });
      const cacheExists = checkIfCacheExists(client, {
        query: GET_QUEUED_JOBS,
        variables: { custId, radiusMile },
      });

      let getQueuedJobs = []
      if (!loading && !error && cacheExists) {
        getQueuedJobs = data;
      }
    return (
        <div>
            <DataGrid
                sx={{ height: 400, maxHeight: 400 }}
                density="compact"
                rowHeight={30}
                rows={getQueuedJobs}
                columns={queueTicketColumns}
                pageSizeOptions={[10, 25, 50, 100, 250, 500, 1000, 5000, 10000]}
                initialState={{
                    pagination: {
                        paginationModel: {
                        pageSize: 10,
                        },
                    },
                }}
                loading={loading}
            />
        </div>
    );
};

export default TicketQueueTable;