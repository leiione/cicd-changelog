import React from "react";
import { IconButton, MenuItem, Popover, Toolbar, Tooltip, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ContentCopy, DescriptionOutlined, MoreVert, SentimentSatisfiedAlt } from "@mui/icons-material";
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
  const { ticket, category, toggleDelete, setopen1 } = props;
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(Boolean(anchorEl) ? null : event.currentTarget)
  }

  const copyText = () => {
    navigator.clipboard.writeText(ticket.ticket_id)
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
          {ticket.ticket_id > 0 &&
            <MenuItem onClick={() => toggleDelete(true)}>
              Delete Ticket
            </MenuItem>
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
        <Typography variant="h6" className="font-weight-light">{ticket.ticket_id > 0 ? `Ticket #${ticket.ticket_id}` : 'Add Ticket'}</Typography>
        {ticket.ticket_id > 0 &&
          <>
            <IconButton className="text-light" onClick={copyText}>
              <ContentCopy className="f-18" />
            </IconButton>
            <Typography variant="h6" className="font-weight-bold">{ticket.assigned_name}</Typography>
            <Tooltip title="Work Order" placement="top">
              <IconButton className="text-light" onClick={() => setopen1("Work Order")}>
                <DescriptionOutlined className="f-18" />
              </IconButton>
            </Tooltip>
          </>
        }
      </Toolbar>
    </>
  );
};

export default Header;
