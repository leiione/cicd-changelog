import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { queueTicketColumns } from "../../../TicketConstants"

const TicketQueueTable = () => {    
    return (
        <div>
            <DataGrid
                sx={{ height: 400, maxHeight: 400 }}
                density="compact"
                rowHeight={30}
                rows={[]}
                columns={queueTicketColumns}
                pageSizeOptions={[10, 25, 50, 100, 250, 500, 1000, 5000, 10000]}
                initialState={{
                    pagination: {
                        paginationModel: {
                        pageSize: 10,
                        },
                    },
                }}
            />
        </div>
    );
};

export default TicketQueueTable;