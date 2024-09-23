import React from "react";
import { IconButton, MenuItem, Popover } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { preventEvent } from "../Common/helper";
import CSAT from "Common/CSAT";


const HeaderMenuOptions = (props) => {
  const { appuser_id, category, setOpenQueueJobs, enableQueueJobs } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event) => {
    preventEvent(event);
    setAnchorEl(null);
  };
  const handleOpenQueueJobs = (event) => {
    setAnchorEl(null);
    event.stopPropagation();
    setOpenQueueJobs(true);
  }

  return (
    <>
      {/* Using feedback icon directly, as there is currently only one option */}
      <IconButton color="default" onClick={handleClick}>
        <MoreVert />
      </IconButton>
      <Popover
        open={openMenu}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        classes={{ paper: "overflow-hidden" }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {enableQueueJobs && category === "Summary Card" ? 
          <>
            <MenuItem onClick={(event) => handleOpenQueueJobs(event)}>Queue Jobs</MenuItem>
            <MenuItem onClick={(event) => preventEvent(event)}> Delete Ticket</MenuItem>
          </>           
        : null }
        <MenuItem color="default" onClick={(event) => preventEvent(event)}>
          <CSAT
            appuser_id={appuser_id}
            category={category}
            key={category}
            isSettings={false}
            handlePopoverClose={() => setAnchorEl(null)}
          />
        </MenuItem>
      </Popover>
    </>
  );
};
export default HeaderMenuOptions;
