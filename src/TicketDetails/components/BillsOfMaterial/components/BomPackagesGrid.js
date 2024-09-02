import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  Grid,
} from "@mui/material";

const BomPackagesGrid = (props) => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TableContainer className="border border-lighter">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Setup Fee</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Speed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Typography className="font-weight-normal">
                      Internet
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className="font-weight-normal">
                      Package description...
                    </Typography>
                  </TableCell>
                  <TableCell>$39.90</TableCell>
                  <TableCell>$30.00/Monthly</TableCell>
                  <TableCell>150mb-100mb</TableCell>
                </TableRow>
                {/* 2nd Row */}
                <TableRow>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Typography className="font-weight-normal">
                      Internet 2
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className="font-weight-normal">
                      Items description...
                    </Typography>
                  </TableCell>
                  <TableCell>$39.90</TableCell>
                  <TableCell>$30.00/Monthly</TableCell>
                  <TableCell>150mb-100mb</TableCell>
                </TableRow>

                {/* 3rd Row */}
                <TableRow>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Typography className="font-weight-normal">
                      Internet
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className="font-weight-normal">
                      Items description...
                    </Typography>
                  </TableCell>
                  <TableCell>$39.90</TableCell>
                  <TableCell>$30.00/Monthly</TableCell>
                  <TableCell>150mb-100mb</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default BomPackagesGrid;
