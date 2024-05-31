import React, { useState } from "react";
import { OpenInNew, Visibility } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "./components/HeaderMenuOptions";
import { IconButton } from "@mui/material";
import { preventEvent } from "Common/helper";

const BillsOfMaterial = (props) => {
  const { showBoM } = props;
  const [setShowBoM] = useState(true);
  const handleBoMVisibility = (event) => {
    preventEvent(event);
    setShowBoM(!showBoM);
  };
  return (
    <AccordionCard
      label="Bills Of Material"
      iconButtons={
        <>
          <IconButton className="ml-5">
            <OpenInNew />
          </IconButton>
        </>
      }
      menuOption={
        <>
          {showBoM && (
            <IconButton onClick={handleBoMVisibility}>
              <Visibility />
            </IconButton>
          )}
          <HeaderMenuOptions />
        </>
      }
    ></AccordionCard>
  );
};
export default BillsOfMaterial;
