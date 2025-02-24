import React from 'react';
import { DataGridPro, gridFilteredSortedRowIdsSelector, useGridApiRef } from '@mui/x-data-grid-pro';
import { getDataGridColumns } from './utils/getDataGridColumns';
import { getSkeletonLoaderRows } from './utils/getSkeletonLoaderRows';
import { getDataGridCustomProps } from './utils/getDataGridCustomProps';
import { debounce } from 'lodash';
import { preventEvent } from 'Common/helper';
import TablePagination from './components/TablePagination';

const NoData = ({ customEmptyMsg }) => {
  return (
    <div className="text-center p-5">
      {customEmptyMsg ? customEmptyMsg : "No Data Available..."}
    </div>
  )
}

const DataGridTable = ({
  columns,
  rows,
  loading,
  hideFooter = false,
  fullWidth = true,
  selectedRow,
  enableInlineEditing,
  handleUpdateCell,
  ispTimeZone,
  currency = '$',
  customEmptyMsg,
  handleRowClick,
  containerHeight
}) => {
  const apiRef = useGridApiRef();
  const dgColumn = React.useMemo(() => getDataGridColumns({
    columns, loading, fullWidth, enableInlineEditing, handleUpdateCell, ispTimeZone, currency
  }), [columns, currency, enableInlineEditing, fullWidth, handleUpdateCell, ispTimeZone, loading]);

  const handleCellClick = debounce((params, event) => {
    event.stopPropagation();
    preventEvent(event)
    if (!loading && params.field !== "actions") {
      if (event.detail === 2) {
        apiRef.current.setRowSelectionModel([params.id])
        const filteredRows = gridFilteredSortedRowIdsSelector(apiRef)
        handleRowClick(event, params, null, filteredRows)
      } else if (event.detail === 1 && params.isEditable && enableInlineEditing) {
        apiRef.current.startCellEditMode({ id: params.id, field: params.field })
      } else {
        apiRef.current.setRowSelectionModel([params.id])
        const filteredRows = gridFilteredSortedRowIdsSelector(apiRef)
        handleRowClick(event, params, null, filteredRows)
      }
    }
  }, enableInlineEditing ? 200 : 0);

  let { dataGridProps } = React.useMemo(() => getDataGridCustomProps({ handleRowClick, handleCellClick }), [
    handleRowClick, handleCellClick
  ])
  const loadingRows = React.useMemo(() => getSkeletonLoaderRows({ containerHeight }), [containerHeight])

  return (
    <div className='h-100 w-100'>
      <DataGridPro
        apiRef={apiRef}
        columns={dgColumn}
        rows={loading ? loadingRows : rows}
        rowHeight={26}
        columnHeaderHeight={26}
        rowSelectionModel={selectedRow}
        pagination={!hideFooter}
        disableColumnMenu
        isCellEditable={() => enableInlineEditing}
        handleUpdateCell={handleUpdateCell}
        hideFooterSelectedRowCount
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        slots={{
          pagination: TablePagination,
          noRowsOverlay: NoData,
        }}
        slotProps={{
          pagination: { count: rows.length },
          noRowsOverlay: { customEmptyMsg },
        }}
        hideFooter={hideFooter}
        {...dataGridProps}
      />
    </div>
  );
};

export default DataGridTable;
