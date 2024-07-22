import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { InputAdornment, IconButton, Grid, Button } from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { isEmpty } from "lodash";
import { useDebounce } from "use-debounce"; // Assuming you have a debounce hook
import {
  ADD_LINKED_TICKET_MUTATION,
  GET_LINKED_TICKETS,
  GET_TICKET,
  GET_TICKETS_QUERY,
} from "TicketDetails/TicketGraphQL";
import { useMutation, useQuery } from "@apollo/client";
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid
import TickeLinkType from "./TicketLinkType";
import ProgressButton from "Common/ProgressButton";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";

function LinkedTicketsList(props) {
  const dispatch = useDispatch();

  const { ticket, closeDrawer } = props;
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchText, 500); // Debounce search term
  const [selectedRows, setSelectedRows] = useState([]);
  const [tickeLinkType, setTicketLinkType] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { data, loading } = useQuery(GET_TICKETS_QUERY, {
    variables: { searchVal: debouncedSearchTerm, ticket_id: ticket.ticket_id },
    skip: !debouncedSearchTerm, // Skip query if search term is empty
  });

  const [addLinkedTicket] = useMutation(ADD_LINKED_TICKET_MUTATION);

  const saveLinkedTicket = async (ticketId, linkedTicketInput) => {
    setSubmitting(true);
    try {
      await addLinkedTicket({
        variables: {
          ticket_id: ticket.ticket_id,
          linked_input: linkedTicketInput,
        },
        refetchQueries: [
          { query: GET_LINKED_TICKETS, variables: { ticket_id: ticketId } },
          { query: GET_TICKET, variables: { id: ticketId } },
        ],
      });
      dispatch(
        showSnackbar({
          message: "Ticket Linked successfully",
          severity: "success",
        })
      );
      setSubmitting(false);
      setSearchText("");
      setShowSearch(false);
      setSelectedRows([]);
      closeDrawer(false);
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "");
      dispatch(showSnackbar({ message: msg, severity: "error" }));
      setSubmitting(false);
    }
  };

  const columns = [
    { field: "ticket_id", headerName: "Ticket ID" },
    { field: "type", headerName: "Title" },
    { field: "description", headerName: "Description", width: 225 },
    { field: "priority", headerName: "Priority" },
  ];

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchText(value);
  };

  const handleCancelSearch = (event) => {
    setSearchText("");
    setShowSearch(false);
  };

  const handelSaveLinkedTicket = () => {
    const linkedTicketIds = selectedRows
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    const linkedTicketInput = {
      linked_ticket_id: linkedTicketIds,
      ticket_id: ticket.ticket_id,
      ticket_link_type_id: tickeLinkType.id,
    };
    saveLinkedTicket(ticket.ticket_id, linkedTicketInput);
  };

  const handlCloseContentDrawer= ()=>{
    setSubmitting(false);
    setSearchText("");
    setShowSearch(false);
    setSelectedRows([]);
    closeDrawer(false);
  }

  return (
    <>
      <Grid container className="p-3">
        <Grid item xs={8} className="">
          <TickeLinkType
            tickeLinkType={tickeLinkType}
            setTicketLinkType={setTicketLinkType}
          ></TickeLinkType>
        </Grid>
        <Grid
          item
          xs={4}
          style={{ display: "flex" }}
          justifyContent="flex-end"
          className="pr-2"
        >
          {showSearch ? (
            <TextField
              variant="standard"
              value={searchText}
              onChange={handleSearch}
              placeholder="Search…"
              InputProps={{
                endAdornment: !isEmpty(searchText) && (
                  <InputAdornment
                    className="equipment-adornment"
                    position="end"
                  >
                    <IconButton onClick={handleCancelSearch} size="large">
                      <Close className="f-14" />
                    </IconButton>
                  </InputAdornment>
                ),
                inputProps: { className: "px-2 py-1" },
              }}
              InputLabelProps={{ shrink: false }}
              label=""
            />
          ) : (
            <IconButton onClick={() => setShowSearch(true)}>
              <Search />
            </IconButton>
          )}
        </Grid>
      </Grid>

      <Grid item xs="auto" className="p-3">
        <DataGrid
          rows={
            data?.tickets.map((ticket, index) => ({
              ...ticket,
              id: ticket.ticket_id || index,
            })) || []
          }
          columns={columns}
          pageSize={25}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          autoHeight
          checkboxSelection
          disableColumnMenu={true}
          onRowSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection);
          }}
        />
      </Grid>
      <Grid item xs={12} className="text-right p-3" >
        
        
        <ProgressButton
          color="primary"
          variant="outlined"
          disableRipple
          onClick={() => {
            handelSaveLinkedTicket();
          }}
          isSubmitting={submitting}
          style={{ padding: "5px" }}
        >
          Link
        </ProgressButton>

        <Button
          color="default"
          variant="outlined"
          size="small"
          className="pl-2"
          style={{ padding: "5px" }}
          onClick={() => handlCloseContentDrawer()}
        >
          Cancel
        </Button>
     

     
      </Grid>
    </>
  );
}

export default LinkedTicketsList;
