import React, { useState } from "react";
import BomEquipmentGrid from "./BomEquipmentGrid";
import BomItemsGrid from "./BomItemsGrid";
import BomPackagesGrid from "./BomPackagesGrid";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Button,
  IconButton,
  Toolbar,
  Tabs,
  Tab,
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { TabContext, TabPanel } from "@mui/lab";

const BomDrawer = (props) => {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Toolbar>
        <Tabs
          variant="fullWidth"
          className="w-100"
          value={value}
          onChange={handleChange}
        >
          <Tab label="Packages" value="1" />
          <Tab label="Items" value="2" />
          <Tab label="Equipment" value="3" />
        </Tabs>
      </Toolbar>
      <div className="drawer-wrapper p-3">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TabContext value={value}>
              <TabPanel value="1" className="p-0">
                <BomPackagesGrid />
              </TabPanel>
              <TabPanel value="2" className="p-0">
                <BomItemsGrid />
              </TabPanel>
              <TabPanel value="3" className="p-0">
                <BomEquipmentGrid />
              </TabPanel>
            </TabContext>
          </Grid>
          <Grid item xs={12}>
            <TableContainer className="border border-lighter">
              <Table>
                <TableHead>
                  <TableRow component={TableHead}>
                    <TableCell colSpan={"7"}>Selected</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Items</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Tax</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Internet</TableCell>
                    <TableCell>Package description...</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>$39.90</TableCell>
                    <TableCell>$39.90</TableCell>
                    <TableCell>$39.90</TableCell>
                    <TableCell>
                      <IconButton aria-label="delete" size="small">
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Manufacturer and Model</TableCell>
                    <TableCell>Package description...</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>$39.90</TableCell>
                    <TableCell>$39.90</TableCell>
                    <TableCell>$39.90</TableCell>
                    <TableCell>
                      <IconButton aria-label="delete" size="small">
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} className="text-right">
            <Button id="" variant="outlined" color="primary">
              Add to BOM
            </Button>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default BomDrawer;
