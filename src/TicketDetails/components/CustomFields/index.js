import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "../../../components/HeaderMenuOptions";
import {
  Typography,
} from "@mui/material";

const CustomFields = (props) => {
    const {appuser_id}= props
  return (
    <AccordionCard
      label="Custom Fields"
      menuOption={
        <HeaderMenuOptions
          appuser_id={appuser_id}
          category="Custom Fields Card"
        />
      }
    >
      <Typography className="text-muted">Custom Fields</Typography>
    </AccordionCard>
  );
};
export default CustomFields;
