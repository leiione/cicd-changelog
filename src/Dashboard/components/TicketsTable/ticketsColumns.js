/**
 * Defines column definitions for the Tickets Table to optimize memory usage
 */
import React, { useState, useCallback, useEffect } from 'react';
import RowActions from './components/RowActions';
import MenuIcon from '@mui/icons-material/Menu';
import { Menu, MenuItem, Checkbox, FormControlLabel, ListItemText, CircularProgress } from '@mui/material';
import ColumnChooser from './components/ColumnChooser';
import { useSelector } from 'react-redux';
import { useLazyQuery } from '@apollo/client';
import { GET_ISP_TICKETS } from 'Dashboard/DashboardGraphQL';
import { setDashboardCards, showSnackbar } from 'config/store';
import { useDispatch } from 'react-redux';
import { get } from 'lodash';

// Icon component to use in header with dropdown menu
export const MenuHeaderIcon = ({ widgetId, widgetItems, widgetVariables = {}, setWidgetIncludeDeleted, widgetIncludeDeleted }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [columnChooserOpen, setColumnChooserOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [exportingCsv, setExportingCsv] = useState(false);
  // Initialize includeDeletedSubscribers from localStorage with a default of false
  const [includeDeletedSubscribers, setIncludeDeletedSubscribers] = useState(() => {
    const savedValue = localStorage.getItem('ticketsTableIncludeDeletedSubscribers');
    if (savedValue !== null) {
      return JSON.parse(savedValue);
    }
    return false;
  });

  // Get filter states from Redux for CSV export
  const ticketPrefs = useSelector(state => state.ticketTablePreferences || {});
  const technicianId = ticketPrefs.technicianId;
  const statusFilter = ticketPrefs.statusFilter || [];
  const priorityFilter = ticketPrefs.priorityFilter || [];
  const schedulingFilter = ticketPrefs.schedulingFilter || [];
  const dateRange = ticketPrefs.dateRange || { startDate: null, endDate: null };
  const widgetData = widgetId && widgetItems ? widgetItems.find(item => item.i === widgetId) : null;
  
  // Setup lazy query for CSV export
  const [getTicketsForExport] = useLazyQuery(GET_ISP_TICKETS, {
    fetchPolicy: 'network-only', // Always fetch fresh data
    onError: (error) => {
      dispatch(showSnackbar({ message: "Something went wrong while exporting tickets", severity: "error" }))
    }
  });
  
  // Apollo client for direct query operations
  // We already have a client from useApolloClient
  
  // Initialize columns data once when component mounts
  useEffect(() => {
    // Get all available columns
    const columns = getTicketsColumns();
    setAllColumns(columns);

    // Initialize with all columns visible except rowActions
    const defaultVisibleColumns = columns
      .filter(col => col.defaultCol)
      .map(col => col.field);
    const storedColumns = localStorage.getItem('ticketsTableColumns');
    if (widgetItems) {
      const widgetColumns = widgetData?.tableState?.columnOrder;
      setVisibleColumns(widgetColumns || defaultVisibleColumns);
    } else if (storedColumns) { // Check if we have stored preferences
      try {
        const parsed = JSON.parse(storedColumns);
        setVisibleColumns(parsed);
      } catch (e) {
        console.error('Error parsing stored column preferences:', e);
        setVisibleColumns(defaultVisibleColumns);
      }
    } else {
      setVisibleColumns(defaultVisibleColumns);
    }
    
    // Set up a listener for column visibility changes from local storage
    const handleStorageChange = (e) => {
      if (e.key === 'ticketsTableColumns') {
        try {
          const newColumns = JSON.parse(e.newValue);
          if (Array.isArray(newColumns) && newColumns.length > 0) {
            setVisibleColumns(newColumns);
          }
        } catch (error) {
          console.error('Error parsing columns from storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [widgetData, widgetItems]);
  
  // Update column visibility in parent table component and save to localStorage
  const updateVisibleColumns = useCallback((columns) => {
    // First update our local state
    setVisibleColumns(columns);
    
    if (widgetId) {
      dispatch(setDashboardCards({
        items: widgetItems.map(widget =>
          widget.i === widgetId ? { ...widget, tableState: { ...widget.tableState, columnOrder: columns } } : widget
        ),
        // nextId
      }));
    } else {
      localStorage.setItem('ticketsTableColumns', JSON.stringify(columns));
    
      // Dispatch event to notify the table component
      const event = new CustomEvent('ticketsTableColumnsChanged', {
        detail: { columns }
      });
      window.dispatchEvent(event);
    }
  }, [dispatch, widgetId, widgetItems]);
  
  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChooseColumns = () => {
    setColumnChooserOpen(true);
    handleClose();
  };

  const handleColumnChooserClose = () => {
    setColumnChooserOpen(false);
  };
  
  const handleApplyColumns = (selectedColumns) => {
    updateVisibleColumns(selectedColumns);
  };
  
  const handleResetColumns = () => {
    // Reset to current selection (no change)
  };
  
  const handleRestoreDefaultColumns = (defaultColumns) => {
    updateVisibleColumns(defaultColumns);
  };

  // Export tickets data to CSV using the same GraphQL endpoint as the table
  const handleExportCSV = () => {
    setExportingCsv(true);
    
    // Prepare query variables using Redux state
    let variables = {
      page: 0,
      pageSize: 5000, // Get maximum allowed records
      sortField: 'ticket_id',
      sortOrder: 'desc',
      flag_subscriber_deleted: includeDeletedSubscribers, // Include deleted subscribers based on checkbox state
    };
    
    // Add filters to query variables if they are set (use the same filters as the table)
    if (technicianId !== null) {
      variables.technicianId = [parseInt(technicianId, 10)];
    }
    
    if (statusFilter && statusFilter.length > 0) {
      variables.status = statusFilter;
    }
    
    if (priorityFilter && priorityFilter.length > 0) {
      variables.priority = priorityFilter;
    }
    
    if (schedulingFilter && schedulingFilter.length > 0) {
      variables.scheduled = schedulingFilter;
    }
    
    if (dateRange.startDate || dateRange.endDate) {
      variables.dateRange = dateRange;
    }

    if (widgetId) {
      variables = {
        ...widgetVariables,
        page: 0,
        pageSize: 5000, // Get maximum allowed records
        sortField: 'ticket_id',
        sortOrder: 'desc',
      }
    }
    
    // Execute the query
    getTicketsForExport({ variables }).then((response) => {
      const rows = response?.data?.getISPTickets?.tickets || [];
      let data = []
      const selectedColumns = visibleColumns && visibleColumns.length > 0 ? allColumns.filter(col => visibleColumns.includes(col.field)) : allColumns;
      rows.forEach(row => {
        let newRow = {}
        selectedColumns.forEach(column => {
          const cellData = get(row, column.path || column.field, '')
          newRow[column.field] = cellData
        })
        data.push(newRow)
      })

      // Filter columns that are not exportable
      const exportableColumns = selectedColumns.filter(col => !col.disableExport);
      
      // Extract headers and corresponding field names
      const headers = exportableColumns.map(col => col.field);
      const headerRow = exportableColumns.map(col => col.headerName).join(",");

      // Convert data to CSV format
      const csvRows = [
        headerRow, // Header row
        ...data.map(row =>
          headers
            .map(field => JSON.stringify(row[field] ?? "")) // Handle missing values
            .join(",")
        ),
      ].join("\n");
      
      setExportingCsv(false)
      const title = widgetData ? `Tickets (${widgetData?.title})` : 'Tickets'
      // Create Blob and trigger download
      const blob = new Blob([csvRows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    }).catch(error => {
      dispatch(showSnackbar({ message: "Something went wrong while exporting tickets", severity: "error" }))
    });
  };
  

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div onClick={handleClick} style={{ cursor: 'pointer' }}>
        <MenuIcon fontSize="small" />
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleChooseColumns}>
          <ListItemText>Choose Columns</ListItemText>
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={setWidgetIncludeDeleted ? widgetIncludeDeleted : includeDeletedSubscribers}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (setWidgetIncludeDeleted) {
                    setWidgetIncludeDeleted(isChecked);
                  } else {
                    setIncludeDeletedSubscribers(isChecked);
                    // Save to localStorage for persistence
                    localStorage.setItem('ticketsTableIncludeDeletedSubscribers', JSON.stringify(isChecked));
                    // Create a custom event to notify the table component
                    const event = new CustomEvent('ticketsTableFlagSubscriberDeletedChanged', {
                      detail: { flag_subscriber_deleted: isChecked }
                    });
                    window.dispatchEvent(event);
                  }
                  
                  e.stopPropagation();
                }}
              />
            }
            label="Include Ticket of Deleted Subscribers"
            onClick={(e) => e.stopPropagation()}
          />
        </MenuItem>
        <MenuItem onClick={handleExportCSV} disabled={exportingCsv}>
          {exportingCsv ? (
            <>
              <CircularProgress size={20} style={{ marginRight: 10 }} />
              <ListItemText>Exporting...</ListItemText>
            </>
          ) : (
            <ListItemText>Export CSV</ListItemText>
          )}
        </MenuItem>
      </Menu>
      
      {/* Column Chooser Dialog */}
      {columnChooserOpen && <ColumnChooser
        tableName={widgetId || 'mainTable'}
        open={columnChooserOpen}
        columns={allColumns}
        selectedColumns={visibleColumns}
        onClose={handleColumnChooserClose}
        onApply={handleApplyColumns}
        onReset={handleResetColumns}
        onRestoreDefaults={handleRestoreDefaultColumns}
      />}
    </div>
  );
};

/**
 * Filter column definitions based on visible columns
 * @param {Array} columns - All column definitions
 * @param {Array} visibleColumns - Array of visible column field names
 * @returns {Array} Filtered column configuration objects
 */
export const getVisibleColumns = (columns, visibleColumns) => {
  // Always include rowActions column
  return columns.filter(col => 
    col.field === 'rowActions' || visibleColumns.includes(col.field)
  );
};

/**
 * Returns all column definitions for the Tickets Table
 * 
 * @returns {Array} Array of column configuration objects
 */
export const getTicketsColumns = (size = 1) => [
  { 
    field: 'rowActions', // Keep using 'rowActions' to avoid DataGridTable special handling
    headerName: '',
    renderHeader: () => <MenuHeaderIcon />,
    width: 80 / size,
    minWidth: 80 / size,
    flex: 0,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    disableExport: true,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => <RowActions params={params} />
  },
  { 
    field: 'ticket_id', 
    headerName: 'Ticket ID', 
    minWidth: 120 / size,
    flex: 0.5,
    sortable: true,
    resizable: true,
    defaultCol: true,
  },
  { 
    field: 'summary', 
    headerName: 'Summary', 
    minWidth: 200 / size,
    flex: 1,
    sortable: true,
    resizable: true,
    defaultCol: true
  },
  { 
    field: 'priority', 
    headerName: 'Priority', 
    minWidth: 120 / size,
    flex: 0.5,
    sortable: true,
    resizable: true,
    defaultCol: true
  },
  { 
    field: 'technician_name', 
    headerName: 'Assigned Appuser', 
    minWidth: 170 / size,
    flex: 0.7,
    sortable: true,
    resizable: true
  },
  { 
    field: 'assigned_name', 
    headerName: 'Assigned Name', 
    minWidth: 170 / size,
    flex: 0.7,
    sortable: true,
    resizable: true
  },
  { 
    field: 'address', 
    headerName: 'Address', 
    minWidth: 250 / size,
    flex: 1,
    sortable: true,
    resizable: true
  },
  { 
    field: 'category_type', 
    headerName: 'Assignment Type', 
    minWidth: 130 / size,
    flex: 0.6,
    sortable: true,
    resizable: true
  },
  { 
    field: 'date_added', 
    headerName: 'Date Added', 
    minWidth: 170 / size,
    flex: 0.8,
    sortable: true,
    resizable: true,
    dataType: 'dateTime'
  },
  { 
    field: 'phone', 
    headerName: 'Phone', 
    minWidth: 130 / size,
    flex: 0.6,
    sortable: true,
    resizable: true
  },
  { 
    field: 'subscriber_main_company', 
    headerName: 'Main Company', 
    minWidth: 130 / size,
    flex: 0.6,
    sortable: true,
    resizable: true
  },
  { 
    field: 'last_modified', 
    headerName: 'Last Modified', 
    minWidth: 170 / size,
    flex: 0.8,
    sortable: true,
    resizable: true,
    dataType: 'dateTime'
  },
  { 
    field: 'end', 
    headerName: 'End', 
    minWidth: 120 / size,
    flex: 0.5,
    sortable: true,
    resizable: true,
    dataType: 'dateTime'
  },
  { 
    field: 'flag_serverplus', 
    headerName: 'Serverplus', 
    minWidth: 120 / size,
    flex: 0.5,
    sortable: true,
    resizable: true
  },
  { 
    field: 'start', 
    headerName: 'Start', 
    minWidth: 120 / size,
    flex: 0.5,
    sortable: true,
    resizable: true,
    dataType: 'dateTime'
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    minWidth: 120 / size,
    flex: 0.5,
    sortable: true,
    resizable: true,
    defaultCol: true
  },
  { 
    field: 'subscriber_name', 
    headerName: 'Subscriber Name', 
    minWidth: 130 / size,
    flex: 0.7,
    sortable: true,
    resizable: true
  },
  { 
    field: 'subscriber_status', 
    headerName: 'Subscriber Status', 
    minWidth: 130 / size,
    flex: 0.7,
    sortable: true,
    resizable: true
  },
  { 
    field: 'type', 
    headerName: 'Type', 
    minWidth: 150 / size,
    flex: 0.6,
    sortable: true,
    resizable: true,
    defaultCol: true
  },
  { 
    field: 'subscriber_username', 
    headerName: 'Subscriber Username', 
    minWidth: 130 / size,
    flex: 0.7,
    sortable: true,
    resizable: true
  }
];
