import React, { useEffect, useState } from "react";
import {
  Business,
  CallOutlined,
  Edit,
  ExpandLess,
  ExpandMore,
  FmdGoodOutlined,
  MailOutlined,
  Person,
} from "@mui/icons-material";
import { Button, Collapse, Divider, Grid, IconButton, Typography } from "@mui/material";
import ContactAddressDropdown from "./components/ContactAddressDropdown";
import { getFormattedAddress } from "utils/formatter";

const ServiceContact = (props) => {
  const { ticket, updateTicket } = props
  const customer = (ticket.subscriber && ticket.subscriber.customer_detail) ? { ...ticket.subscriber, ...ticket.subscriber.customer_detail } : {}
  const servicePhone = ticket.ticket_contact_numbers ? ticket.ticket_contact_numbers.split(",") : [];
  const customerAddress = ticket.address ? ticket.address : getFormattedAddress(customer, 'main')

  const [expandCollapse, setExpandCollapse] = useState(false);
  const [onEditMode, setEditMode] = useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState(customerAddress);

  useEffect(() => {
    if (selectedAddress !== customerAddress) {
      setSelectedAddress(customerAddress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerAddress, onEditMode])

  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
  };

  const onSaveAddress = async () => {
    await updateTicket({ ticket_id: ticket.ticket_id, address: selectedAddress });
    setTimeout(() => { setEditMode(false) }, 500); // so value wont change
  }

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
        {expandCollapse && ticket.category_type === "SUBSCRIBER" &&
          <IconButton style={{ padding: 0, marginBottom: "5px" }} onClick={() => setEditMode(!onEditMode)}>
            <Edit className="text-muted f-18" />
          </IconButton>
        }
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
                <FmdGoodOutlined className="text-muted f-20" style={{ marginRight: 5 }} /> {selectedAddress}
                {onEditMode && <ContactAddressDropdown selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} customer={customer} customerAddress={customerAddress} />}
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
            {onEditMode &&
              <Grid item xs={9}>
                <Divider />
                <div className="text-right">
                  <Button color="primary" size="large" style={{ padding: "5px" }} onClick={onSaveAddress}>
                    Save
                  </Button>
                  <Button className="bg-white text-muted" size="large" style={{ padding: "5px" }} onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </Grid>
            }
          </Grid>
        </Collapse>
      </Grid>
    </Grid >
  );
};
export default ServiceContact;
