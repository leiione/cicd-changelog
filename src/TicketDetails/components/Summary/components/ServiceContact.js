import React, { useState } from "react";
import {
  Business,
  CallOutlined,
  ExpandLess,
  ExpandMore,
  FmdGoodOutlined,
  MailOutlined,
  Person,
} from "@mui/icons-material";
import { Collapse, Grid, IconButton, Typography } from "@mui/material";

const ServiceContact = (props) => {
  const { ticket } = props
  const customer = (ticket.subscriber && ticket.subscriber.customer_detail) ? { ...ticket.subscriber, ...ticket.subscriber.customer_detail } : {}
  const servicePhone = ticket.ticket_contact_numbers ? ticket.ticket_contact_numbers.split(",") : [];
  const [expandCollapse, setExpandCollapse] = useState("");
  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <IconButton onClick={handleCollapse} className="p-2 text-muted">
          {expandCollapse ? (
            <ExpandMore className="mr-1" />
          ) : (
            <ExpandLess className="mr-1" />
          )}
          <Typography variant="subtitle1" className="text-muted">
            Service Contact
          </Typography>
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={expandCollapse} style={{ paddingLeft: "25px", position: "relative" }}>
          <Grid container spacing={1}>
            <Grid item xs={12} >
              <Typography variant="subtitle1">
                <Business className="text-muted f-20" style={{ marginRight: 5 }} /> {customer.main_company || "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} >
              <Typography variant="subtitle1">
                <Person className="text-success f-20" style={{ marginRight: 5 }} /> {`${customer.first_name} ${customer.last_name}`}
              </Typography>
            </Grid>
            <Grid item xs={12} >
              <Typography variant="subtitle1">
                <FmdGoodOutlined className="text-muted f-20" style={{ marginRight: 5 }} /> {ticket.address || "-"}
              </Typography>
            </Grid>
            {servicePhone.length > 0 &&
              <Grid item xs={12} >
                <Grid container spacing={2}>
                  <Grid item xs={"auto"} >
                    <Typography variant="subtitle1">
                      <CallOutlined className="text-muted f-20" style={{ marginRight: 8 }} /><span>Home &nbsp; {servicePhone[0]}</span>
                    </Typography>
                  </Grid>
                  {servicePhone.length > 1 && <Grid item xs={"auto"} >
                    <Typography variant="subtitle1"><span>Work &nbsp; {servicePhone[1]}</span></Typography>
                  </Grid>
                  }
                </Grid>
              </Grid>
            }
            {ticket.ticket_contact_email && <Grid item xs={12} >
              <Typography variant="subtitle1">
                <MailOutlined className="text-muted f-20" style={{ marginRight: 5 }} /> {ticket.ticket_contact_email}
              </Typography>
            </Grid>}
          </Grid>
        </Collapse>
      </Grid>
    </Grid >
  );
};
export default ServiceContact;
