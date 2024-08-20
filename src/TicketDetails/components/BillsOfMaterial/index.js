import React from "react";
import { OpenInNew, Visibility } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import { IconButton } from "@mui/material";
import HeaderMenuOptions from "components/HeaderMenuOptions";


const BillsOfMaterial = (props) => {
  const { appuser_id } = props;
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
          <HeaderMenuOptions appuser_id={appuser_id} category="Bill Of Materials Card" />
        </>
      }
    >
      Coming Soon!
    </AccordionCard>
  );
};
export default BillsOfMaterial;
