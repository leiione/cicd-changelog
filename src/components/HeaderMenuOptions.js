import React from "react";
import { IconButton, MenuItem, Popover } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { preventEvent } from "../Common/helper";
import CSAT from "Common/CSAT";

const HeaderMenuOptions = (props) => {
  const { appuser_id, category } = props
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

  return (
    <>
    {/* Using feedback icon directly, as there is currently only one option */}
      <IconButton color="default" onClick={handleClick} className="d-none"> 
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
        <MenuItem color="default" onClick={(event) => preventEvent(event)}>
          <CSAT appuser_id={appuser_id} category={category} key={category} isSettings={false} handlePopoverClose={() => setAnchorEl(null)} />
        </MenuItem>
      </Popover>

      <CSAT appuser_id={appuser_id} category={category} key={category} isSettings={false} handlePopoverClose={() => setAnchorEl(null)} />
    </>
  );
};
export default HeaderMenuOptions;
