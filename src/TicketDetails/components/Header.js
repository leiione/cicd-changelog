import React from "react";
import { Toolbar, Typography } from "@mui/material";

const Header = (props) => {
  const { customer } = props;
  return (
    <Toolbar className="drawer-header">
      <Typography variant="h6">Ticket {customer.ticket_id}</Typography>
    </Toolbar>
  );
};

export default Header;
