import React, { useMemo, useState } from "react";
import { ExpandLess, ExpandMore, HighlightOff, Link } from "@mui/icons-material";
import { Chip, Collapse, Grid, IconButton, MenuItem, MenuList, Skeleton, Tooltip, Typography } from "@mui/material";
import { GET_LINKED_TICKETS } from "TicketDetails/TicketGraphQL";
import { useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
import { startCase } from "lodash";
import { getPriorityIcon } from "utils/getPriorityIcon";

const LinkedTicketContent = (props) => {
  const { loading, error, linkedTickets, handleOpenTicket} = props;
  if (error) return <ErrorPage error={error} />
  if (loading) return (
    <>
      <Skeleton animation="wave" style={{ height: 25, backgroundColor: "#efeeee", width: "20%" }} />
      <Skeleton animation="wave" style={{ height: 50, backgroundColor: "#efeeee", width: "70%", marginTop: "-10px" }} />
    </>
  )

  const onLinkedTicketClick = (ticket) => {
    handleOpenTicket(ticket)
  }

  return (
    <>
      {linkedTickets && linkedTickets.length > 0 ?
        linkedTickets.map((link, index) => (
          <Grid container key={index} spacing={0}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" className="text-muted">{startCase(link.linked_tickets[0].option_label)}</Typography>
            </Grid>
            <Grid item xs={8}>
              <MenuList>
                {link.linked_tickets.map((item, index) => (
                  <MenuItem
                    key={index}
                    style={{ height: 40 }}
                    onClick={() => onLinkedTicketClick(item)}
                  >
                    <Grid container spacing={1} key={index}>
                      <Grid item xs={1.5}>
                        <Typography variant="subtitle1" className="text-primary">{item.ticket_id}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1" className="text-dark">{item.description}</Typography>
                      </Grid>
                      <Grid item xs={4.5} className="text-right">
                        <div className="d-inline-flex">
                          <span style={{ margin: "0px 10px" }}>
                            <Tooltip title={item.priority} placement="top">
                              {getPriorityIcon(item.priority)}
                            </Tooltip>
                          </span>
                          <Typography variant="subtitle1" className="text-dark">{item.status}</Typography>
                          <IconButton style={{ padding: 0, marginLeft: 15 }}>
                            <HighlightOff className="f-18" />
                          </IconButton>
                        </div>
                      </Grid>
                    </Grid>
                  </MenuItem>
                ))}
              </MenuList>
            </Grid>
          </Grid>
        ))
        : <Typography variant="subtitle1" className="text-muted">No Linked Tickets</Typography>
      }
    </>
  )
}

const LinkedTickets = (props) => {
  const { ticket, handleOpenTicket } = props;
  const [expandCollapse, setExpandCollapse] = useState("");

  const { loading, error, data } = useQuery(GET_LINKED_TICKETS, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: "network-only",
    skip: !ticket.ticket_id || !expandCollapse // fetch only when expanded
  })

  const linkedTickets = useMemo(() => {
    let tickets = []
    if (!loading && data && data.linkedTickets) {
      const linkTypes = data.linkedTickets.map(link => link.type_id) // group by link type
      for (let type of linkTypes) {
        tickets.push({
          type_id: type,
          linked_tickets: data.linkedTickets.filter(link => link.type_id === type)
        })
      }
    }
    return tickets
  }, [loading, data]);

  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <IconButton onClick={handleCollapse} className="p-2 text-muted">
          {expandCollapse ? <ExpandMore className="mr-1" /> : <ExpandLess className="mr-1" />}
          <Typography variant="subtitle1" className="text-muted">
            Linked Tickets
          </Typography>
        </IconButton>
        <Chip
          size="small"
          label={<Typography variant="body2" className="text-white">{ticket.linked_count || 0}</Typography>}
          style={{ textAlign: "center", height: "22px" }}
          className="bg-light"
        />
        <IconButton>
          <Link className="text-muted f-19" style={{ transform: "rotate(135deg)", }} />
        </IconButton>
        <Collapse in={expandCollapse} style={{ paddingLeft: "25px", position: "relative" }}>
          <LinkedTicketContent loading={loading} error={error} linkedTickets={linkedTickets} handleOpenTicket={handleOpenTicket}/>
        </Collapse>
      </Grid>
    </Grid>
  );
};
export default LinkedTickets;
