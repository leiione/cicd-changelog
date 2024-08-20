import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";

const Attachments = (props) => {
  const { appuser_id } = props;

  return (
    <AccordionCard
      label="Attachments"
      iconButtons={
        <>
        </>
      }
      menuOption={
        <>
          <HeaderMenuOptions appuser_id={appuser_id} category="Attachments Card" />
        </>
      }
    >
      Coming Soon!
    </AccordionCard>
  );
};
export default Attachments;
