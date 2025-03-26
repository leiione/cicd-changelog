import React, { useMemo } from "react";
import { Button, Popover, List, ListItem, TextField, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import DialogAlert from "components/DialogAlert";
import { preventEvent } from "../../../../Common/helper";
import { GET_TICKET_TYPES } from "TicketDetails/TicketGraphQL";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import ErrorPage from "components/ErrorPage";
import { checkIfCacheExists } from "config/apollo";
import { ListSkeletonLoader } from "./SkeletonLoader";

const useStyles = makeStyles((theme) => ({
  paperHeight: {
    maxHeight: 300,
    minWidth: 200,
    overflowY: "auto",
  },
  skeletonLoader: {
   padding: "5px 10px"
  }
}));

const TypesPopover = props => {
  const isp_id = useSelector(state => state.ispId)
  const online = useSelector(state => state.networkStatus.online);

  const {
    classes,
    ticket_id,
    handlePopoverClose,
    setUpdateParams,
    searchQuery,
    setSearchQuery,
    toggleDelete
  } = props;
  
  const { loading, error, data, client } = useQuery(GET_TICKET_TYPES, {
    variables: { isp_id },
    fetchPolicy: online ? "cache-and-network" : "cache-only",
  });

  const cacheExists = checkIfCacheExists(client, { query: GET_TICKET_TYPES, variables: { isp_id } })
  
  const ticketTypes = useMemo(() => {
    return (!loading || cacheExists) && data && data.ticketTypes ? data.ticketTypes : [];
  }, [loading, cacheExists, data]);

  if (loading && !cacheExists) return <ListSkeletonLoader classes={classes} />;
  if (error) return <ErrorPage error={error} />;

  const handleListItemClick = (event, taskType) => {
    preventEvent(event);

    event.stopPropagation();
    setUpdateParams({
      ticket_id: ticket_id,
      type: taskType.ticket_type_desc,
    });
    toggleDelete(true);
    handlePopoverClose();
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    event.stopPropagation();
  };

  const filteredTicketTypes = ticketTypes.filter((taskType) =>
    taskType.ticket_type_desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  return (
    <>
      <TextField
        placeholder="Search..."
        className="p-3"
        value={searchQuery}
        onChange={handleSearchChange}
        fullWidth
        autoFocus
        autoComplete="off"
        variant="standard"
        onClick={(event) => preventEvent(event)}
      />

      <List>
        {filteredTicketTypes.length > 0 ? (
          filteredTicketTypes.map((taskType) => (
            <ListItem
              key={taskType.ticket_type_id}
              button
              onClick={(event) => handleListItemClick(event, taskType)}
            >
              {taskType.ticket_type_desc}
            </ListItem>
          ))
        ) : (
          <ListItem disabled>No matching ticket types</ListItem>
        )}
      </List>
    </>
  )
}

const TicketType = (props) => {
  const classes = useStyles();
  const { ticket, handleUpdate } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [type, setType] = React.useState();
  const [openDelete, toggleDelete] = React.useState(null);
  const [updateParams, setUpdateParams] = React.useState({});
  const [searchQuery, setSearchQuery] = React.useState("");
  const openPopover = Boolean(anchorEl);

  React.useEffect(() => {
    if (ticket && ticket.type) {
      setType(ticket.type ? ticket.type : "Open");
    }
  }, [ticket]);

  const handleClick = (event) => {
    preventEvent(event);

    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event) => {
    preventEvent(event);
    setSearchQuery("");

    setAnchorEl(null);
  };

  return (
    <>
    <Tooltip title={`Type: ${type || 'Not Set'}`} placement="top">
      <Button
        color="default"
        onClick={handleClick}
        endIcon={openPopover ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      >
        <span className="text-dark font-weight-normal">{type}</span>
      </Button>
    </Tooltip>
      {openPopover &&
        <Popover
          open={openPopover}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              className: classes.paperHeight,
            },
          }}
        >
          <TypesPopover
            classes={classes}
            ticket_id={ticket.ticket_id}
            handlePopoverClose={handlePopoverClose}
            setUpdateParams={setUpdateParams}
            toggleDelete={toggleDelete}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </Popover>
      }
      {openDelete && (
        <DialogAlert
          open={openDelete}
          message={
            <span>
              The selected type has an existing template that will replace the
              ticket content.
              <br /> Are you sure you want to change the ticket type?
            </span>
          }
          buttonsList={[
            {
              label: "Yes",
              size: "medium",
              color: "primary",
              isProgress: true,
              onClick: (event) => {
                handleUpdate(updateParams);
                event.stopPropagation();
                setType(updateParams.type);
                toggleDelete(false);
              },
            },
            {
              label: "No",
              size: "medium",
              color: "default",
              onClick: (event) => {
                toggleDelete(false);
                event.stopPropagation();
              },
            },
          ]}
        />
      )}
    </>
  );
};

export default TicketType;
