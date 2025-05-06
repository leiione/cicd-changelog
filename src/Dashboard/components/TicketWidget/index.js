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
import { useQuery,useLazyQuery, useSubscription } from '@apollo/client';
import { GET_FILTERED_TICKETS, GET_TICKET } from 'Dashboard/DashboardGraphQL';
import { checkIfCacheExists } from 'config/apollo';
import { useSelector } from 'react-redux';
import { TICKET_LIST_SUBSCRIPTION } from 'TicketDetails/TicketGraphQL';


const TicketWidget = (props) => {
  const dispatch = useDispatch();
  const { item, items, index, nextId, onRemoveItem , handleOpenTicket} = props;

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

  const { loading, error, data, client, refetch} = useQuery(GET_FILTERED_TICKETS, {
    variables,
    fetchPolicy: 'cache-and-network'
  });

   const [getTicketDetails] = useLazyQuery(GET_TICKET, {
      fetchPolicy: 'network-only',
      onError: (error) => {
        console.error('Error fetching updated ticket details:', error);
      }
    });
  
    const cacheExists = checkIfCacheExists(client, { query: GET_FILTERED_TICKETS, variables })


    const tickets = data?.getISPTickets?.tickets || [];
  
    useSubscription(TICKET_LIST_SUBSCRIPTION, {
      variables: { isp_id: isp_id },
      onData: async ({ data: { data }, client }) => {
        if (data?.ticketList?.ticket_id) {
          const ticket_id = data.ticketList.ticket_id;
          
          // Check if the updated ticket is currently in our table
          const currentTickets = tickets || [];
          const isTicketInTable = currentTickets.some(ticket => ticket.ticket_id === ticket_id);
          
          if (isTicketInTable) {
            console.log(`TicketWidget: Ticket ${ticket_id} updated, fetching latest details`);
            
            // Fetch the updated ticket details
            const result = await getTicketDetails({
              variables: { ticket_id: ticket_id }
            });
  
            
            if (result?.data?.getISPTickets?.tickets?.[0]) {
              // Update the Apollo cache with the new ticket data
              const updatedTicket = result.data.getISPTickets.tickets[0];
              
              // Update the specific ticket in the cache
              const currentData = client.readQuery({
                query: GET_FILTERED_TICKETS,
                variables: variables
              });
              
              if (currentData?.getISPTickets?.tickets) {
                const updatedTickets = currentData.getISPTickets.tickets.map(ticket => 
                  ticket.ticket_id === ticket_id ? { ...ticket, ...updatedTicket } : ticket
                );
                
                client.writeQuery({
                  query: GET_FILTERED_TICKETS,
                  variables: variables,
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
          <AddFilter item={item} items={items} index={index} nextId={nextId}/>
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
          handleOpenTicket={handleOpenTicket}
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
        />
      </Grid>
    </Grid>
  );
};

export default React.memo(TicketWidget);
