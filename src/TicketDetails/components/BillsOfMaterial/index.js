import React from "react";
import { KeyboardArrowDown, OpenInNew, Visibility } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import HeaderMenuOptions from "components/HeaderMenuOptions";

const BillsOfMaterial = (props) => {
  const {handleIconButton} = props
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { appuser_id } = props;
  return (
    <AccordionCard
      label="Bills Of Material"
      iconButtons={
        <>
          <IconButton onClick={(event) => handleIconButton(event, "Bills of Material")}
          >
            <OpenInNew />
          </IconButton>
        </>
      }
      menuOption={
        <>
          <IconButton>
            <Visibility />
          </IconButton>
          <HeaderMenuOptions
            appuser_id={appuser_id}
            category="Bill Of Materials Card"
          />
        </>
      }
    >
      <TableContainer className="border border-lighter">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell></TableCell>
              <TableCell>Amt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Internet</TableCell>
              <TableCell>
                <Typography className="font-weight-normal">
                  Description
                </Typography>
                <Typography className="font-weight-normal">
                  (Feb 1.2024 - Mar 31, 2024)
                </Typography>
              </TableCell>
              <TableCell>1</TableCell>
              <TableCell>39.90</TableCell>
              <TableCell>0.00 </TableCell>
              <TableCell>39.90</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <div className="text-right mt-2">
        <Button
          id="basic-button"
          variant="outlined"
          color="primary"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          endIcon={<KeyboardArrowDown />}
        >
          Add And On-Hold
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handleClose}>
            Add and Bill on first Authentication
          </MenuItem>
          <MenuItem onClick={handleClose}>Add And On-Hold</MenuItem>
          <MenuItem onClick={handleClose}>Add and Bill Future</MenuItem>
          <MenuItem onClick={handleClose}>Add and Bill Now</MenuItem>
          <MenuItem onClick={handleClose}>Create Quoatation</MenuItem>
        </Menu>
      </div>
    </AccordionCard>
  );
};
export default BillsOfMaterial;
