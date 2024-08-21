import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import Filter from "./components/Filter";
import MessagesTable from "./components/MessagesTable";

const Messages = (props) => {
  const { appuser_id } = props;
  return (
    <AccordionCard
      label="Messages"
      iconButtons={<></>}
      menuOption={
        <>
          <HeaderMenuOptions appuser_id={appuser_id} category="Message Card" />
        </>
      }
    >
      <Filter />

      <MessagesTable />
    </AccordionCard>
  );
};
export default Messages;
