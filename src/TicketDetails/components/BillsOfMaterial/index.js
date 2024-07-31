import React from "react";
import { OpenInNew, Visibility } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "./components/HeaderMenuOptions";
import { IconButton } from "@mui/material";

const BillsOfMaterial = (props) => {
  return (
    <AccordionCard
      label="Bills Of Material"
      iconButtons={
        <>
          <IconButton>
            <OpenInNew />
          </IconButton>
        </>
      }
      menuOption={
        <>
          <IconButton>
            <Visibility />
          </IconButton>
          <HeaderMenuOptions />
        </>
      }
    >
      BOM Card
    </AccordionCard>
  );
};
export default BillsOfMaterial;
