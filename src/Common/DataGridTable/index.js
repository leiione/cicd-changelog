import React, { useState } from 'react';
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
  tableOptions,
  handleRowClick,
  containerHeight,
  setSort,
  actionColumn,
  onCellClick,
  disableRowSelectionOnClick = false
}) => {
  const apiRef = useGridApiRef();
  const [forceLoading, setForceLoading] = useState(false); // result from table built-in function wont show

  let dgColumns = React.useMemo(() => getDataGridColumns({
    columns, loading, fullWidth, enableInlineEditing, handleUpdateCell, ispTimeZone, currency, tableOptions
  }), [columns, currency, enableInlineEditing, fullWidth, handleUpdateCell, ispTimeZone, loading, tableOptions]);
  
  // In the DataGridTable component
const handleCellClick = debounce((params, event) => {
  event.stopPropagation();
  preventEvent(event)
  if (!loading && params.field !== "actions") {
    if (event.detail === 2) {
      // Only set row selection if double-clicking and handleRowClick exists
      if (handleRowClick) {
        apiRef.current.setRowSelectionModel([params.id])
        const filteredRows = gridFilteredSortedRowIdsSelector(apiRef)
        handleRowClick(event, params, null, filteredRows)
      }
    } else if (event.detail === 1 && params.isEditable && enableInlineEditing) {
      apiRef.current.startCellEditMode({ id: params.id, field: params.field })
    } else if (handleRowClick) {
      // Only set row selection if handleRowClick exists
      apiRef.current.setRowSelectionModel([params.id])
      const filteredRows = gridFilteredSortedRowIdsSelector(apiRef)
      handleRowClick(event, params, null, filteredRows)
    }
  }
}, enableInlineEditing ? 200 : 0);

  const onSortModelChange = async (model) => {
    setForceLoading(true)
    if (setSort) {
      await setSort(model.length > 0 ? { order: model[0].sort, field: model[0].field } : null)
    }
    setForceLoading(false)
  }

  if (actionColumn) {
    if (Array.isArray(actionColumn)) {
      dgColumns = [...actionColumn, ...dgColumns]
    } else {
      dgColumns.unshift(actionColumn)
    }
  }

  let { dataGridProps } = React.useMemo(() => getDataGridCustomProps({ handleRowClick, handleCellClick }), [
    handleRowClick, handleCellClick
  ])

  const loadingRows = React.useMemo(() => getSkeletonLoaderRows({ containerHeight }), [containerHeight])

  return (
    <div className='h-100 w-100'>
      <DataGridPro
        apiRef={apiRef}
        columns={dgColumns}
        rows={loading || forceLoading ? loadingRows : rows}
        rowHeight={26}
        columnHeaderHeight={26}
        rowSelectionModel={selectedRow}
        pagination={!hideFooter}
        disableColumnMenu
        isCellEditable={() => enableInlineEditing}
        handleUpdateCell={handleUpdateCell}
        hideFooterSelectedRowCount
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        onCellClick={onCellClick} // Add this prop
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
        onSortModelChange={onSortModelChange}
        hideFooter={hideFooter}
        {...dataGridProps}
      />
    </div>
  );
};

export default React.memo(DataGridTable);
