import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import AddFilter from './components/AddFilter';
import { getFilterTableVariables } from 'Dashboard/commonUtils';
import { setDashboardCards } from 'config/store';
import RemoveWidgetDialog from './components/RemoveWidgetDialog';
import FilteredTable from './components/FilteredTable';
import BulkActionButton from './components/BulkActionButton';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_FILTERED_TICKETS } from 'Dashboard/DashboardGraphQL';
import { checkIfCacheExists } from 'config/apollo';
import { useSelector } from 'react-redux';
import { TICKET_LIST_SUBSCRIPTION } from 'TicketDetails/TicketGraphQL';


const TicketWidget = (props) => {
  const dispatch = useDispatch();
  const { item, items, index, nextId, onRemoveItem, hideContentDrawer, dockedItems } = props;

  const [editingItemId, setEditingItemId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [openPrompt, setOpenPrompt] = useState(false);
  const isp_id = useSelector(state => state.ispId)


  const [page, setPage] = useState({ offset: 0, page: 0, limit: 25 });
  const [sort, setSort] = useState({ order: 'desc', field: 'ticket_id' });
  const [totalRecords, setTotalRecords] = useState(0);
  const [checkedRows, setCheckedRows] = useState([])
  const widgetIncludeDeleted = item.flag_subscriber_deleted;

  const [hasUnmetReqIds, setHasUnmetReqIds] = useState({ blockedResolve: [], blockedClosed: [] })

  const variables = {
    page: page.page,
    pageSize: page.limit,
    sortField: sort?.field || 'ticket_id',
    sortOrder: sort?.order || 'desc',
    flag_subscriber_deleted: widgetIncludeDeleted
  }

  if (item.filters && item.filters.length > 0) {
    getFilterTableVariables(variables, item.filters);
  }

  const { loading, error, data, client, refetch } = useQuery(GET_FILTERED_TICKETS, {
    variables,
    fetchPolicy: 'cache-and-network'
  });

  const cacheExists = checkIfCacheExists(client, { query: GET_FILTERED_TICKETS, variables })

  const tickets = data?.getISPTickets?.tickets || [];

  // Use React.useMemo to create a stable widget ID that won't change on rerenders
  const widgetId = React.useMemo(() => {
    return item.id || `widget_${index}_${item.title?.replace(/\s+/g, '_')}`;
  }, [item.id, index, item.title]); // Only recalculate if these dependencies change

  

  useSubscription(TICKET_LIST_SUBSCRIPTION, {
    variables: { isp_id: isp_id, widgetId: widgetId },
    onData: async ({ data: { data }, client }) => {

      if (data?.ticketListing) {


       
        if (data.ticketListing.requestBody && data.ticketListing.requestBody.widgetId !== widgetId) {
          return; // Skip processing if not for this widget
        }

        const ticket_id = data.ticketListing.ticket_id;
        const isNewTicket = data.ticketListing.new_ticket === true;
        const isDeletedTicket = data.ticketListing.flag_deleted === true;

        // Handle deleted tickets
        if (isDeletedTicket && ticket_id) {
          // Check if the deleted ticket is in our widget
          const currentTickets = tickets || [];
          const isTicketInTable = currentTickets.some(ticket => ticket.ticket_id === ticket_id);

          if (isTicketInTable) {

            // Update the Apollo cache to remove the deleted ticket
            const currentData = client.readQuery({
              query: GET_FILTERED_TICKETS,
              variables: variables
            });

            if (currentData?.getISPTickets?.tickets) {
              // Filter out the deleted ticket
              const updatedTickets = currentData.getISPTickets.tickets.filter(
                ticket => ticket.ticket_id !== ticket_id
              );

              // Update the cache with the filtered list
              client.writeQuery({
                query: GET_FILTERED_TICKETS,
                variables: variables,
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
              const lastPage = Math.ceil((currentData.getISPTickets.totalCount - 1) / page.limit) - 1;

              // Only fetch replacement if we're not on the last page
              if (page.page < lastPage) {
                // Calculate the index to fetch (current page * pageSize + pageSize)
                // This gets the first item from the next page
                const fetchIndex = (page.page + 1) * page.limit;

                try {
                  // Fetch one additional ticket to maintain page size
                  const additionalResult = await client.query({
                    query: GET_FILTERED_TICKETS,
                    variables: {
                      ...variables,
                      page: Math.floor(fetchIndex / page.limit),
                      pageSize: 1,
                      offset: fetchIndex % page.limit
                    }
                  });

                  // If we got an additional ticket, add it to the current page
                  if (additionalResult?.data?.getISPTickets?.tickets?.[0]) {
                    const additionalTicket = additionalResult.data.getISPTickets.tickets[0];

                    // Read the updated cache (after deletion)
                    const updatedData = client.readQuery({
                      query: GET_FILTERED_TICKETS,
                      variables: variables
                    });

                    if (updatedData?.getISPTickets?.tickets) {
                      // Add the additional ticket to the end of the current page

                      const ticketExists = updatedData.getISPTickets.tickets.some(
                        ticket => ticket.ticket_id === additionalTicket.ticket_id
                      );

                      if (!ticketExists) {
                        const finalTickets = [...updatedData.getISPTickets.tickets, additionalTicket];

                        // Write the final list back to cache
                        client.writeQuery({
                          query: GET_FILTERED_TICKETS,
                          variables: variables,
                          data: {
                            getISPTickets: {
                              ...updatedData.getISPTickets,
                              tickets: finalTickets
                            }
                          }
                        });
                      }


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
        else if (isNewTicket && ticket_id) {
          // For widgets, we only want to add new tickets if they match our filter criteria
          // Check if this ticket matches our filter criteria by making a single query
          try {
            // Create a query with our current filters plus this specific ticket ID
            const testVariables = {
              ...variables,
              ticket_id: ticket_id  // Use ticket_id instead of ticketIds
            };

            const testResult = await client.query({
              query: GET_FILTERED_TICKETS,
              variables: testVariables,
              fetchPolicy: 'network-only'
            });

            // If the query returns this ticket, it matches our filters
            if (testResult?.data?.getISPTickets?.tickets?.length > 0) {
              const newTicket = testResult.data.getISPTickets.tickets[0];

              // Update the cache to include the new ticket
              const currentData = client.readQuery({
                query: GET_FILTERED_TICKETS,
                variables: variables
              });

              if (currentData?.getISPTickets?.tickets) {
                // Add the new ticket to the beginning of the list (assuming newest first)

                const ticketExists = currentData.getISPTickets.tickets.some(
                  ticket => ticket.ticket_id === newTicket.ticket_id
                );
                if (!ticketExists) {
                  const updatedTickets = [
                    newTicket,
                    ...currentData.getISPTickets.tickets
                  ];

                  // Update the cache with the new list including the new ticket
                  client.writeQuery({
                    query: GET_FILTERED_TICKETS,
                    variables: variables,
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
                }
              }
            }
          } catch (error) {
            console.error('Error checking if new ticket matches filters:', error);
          }
        }
        else if (ticket_id) {
          // Check if the updated ticket is currently in our table
          const currentTickets = tickets || [];
          const isTicketInTable = currentTickets.some(ticket => ticket.ticket_id === ticket_id);

          // Check if the updated ticket matches our filter criteria with a single query
          try {
            // Create a query with our current filters plus this specific ticket ID
            const testVariables = {
              ...variables,
              ticket_id: ticket_id
            };

            const testResult = await client.query({
              query: GET_FILTERED_TICKETS,
              variables: testVariables,
              fetchPolicy: 'network-only'
            });

         
            // Read current cache data
            const currentData = client.readQuery({
              query: GET_FILTERED_TICKETS,
              variables: variables
            });

            if (!currentData?.getISPTickets?.tickets) {
              // If we can't read the cache, refetch the data
              refetch();
              return;
            }

            // If the test query returns this ticket, it matches our filters
            if (testResult?.data?.getISPTickets?.tickets?.length > 0) {

              const updatedTicket = testResult.data.getISPTickets.tickets[0];
              let updatedTickets;


              if (isTicketInTable) {
                // If the ticket is already in our table, update it
                updatedTickets = currentData.getISPTickets.tickets.map(ticket =>
                  ticket.ticket_id === ticket_id ? { ...ticket, ...updatedTicket } : ticket
                );

              } else {
                // If the ticket is not in our table but now matches filters, add it at the top
                // First, remove the last ticket if we're at page size limit
                let ticketsToKeep = currentData.getISPTickets.tickets;
                if (ticketsToKeep.length >= page.limit) {
                  ticketsToKeep = ticketsToKeep.slice(0, -1);
                }

                // Add the new ticket at the top
                updatedTickets = [updatedTicket, ...ticketsToKeep];
              }

              // Write updated tickets back to cache
              client.writeQuery({
                query: GET_FILTERED_TICKETS,
                variables: variables,
                data: {
                  getISPTickets: {
                    ...currentData.getISPTickets,
                    tickets: updatedTickets,
                    // Update total count if it's a new ticket
                    totalCount: !isTicketInTable && currentData.getISPTickets.totalCount
                      ? currentData.getISPTickets.totalCount + 1
                      : currentData.getISPTickets.totalCount
                  }
                }
              });
            } else if (isTicketInTable) {
              // If the ticket is in our table but no longer matches filters, remove it
              // Filter out the ticket that no longer matches
             
             
              const updatedTickets = currentData.getISPTickets.tickets.filter(
                ticket => ticket.ticket_id !== ticket_id
              );

              // Update the cache with the filtered list
              client.writeQuery({
                query: GET_FILTERED_TICKETS,
                variables: variables,
                data: {
                  getISPTickets: {
                    ...currentData.getISPTickets,
                    tickets: updatedTickets,
                    // Update total count
                    totalCount: currentData.getISPTickets.totalCount
                      ? currentData.getISPTickets.totalCount - 1
                      : undefined
                  }
                }
              });

              // To maintain pagination integrity, fetch an additional ticket if needed
              if (page.page < Math.ceil((currentData.getISPTickets.totalCount - 1) / page.limit) - 1) {
                try {
                  // Calculate the index to fetch (current page * pageSize + pageSize)
                  const fetchIndex = (page.page + 1) * page.limit;

                  // Fetch one additional ticket to maintain page size
                  const additionalResult = await client.query({
                    query: GET_FILTERED_TICKETS,
                    variables: {
                      ...variables,
                      page: Math.floor(fetchIndex / page.limit),
                      pageSize: 1,
                      offset: fetchIndex % page.limit
                    }
                  });

                  // If we got an additional ticket, add it to the current page
                  if (additionalResult?.getISPTickets?.tickets?.[0]) {
                    const additionalTicket = additionalResult.getISPTickets.tickets[0];

                    // Read the updated cache (after deletion)
                    const updatedData = client.readQuery({
                      query: GET_FILTERED_TICKETS,
                      variables: variables
                    });

                    if (updatedData?.getISPTickets?.tickets) {
                      // Add the additional ticket to the end of the current page

                      const ticketExists = updatedData.getISPTickets.tickets.some(
                        ticket => ticket.ticket_id === additionalTicket.ticket_id
                      );

                      if (!ticketExists) {
                        const finalTickets = [...updatedData.getISPTickets.tickets, additionalTicket];

                        // Write the final list back to cache
                        client.writeQuery({
                          query: GET_FILTERED_TICKETS,
                          variables: variables,
                          data: {
                            getISPTickets: {
                              ...updatedData.getISPTickets,
                              tickets: finalTickets
                            }
                          }
                        });
                      }

                    }
                  }
                } catch (error) {
                  console.error('Error fetching replacement ticket:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error handling updated ticket:', error);
            // If there's an error, refetch the data
            refetch();
          }
        }
      }
    },
  });

  useEffect(() => {
    if ((!loading || cacheExists) && data) {
      if (data.getISPTickets && data.getISPTickets.totalCount !== totalRecords) {
        setTotalRecords(data.getISPTickets.totalCount)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading])

  const onSaveTitle = () => {
    if (editingTitle.trim()) {
      dispatch(setDashboardCards({
        items: items.map(widget =>
          widget.i === editingItemId
            ? { ...widget, title: editingTitle.trim() }
            : widget
        ),
        nextId
      }));
    }
    setEditingItemId(null);
  };

  const handleEditTitle = (event) => {
    setEditingTitle(event.target.value);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSaveTitle();
    }
  };

  const onRemoveWidget = () => {
    setOpenPrompt(true);
  };

  const handleRemoveWidget = () => {
    onRemoveItem(item.i);
  };

  const setWidgetIncludeDeleted = (value) => {
    dispatch(setDashboardCards({
      items: items.map(widget =>
        widget.i === item.i ? { ...widget, flag_subscriber_deleted: value } : widget
      ),
      nextId
    }));
  };


  return (
    <Grid container spacing={1} alignItems="flex-start" justifyContent="space-between" className="card-drag-handle">
      <Grid item xs={10}>
        <Grid container spacing={1} alignItems="center" flexWrap="wrap">
          <Grid item>
            {editingItemId === item.i ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}
                className="edit-title-area"
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
              >
                <TextField
                  fullWidth
                  value={editingTitle}
                  variant="standard"
                  autoFocus
                  size="small"
                  onChange={handleEditTitle}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation()
                  }}
                  onBlur={onSaveTitle}
                  onKeyDown={onKeyDown}
                />
              </Box>
            ) : (
              <Typography
                variant="subtitle1"
                sx={{ cursor: 'text' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="edit-title-area"
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingItemId(item.i);
                  setEditingTitle(item.title);
                }}
              >
                {item.title}
              </Typography>
            )}
          </Grid>
          <Grid item>
            <AddFilter item={item} items={items} index={index} nextId={nextId} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={1}>
        <BulkActionButton
          setCheckedRows={setCheckedRows}
          checkedRows={checkedRows}
          setHasUnmetReqIds={setHasUnmetReqIds}
          hasUnmetReqIds={hasUnmetReqIds}
          widgetVar={variables}
        />
      </Grid>
      <Grid item>
        <Box
          sx={{
            cursor: 'pointer',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveWidget();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <CloseIcon fontSize="small" />
        </Box>
        {openPrompt &&
          <RemoveWidgetDialog
            openPrompt={openPrompt}
            setOpenPrompt={setOpenPrompt}
            onRemoveItem={handleRemoveWidget}
          />
        }
      </Grid>
      <Grid
        item
        xs={12}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <FilteredTable
          page={page}
          setPage={setPage}
          setSort={setSort}
          tickets={tickets}
          totalRecords={totalRecords}
          loading={loading && !cacheExists}
          checkedRows={checkedRows}
          setCheckedRows={setCheckedRows}
          hasUnmetReqIds={hasUnmetReqIds}
          setHasUnmetReqIds={setHasUnmetReqIds}
          tableOptions={item.tableState}
          setWidgetIncludeDeleted={setWidgetIncludeDeleted}
          widgetIncludeDeleted={widgetIncludeDeleted}
          widgetItems={items}
          widgetId={item.i}
          widgetVariables={variables}
          error={error}
          hideContentDrawer={hideContentDrawer}
          dockedItems={dockedItems}
        />
      </Grid>
    </Grid>
  );
};

export default React.memo(TicketWidget);
