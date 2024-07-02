import React from "react";
import { IconButton, MenuItem, Popover, Toolbar, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { MoreVert, SentimentSatisfiedAlt } from "@mui/icons-material";
import { preventEvent } from "Common/helper";
import { includes } from "lodash";

const useStyles = makeStyles((theme) => ({
  header: {
    position: "absolute",
    right: "1rem",
    height: 42,
    display: "flex",
    alignItems: "center",
    zIndex: theme.zIndex.drawer + 2
  },
}));

const Header = (props) => {
  const classes = useStyles();
  const { customer, category, handleBoM, toggleSignature, toggleDelete } = props;
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(Boolean(anchorEl) ? null : event.currentTarget)
  }
  return (
    <>
      <div className={`${classes.header} docker-buttons`} style={{ right: includes(category, 'Add') || includes(category, 'config') ? 50 : 100 }}>
        <IconButton onClick={handleClick} size="large" className="text-light">
          <MoreVert className="f-20" />
        </IconButton>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClick}
          classes={{ paper: "overflow-hidden" }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
        >
          {customer.ticket_id > 0 &&
            <>
              <MenuItem onClick={handleBoM}>
                Bill of Materials
              </MenuItem>
              <MenuItem onClick={() => toggleSignature(true)}>
                Signature
              </MenuItem>
              <MenuItem onClick={() => toggleDelete(true)}>
                Delete Ticket
              </MenuItem>
            </>
          }
          <MenuItem className="pl-2">
            {/* <CSAT category={category} key={category} /> */}
            <IconButton>
              <SentimentSatisfiedAlt />
            </IconButton>
            Feedback
          </MenuItem>
        </Popover>
      </div>
      <Toolbar className="drawer-header">
        <Typography variant="h6">{customer.ticket_id > 0 ? `Ticket #${customer.ticket_id}` : 'Add Ticket'}</Typography>
      </Toolbar>
    </>
  );
};

export default Header;
