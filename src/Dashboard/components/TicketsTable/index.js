import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useLazyQuery, useSubscription} from '@apollo/client';
import { GET_ASSIGNEES } from 'TicketDetails/TicketGraphQL';
import DataGridTable from 'Common/DataGridTable';
import { makeStyles } from '@mui/styles';
import { Box, Select, MenuItem, Typography, IconButton, FormControl } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TableOptions from '../TableOptions';
import { useSelector, useDispatch } from 'react-redux';
import { setContentDrawer, setPageNumber, setPageSize } from '../../../config/store';
import { getTicketsColumns, getVisibleColumns } from './ticketsColumns';
import { processTicketDates, clearDateFormatCache } from './utils/dateUtils';
import { GET_ISP_TICKETS,GET_TICKET } from 'Dashboard/DashboardGraphQL';
import { TICKET_LIST_SUBSCRIPTION } from 'TicketDetails/TicketGraphQL';


// Styling with optimized containers
const useStyles = makeStyles({
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  tableContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  tableScrollContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowX: 'auto',
  },
  tableContent: {
    height: '100%',
    // Removed fixed width to let table adjust based on viewport
  },
  dataGridStyles: {
    '& .MuiDataGrid-root': {
      height: '100%',
    },
    '& .MuiDataGrid-virtualScroller': {
      overflowY: 'auto !important', // Keep vertical scrolling
    },
    // Hide pagination elements since we'll show a custom footer
    '& .MuiDataGrid-footer': {
      display: 'none',
    }
  },
  paginationContainer: {
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTop: '1px solid rgba(224, 224, 224, 1)',
  },
  paginationItem: {
    marginLeft: '8px',
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  paginationItemDropdown: {
    marginLeft: '0px',
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    width: 'auto',
    minWidth: 'unset',
    marginRight: '5px'
  },
  rowsPerPageContainer: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '16px',
  },
  rowsPerPageLabel: {
    marginRight: '5px',
  }
});

const TicketsTable = ({ hideContentDrawer, dockedItems }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  
  //const [selectedRow, setSelectedRow] = useState([]);
  const [expectedLastPage, setExpectedLastPage] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [sortModel, setSortModel] = useState({ field: 'ticket_id', order: 'desc' });
  const isp_id = useSelector(state => state.ispId)
  
  
  // Initialize includeDeletedSubscribers from localStorage with a default of false
  const [includeDeletedSubscribers, setIncludeDeletedSubscribers] = useState(() => {
    const savedValue = localStorage.getItem('ticketsTableIncludeDeletedSubscribers');
    if (savedValue !== null) {
      return JSON.parse(savedValue);
    }
    return false;
  });
  
  // Get filter states from Redux with corrected state paths
  const page = useSelector(state => state.ticketTablePreferences.pageNumber || 0);
  const pageSize = useSelector(state => state.ticketTablePreferences.pageSize || 50);
  const technicianId = useSelector(state => state.ticketTablePreferences.technicianId);
  const statusFilter = useSelector(state => state.ticketTablePreferences.statusFilter || []);
  const priorityFilter = useSelector(state => state.ticketTablePreferences.priorityFilter || []);
  const schedulingFilter = useSelector(state => state.ticketTablePreferences.schedulingFilter || []);
  const dateRange = useSelector(state => state.ticketTablePreferences.dateRange || { startDate: null, endDate: null });
  const contentDrawer = useSelector(state => state.contentDrawer);
  const selectedRow = React.useMemo(() => (contentDrawer.id ? contentDrawer.id : []), [
    contentDrawer
  ]);

  // Fetch technicians from GraphQL
  const { data: technicianData } = useQuery(GET_ASSIGNEES);
  const technicians = technicianData?.assignees || [];
  
  // Get all columns and memoize to prevent re-renders
  const allColumns = useMemo(() => getTicketsColumns(), []);
  
  // Filter columns based on visibility settings
  const filteredColumns = useMemo(() => {
    if (visibleColumns.length === 0) {
      // If no columns are explicitly selected, show all columns
      return allColumns;
    }
    return getVisibleColumns(allColumns, visibleColumns);
  }, [allColumns, visibleColumns]);
  
  // Prepare variables for GraphQL query using useMemo to prevent unnecessary re-renders
  const queryVariables = useMemo(() => {
    const variables = {
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      sortField: sortModel.field,
      sortOrder: sortModel.order,
      flag_subscriber_deleted: includeDeletedSubscribers
    };
    
    // Add filters to query variables if they are set
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
    
    return variables;
  }, [page, pageSize, technicianId, statusFilter, priorityFilter, schedulingFilter, dateRange, includeDeletedSubscribers, sortModel]);
  
  // Query for getting ISP tickets with pagination and filters
  const { loading, error, data, refetch } = useQuery(GET_ISP_TICKETS, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network', // Changed from no-cache for better memory usage
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error('Error in ISP tickets query:', error);
    }
  });

  const [getTicketDetails] = useLazyQuery(GET_TICKET, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching updated ticket details:', error);
    }
  });

  const widgetID = "mainTable"

  useSubscription(TICKET_LIST_SUBSCRIPTION, {
    variables: { isp_id: isp_id, widgetId: widgetID },
    onData: async ({ data: { data }, client }) => {
      if (data?.ticketListing) {

        const ticket_id = data.ticketListing.ticket_id;
        const isNewTicket = data.ticketListing.new_ticket === true;
        const isDeletedTicket = data.ticketListing.flag_deleted === true;
        
        // For deleted tickets, remove from the list
        if (isDeletedTicket && ticket_id) {
          // Check if the deleted ticket is in the current view
          const currentTickets = tickets || [];
          const isTicketInTable = currentTickets.some(ticket => ticket.ticket_id === ticket_id);
          
          if (isTicketInTable) {
            // Update the Apollo cache to remove the deleted ticket
            const currentData = client.readQuery({
              query: GET_ISP_TICKETS,
              variables: queryVariables
            });
            
            if (currentData?.getISPTickets?.tickets) {
              // Filter out the deleted ticket
              const updatedTickets = currentData.getISPTickets.tickets.filter(
                ticket => ticket.ticket_id !== ticket_id
              );
              
              // Update the cache with the filtered list
              client.writeQuery({
                query: GET_ISP_TICKETS,
                variables: queryVariables,
                data: {
                  getISPTickets: {
                    ...currentData.getISPTickets,
                    tickets: updatedTickets,
                    // Update total count if it exists
                    totalCount: currentData.getISPTickets.totalCount 
                      ? currentData.getISPTickets.totalCount - 1 
                      : undefined
                  }
                }
              });
              
              // To maintain pagination integrity, fetch an additional ticket to replace the deleted one
              // This ensures we still have pageSize tickets in the view
              const lastPage = Math.ceil((currentData.getISPTickets.totalCount - 1) / pageSize) - 1;
              
              // Only fetch replacement if we're not on the last page
              if (page < lastPage) {
                // Calculate the index to fetch (current page * pageSize + pageSize)
                // This gets the first item from the next page
                const fetchIndex = (page + 1) * pageSize;
                
                try {
                  // Fetch one additional ticket to maintain page size
                  const additionalResult = await client.query({
                    query: GET_ISP_TICKETS,
                    variables: {
                      ...queryVariables,
                      page: Math.floor(fetchIndex / pageSize),
                      pageSize: 1,
                      offset: fetchIndex % pageSize
                    }
                  });
                  
                  // If we got an additional ticket, add it to the current page
                  if (additionalResult?.data?.getISPTickets?.tickets?.[0]) {
                    const additionalTicket = additionalResult.data.getISPTickets.tickets[0];
                    
                    // Read the updated cache (after deletion)
                    const updatedData = client.readQuery({
                      query: GET_ISP_TICKETS,
                      variables: queryVariables
                    });
                    
                    if (updatedData?.getISPTickets?.tickets) {
                      // Add the additional ticket to the end of the current page
                      const finalTickets = [...updatedData.getISPTickets.tickets, additionalTicket];
                      
                      // Write the final list back to cache
                      client.writeQuery({
                        query: GET_ISP_TICKETS,
                        variables: queryVariables,
                        data: {
                          getISPTickets: {
                            ...updatedData.getISPTickets,
                            tickets: finalTickets
                          }
                        }
                      });
                    }
                  }
                } catch (error) {
                  console.error('Error fetching replacement ticket:', error);
                }
              }
            } else {
              // If we can't update the cache directly, refetch the data
              refetch();
            }
          }
        }
        // For new tickets, fetch and add to the list regardless of current view
        else if (isNewTicket && ticket_id) {
          // Fetch the new ticket details
          const result = await getTicketDetails({
            variables: { ticket_id: ticket_id }
          });

          if (result?.data?.getISPTickets?.tickets?.[0]) {
            // Get the new ticket data
            const newTicket = result.data.getISPTickets.tickets[0];
            
            // Update the Apollo cache to include the new ticket
            const currentData = client.readQuery({
              query: GET_ISP_TICKETS,
              variables: queryVariables
            });
            
            if (currentData?.getISPTickets?.tickets) {
              // Add the new ticket to the beginning of the list (assuming newest first)
              const updatedTickets = [
                newTicket,
                ...currentData.getISPTickets.tickets
              ];
              
              // Update the cache with the new list including the new ticket
              client.writeQuery({
                query: GET_ISP_TICKETS,
                variables: queryVariables,
                data: {
                  getISPTickets: {
                    ...currentData.getISPTickets,
                    tickets: updatedTickets,
                    // Update total count if it exists
                    totalCount: currentData.getISPTickets.totalCount 
                      ? currentData.getISPTickets.totalCount + 1 
                      : undefined
                  }
                }
              });
            } else {
              // If we can't update the cache directly, refetch the data
              refetch();
            }
          } else {
            // If we couldn't get the new ticket, refetch all data
            refetch();
          }
        } 
        // Handle updates to existing tickets
        else if (ticket_id) {
          // Check if the updated ticket is currently in our table
          const currentTickets = tickets || [];
          const isTicketInTable = currentTickets.some(ticket => ticket.ticket_id === ticket_id);
          
          if (isTicketInTable) {
            // Fetch the updated ticket details
            const result = await getTicketDetails({
              variables: { ticket_id: ticket_id }
            });

            
            if (result?.data?.getISPTickets?.tickets?.[0]) {
              // Update the Apollo cache with the new ticket data
              const updatedTicket = result.data.getISPTickets.tickets[0];
              
              // Option 1: Update the specific ticket in the cache
              const currentData = client.readQuery({
                query: GET_ISP_TICKETS,
                variables: queryVariables
              });
              
              if (currentData?.getISPTickets?.tickets) {
                const updatedTickets = currentData.getISPTickets.tickets.map(ticket => 
                  ticket.ticket_id === ticket_id ? { ...ticket, ...updatedTicket } : ticket
                );
                
                client.writeQuery({
                  query: GET_ISP_TICKETS,
                  variables: queryVariables,
                  data: {
                    getISPTickets: {
                      ...currentData.getISPTickets,
                      tickets: updatedTickets
                    }
                  }
                });
              } else {
                // If we can't update the cache directly, refetch the data
                refetch();
              }
            } else {
              // If we couldn't get the updated ticket, refetch all data
              refetch();
            }
          }
        }
      }
    },
  });

  // Apollo's useQuery hook automatically refetches when variables change
  // No manual refetch needed here - the fetchPolicy and notifyOnNetworkStatusChange settings handle this

  // Clean up the date format cache when component unmounts
  useEffect(() => {
    return () => {
      clearDateFormatCache();
    };
  }, []);
  
  // Listen for changes to the flag_subscriber_deleted parameter
  useEffect(() => {
    const handleFlagSubscriberDeletedChange = (event) => {
      const newValue = event.detail.flag_subscriber_deleted;
      
      // Update local state
      setIncludeDeletedSubscribers(newValue);
      
      // Save to localStorage for persistence
      localStorage.setItem('ticketsTableIncludeDeletedSubscribers', JSON.stringify(newValue));
      
      // Force refetch with the new parameter
      refetch({
        ...queryVariables,
        flag_subscriber_deleted: newValue
      });
    };
    
    window.addEventListener('ticketsTableFlagSubscriberDeletedChanged', handleFlagSubscriberDeletedChange);
    
    return () => {
      window.removeEventListener('ticketsTableFlagSubscriberDeletedChanged', handleFlagSubscriberDeletedChange);
    };
  }, [queryVariables, refetch]);
  


  // Initialize visible columns from localStorage
  useEffect(() => {
    const storedColumns = localStorage.getItem('ticketsTableColumns');
    if (storedColumns) {
      try {
        const parsed = JSON.parse(storedColumns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVisibleColumns(parsed);
        } else {
          // If stored data is invalid, show all columns
          const defaultColumns = allColumns
            .filter(col => col.field !== 'rowActions')
            .map(col => col.field);
          setVisibleColumns(defaultColumns);
        }
      } catch (e) {
        console.error('Error parsing stored column preferences:', e);
      }
    }
    
    // Listen for column visibility changes from the ColumnChooser
    const handleColumnsChanged = (event) => {
      if (event.detail && event.detail.columns) {
        setVisibleColumns(event.detail.columns);
      }
    };
    
    window.addEventListener('ticketsTableColumnsChanged', handleColumnsChanged);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('ticketsTableColumnsChanged', handleColumnsChanged);
    };
  }, [allColumns]);

  // Handle when a row is clicked
  const handleRowClick = (event, params) => {
    dispatch(setContentDrawer({
      open: true,
      component: 'ticket',
      description: params.row.description,
      id: params.row.id,
      ticket_id: params.row.id,
      ticket: params.row
    }));
    if (dockedItems.find(x => x.temp)) {
      hideContentDrawer()
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    // Prevent navigation to negative pages
    if (newPage < 0) return;
    
    // Prevent navigation beyond last page based on known data
    if (paginationMetadata.totalCount > 0) {
      const calculatedLastPage = Math.ceil(paginationMetadata.totalCount / pageSize) - 1;
      if (newPage > calculatedLastPage) return;
    }
    
    // If we're on the last known page and there's no next page, don't allow further navigation
    if (page === expectedLastPage && !paginationMetadata.hasNextPage && newPage > page) return;
    
    dispatch(setPageNumber(newPage));
  };

  // Handle page size change
  const handlePageSizeChange = (event) => {
    dispatch(setPageSize(parseInt(event.target.value)));
  };

  // Handle sort change
  const handleSortChange = useCallback((sortData) => {
    if (sortData) {
      setSortModel({
        field: sortData.field,
        order: sortData.order
      });
    } else {
      // Default sort if none selected
      setSortModel({
        field: 'ticket_id',
        order: 'desc'
      });
    }
  }, []);

  // Process tickets data with memoization to avoid redundant processing
  const { tickets, paginationMetadata } = useMemo(() => {
    let processedTickets = [];
    let paginationInfo = {
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false
    };
    
    if (!loading && !error && data?.getISPTickets) {
      // Process ticket data with optimized date formatting
      if (data.getISPTickets.tickets && Array.isArray(data.getISPTickets.tickets)) {
        processedTickets = processTicketDates(data.getISPTickets.tickets);
      } else {
        console.error('Unexpected data structure. Expected tickets array:', data.getISPTickets);
        
        // If no tickets array, try to extract data if possible
        if (data.getISPTickets && typeof data.getISPTickets === 'object') {
          const possibleTicketsArrays = Object.values(data.getISPTickets)
            .filter(val => Array.isArray(val) && val.length > 0);
            
          if (possibleTicketsArrays.length > 0) {
            // Use the first array property found
            processedTickets = processTicketDates(possibleTicketsArrays[0]);
          }
        }
      }
      
      // Get pagination info from the server response with better error handling
      paginationInfo = {
        totalCount: data.getISPTickets.totalCount || data.getISPTickets.filteredCount || processedTickets.length || 0,
        hasNextPage: data.getISPTickets.pageInfo?.hasNextPage || false,
        hasPreviousPage: data.getISPTickets.pageInfo?.hasPreviousPage || false,
      };
      
      // If pageInfo is not available directly, try to calculate from available data
      if (!data.getISPTickets.pageInfo) {
        const total = paginationInfo.totalCount;
        paginationInfo.hasNextPage = (page + 1) * pageSize < total;
        paginationInfo.hasPreviousPage = page > 0;
      }
    }
    
    return { tickets: processedTickets, paginationMetadata: paginationInfo };
  }, [data, loading, error, page, pageSize]);

  // Store previous pagination state for smoother transitions
  const [previousPaginationState, setPreviousPaginationState] = useState({
    totalCount: 0,
    startIndex: 0,
    endIndex: 0
  });
  
  // Update previous pagination state whenever we have valid data
  useEffect(() => {
    if (paginationMetadata.totalCount > 0) {
      const start = page * pageSize + 1;
      const end = Math.min(start + tickets.length - 1, paginationMetadata.totalCount);
      
      setPreviousPaginationState({
        totalCount: paginationMetadata.totalCount,
        startIndex: start,
        endIndex: end
      });
    }
  }, [paginationMetadata.totalCount, tickets.length, page, pageSize]);

  // Calculate and store expected last page when we have total count
  useEffect(() => {
    if (paginationMetadata.totalCount > 0 && pageSize > 0) {
      const lastPage = Math.ceil(paginationMetadata.totalCount / pageSize) - 1;
      if (lastPage !== expectedLastPage) {
        setExpectedLastPage(lastPage);
      }
    }
  }, [paginationMetadata.totalCount, pageSize, expectedLastPage]);

  if (error) {
    console.error('Error loading tickets:', error);
    return (
      <div className={classes.container}>
        <p>Error loading tickets: {error.message}</p>
      </div>
    );
  }

  // Calculate pagination display details - modified to maintain state during loading
  let startIndex, endIndex, totalCount;
  
  if (loading) {
    if (previousPaginationState.totalCount > 0) {
      // Use previous state during loading to avoid showing "0-0 of 0"
      const expectedStart = (page * pageSize) + 1;
      const expectedEnd = Math.min(expectedStart + pageSize - 1, previousPaginationState.totalCount);
      
      startIndex = expectedStart;
      endIndex = expectedEnd;
      totalCount = previousPaginationState.totalCount;
    } else {
      // For initial load, show a placeholder that indicates loading
      startIndex = (page * pageSize) + 1;
      endIndex = startIndex + pageSize - 1;
      totalCount = "..."; // Use ellipsis to indicate loading
    }
  } else {
    // Use current data when not loading
    if (paginationMetadata.totalCount === 0 || tickets.length === 0) {
      // When there are no tickets, display 0-0 of 0
      startIndex = 0;
      endIndex = 0;
    } else {
      // Normal case with tickets
      startIndex = page * pageSize + 1;
      endIndex = Math.min(startIndex + tickets.length - 1, paginationMetadata.totalCount);
    }
    totalCount = paginationMetadata.totalCount;
  }

  const isFirstPage = page === 0;
  // Only consider it the last page if we're not loading AND we know there's no next page
  const isLastPage = !loading ? !paginationMetadata.hasNextPage : false;

  return (
    <div className={classes.container}>
      {/* Table Options with filters */}
      <TableOptions 
        appuserTechnicians={technicians} 
        loading={loading}
      />
      
      {/* Table with virtualization */}
      <div className={classes.tableContainer}>
        <div className={classes.tableScrollContainer}>
            <div className={`${classes.tableContent} ${classes.dataGridStyles}`}>
              <DataGridTable
                rows={tickets}
                columns={filteredColumns}
                loading={loading}
                handleRowClick={handleRowClick}
                selectedRow={selectedRow}
                pageSize={pageSize}
                page={page}
                rowsPerPageOptions={[5, 10, 25, 50]}
                disableSelectionOnClick={false}
                autoHeight={false}
                hideFooter={true}
                containerHeight={window.innerHeight * 0.7} // Provide containerHeight for better skeleton loading
                // MUI-X DataGrid optimization props
                columnVisibilityModel={{}} // Column visibility managed by our custom chooser
                rowSelection // Enable row selection for click handling
                density="compact" // Compact rows for better performance
                disableColumnFilter // Disable built-in filtering to use custom filters
                disableColumnMenu={false} // Enable menu for sorting options
                disableVirtualization={false} // Enable virtualization
                setSort={handleSortChange}
                initialState={{
                  sorting: {
                    sortModel: [{ field: sortModel.field, sort: sortModel.order }],
                  },
                }}
              />
            </div>
          </div>
      </div>

      {/* MUI-styled pagination footer (always visible) */}
      <Box className={classes.paginationContainer}>
        <Box display="flex" alignItems="center" marginRight="16px">
          <Typography variant="body2" style={{ display: 'flex', alignItems: 'center' }} className={classes.rowsPerPageLabel}>
            Rows per page:
          </Typography>
          <FormControl className={classes.select} size="small" variant="standard">
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              disableUnderline
              style={{ marginTop: '4px' }}
            >
              {[5, 10, 25, 50].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box className={classes.paginationItem}>
          <Typography variant="body2">
            {`${startIndex}-${endIndex} of ${totalCount}`}
          </Typography>
        </Box>
        
        <Box className={classes.paginationItem}>
          <IconButton 
            onClick={() => handlePageChange(page - 1)} 
            disabled={isFirstPage}
            size="small"
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          
          <IconButton 
            onClick={() => handlePageChange(page + 1)} 
            disabled={isLastPage}
            size="small"
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </Box>
      </Box>
    </div>
  );
};

export default React.memo(TicketsTable); // Use memo to prevent unnecessary re-renders
