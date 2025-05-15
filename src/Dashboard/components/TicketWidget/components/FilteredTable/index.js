import { makeStyles } from '@mui/styles';
import DataGridTable from 'Common/DataGridTable';
import Loader from 'components/Loader';
import React, { useMemo, useRef, useEffect } from 'react'
import ServerSidePagination from 'Common/DataGridTable/components/ServerSidePagination';
import { HeaderCheckbox, RowCheckbox } from './components/TableActionRenderer';
import { getTicketsColumns, MenuHeaderIcon } from 'Dashboard/components/TicketsTable/ticketsColumns';
import RowActions from 'Dashboard/components/TicketsTable/components/RowActions';
import ErrorPage from 'components/ErrorPage';
import { useDispatch } from 'react-redux';
import { setContentDrawer } from 'config/store';
import { useSelector } from 'react-redux';
import { processTicketDates, clearDateFormatCache } from '../../../TicketsTable/utils/dateUtils';

const useStyles = makeStyles({
  tableContainer: {
    height: "calc(-151px + 50vh)",
    padding: "0px 10px"
  }
});

const FilteredTable = (props) => {
  const ref = useRef(null);
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    error,
    page,
    setPage,
    setSort,
    tickets,
    totalRecords,
    loading,
    checkedRows,
    setCheckedRows,
    hasUnmetReqIds,
    setHasUnmetReqIds,
    tableOptions,
    widgetId,
    widgetItems,
    widgetVariables,
    setWidgetIncludeDeleted,
    widgetIncludeDeleted,
    handleOpenTicket
  } = props;

  const contentDrawer = useSelector(state => state.contentDrawer);
  const selectedRow = React.useMemo(() => (contentDrawer.id ? contentDrawer.id : []), [
    contentDrawer
  ]);

  const getActionColumn = () => ([
    {
      field: 'actions',
      type: 'actions',
      minWidth: 40,
      width: 40,
      resizable: false,
      editable: false,
      disableExport: true,
      disableReorder: true,
      renderHeader: (_) => (
        <MenuHeaderIcon
          widgetItems={widgetItems}
          widgetId={widgetId}
          widgetVariables={widgetVariables}
          setWidgetIncludeDeleted={setWidgetIncludeDeleted}
          widgetIncludeDeleted={widgetIncludeDeleted}
        />
      ),
      getActions: (params) => {
        return ([
          <RowActions params={params}/>
        ])
      }
    },
    {
      field: "checkActions",
      disableExport: true,
      disableReorder: true,
      sortable: false,
      resizable: false,
      width: 37,
      minWidth: 37,
      renderHeader: (params) => (
        <HeaderCheckbox
          checkedRows={checkedRows}
          setCheckedRows={setCheckedRows}
          loading={loading}
          pageLimit={page.limit}
          hasUnmetReqIds={hasUnmetReqIds}
          setHasUnmetReqIds={setHasUnmetReqIds}
        />
      ),
      renderCell: (params) => (
        <RowCheckbox
          checkedRows={checkedRows}
          setCheckedRows={setCheckedRows}
          rowData={params.row}
          hasUnmetReqIds={hasUnmetReqIds}
          setHasUnmetReqIds={setHasUnmetReqIds}
        />
      )
    }
  ])

  // Handle when a row is clicked
  const handleRowClick = (event, params) => {
    handleOpenTicket({...params.row, disableCRMDrawertoggleButton: true});
    dispatch(setContentDrawer({
      open: true,
      component: 'ticket',
      description: params.row.description,
      id: params.row.id,
      ticket_id: params.row.id,
    }));
  };
  
  let ticketsColumns = useMemo(() => getTicketsColumns(2), []);
  ticketsColumns = ticketsColumns.filter(col => col.field !== 'rowActions')

  // Process tickets data with memoization to avoid redundant processing
  const processedTickets = useMemo(() => {
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return [];
    }
    // Process ticket data with optimized date formatting
    return processTicketDates(tickets);
  }, [tickets]);

  // Clean up the date format cache when component unmounts
  useEffect(() => {
    return () => {
      clearDateFormatCache();
    };
  }, []);

  if (error) return <ErrorPage error={error} />;

  return (
    <>
      <div
        ref={ref}
        className={classes.tableContainer}
      >
        <React.Suspense fallback={<Loader />}>
          <DataGridTable
            containerHeight={ref.current ? ref.current.clientHeight : 300}
            rows={processedTickets}
            columns={ticketsColumns}
            loading={loading}
            actionColumn={getActionColumn()}
            hideFooter
            setSort={setSort}
            tableOptions={tableOptions}
            handleRowClick={handleRowClick}
            selectedRow={selectedRow}
          />
        </React.Suspense>
      </div>
      <div style={{ width: "100%", padding: "0px 10px" }}>
        <ServerSidePagination
          count={tickets.length === 0 && !loading ? 0 : totalRecords}
          page={page}
          setPage={setPage}
        />
      </div>
    </>
  )
} 

export default React.memo(FilteredTable)