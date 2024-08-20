import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";

const Messages = (props) => {
  const { appuser_id } = props;
  return (
    <AccordionCard
      label="Messages"
      iconButtons={
        <>
        </>
      }
      menuOption={
        <>
          <HeaderMenuOptions appuser_id={appuser_id} category="Message Card" />
        </>
      }
    >
      Messages Card
    </AccordionCard>
  );
};
export default Messages;
