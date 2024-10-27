import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const DataGridTable = ({
  columns,
  rows,
  loading,
  containerHeight = 400,
  pageSize = 5,
  handleRowClick,
  hideFooter = false,
  disableSelectionOnClick = true,
}) => {
  return (
    <div style={{ height: containerHeight, width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 20]}
        loading={loading}
        onRowClick={handleRowClick}
        hideFooter={hideFooter}
        disableSelectionOnClick={disableSelectionOnClick}
      />
    </div>
  );
};

export default DataGridTable;
