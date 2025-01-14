import { Grid, Skeleton } from "@mui/material"
import React from "react"

export const HeaderSkeletonLoader = () => (
  <div style={{ display: "inline-flex" }}>
    <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: 25, borderRadius: "10px", margin: "0px 10px" }} />
    <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "110px", margin: "0px 10px" }} />
    <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "80px", margin: "0px 10px" }} />
  </div>
)

export const SummarySkeletonLoader = () => (
  <Grid container spacing={1}>
    <Grid item xs className="h-100">
      <div className="py-3 pr-5">
        <Skeleton animation="wave" style={{ height: 50, backgroundColor: "##dfdede", width: "80%", margin: "-10px 1px" }} />
        <div className="border-top mt-3 pt-3">
          <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "15%" }} />
          <Skeleton animation="wave" style={{ height: 90, backgroundColor: "##dfdede", width: "50%", margin: "-10px 10px" }} />
          <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "15%" }} />
          <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "20%" }} />
        </div>
      </div>
    </Grid>
  </Grid>
)

export const ContactSkeletonLoader = () => (
  <Grid container spacing={1}>
    <Grid item xs className="h-80">
      <div className="py-3 pr-5">
        <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "15%" }} />
        <Skeleton animation="wave" style={{ height: 90, backgroundColor: "##dfdede", width: "50%", margin: "-10px 10px" }} />
        <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "15%" }} />
        <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "20%" }} />
      </div>
    </Grid>
  </Grid>
)