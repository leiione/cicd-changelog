import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "./components/HeaderMenuOptions";

const Messages = (props) => {

  return (
    <AccordionCard
      label="Messages"
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
      Messages Card
    </AccordionCard>
  );
};
export default Messages;
