import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "./components/HeaderMenuOptions";

const Attachments = (props) => {

  return (
    <AccordionCard
      label="Attachments"
      iconButtons={
        <>
        </>
      }
      menuOption={
        <>
          <HeaderMenuOptions />
        </>
      }
    >
      Attachments Card
    </AccordionCard>
  );
};
export default Attachments;
