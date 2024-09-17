import React from "react";
import { Visibility } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import { IconButton } from "@mui/material";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import ButtonWithLabel from "Common/ButtonWithLabel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/pro-light-svg-icons";

const BillsOfMaterial = (props) => {
  const { appuser_id, lablesVisible } = props;
  return (
    <AccordionCard
      label="Bills Of Material"
      iconButtons={
        <>
          <ButtonWithLabel
            buttonLabel="Add Bills of Material"
            lablesVisible={lablesVisible}
            onClick=""
            buttonIcon={<FontAwesomeIcon icon={faPlusCircle} />}
          />
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
      Coming Soon!
    </AccordionCard>
  );
};
export default BillsOfMaterial;
