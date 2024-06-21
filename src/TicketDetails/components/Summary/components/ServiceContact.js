import React, { useState } from "react";
import {
  ExpandLess,
  ExpandMore,
  LocationOnOutlined,
  MailOutline,
  Person,
  PhoneOutlined,
} from "@mui/icons-material";
import { Button, Collapse, Table, Typography } from "@mui/material";

const ServiceContact = (props) => {
  const [expandCollapse, setExpandCollapse] = useState("");
  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
  };

  return (
    <>
      <Button
        color="default"
        className="mx-0 px-1 text-muted"
        onClick={handleCollapse}
      >
        {expandCollapse ? (
          <ExpandMore className="mr-1" />
        ) : (
          <ExpandLess className="mr-1" />
        )}
        Service Contact
      </Button>
      <Collapse in={expandCollapse} className="pl-4 mr-1">
        <Table size="small">
          <tr>
            <td width={30}>
              <Person className="text-muted" />
            </td>
            <td>
              <Typography variant="subtitle1">Andrew Arthur</Typography>
            </td>
          </tr>
          <tr>
            <td>
              <LocationOnOutlined className="text-muted" />
            </td>
            <td>
              <Typography variant="subtitle1">1636 Coventry Court, Grey Hawk, KY, 40434</Typography>
            </td>
          </tr>
          <tr>
            <td>
              <PhoneOutlined className="text-muted" />
            </td>
            <td>
              <Typography variant="subtitle1">
                <span className="d-inline-block mr-3">Home (361) 362-4482</span>
                <span className="d-inline-block mr-3">Work (361) 362-4482</span>
              </Typography>
            </td>
          </tr>
          <tr>
            <td>
              <MailOutline className="text-muted" />
            </td>
            <td>
              <Typography variant="subtitle1">dru.arthur@yahoo.com</Typography>
            </td>
          </tr>
        </Table>
      </Collapse>
    </>
  );
};
export default ServiceContact;
