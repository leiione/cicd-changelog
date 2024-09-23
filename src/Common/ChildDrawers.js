import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/pro-regular-svg-icons";

const useStyles = makeStyles({
  drawerPaper: {
    width: "37vw",
  },
});

const ChildDrawers = (props) => {
  const classes = useStyles();
  const {
    title,
    open,
    handleDrawerClose1,
    children,
    handlePrint,
    ticketDetail,
  } = props;

  const getTitle = (title) => {
    if (title === "Work Order") {
      return (
        <>
          {title}{" "}
          <IconButton
            className="ml-2"
            onClick={() => {
              handlePrint(ticketDetail);
            }}
          >
            <FontAwesomeIcon icon={faPrint} />
          </IconButton>
        </>
      );
    } else {
      return title;
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        variant="persistent"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar className="drawer-header">
          <Typography variant="h6">{getTitle(title)}</Typography>

          <IconButton
            onClick={handleDrawerClose1}
            className="close-drawer text-light"
            size="large"
          >
            <Close />
          </IconButton>
        </Toolbar>
        {children}
      </Drawer>
    </>
  );
};

export default ChildDrawers;
