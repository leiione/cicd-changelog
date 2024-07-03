import React from "react";
import { preventEvent } from "../Common/helper";
import Header from "./components/Header";
import ChildDrawers from "../Common/ChildDrawers";
import Activity from "./components/Activity";
import Summary from "./components/Summary";
import Tasks from "./components/Tasks";
import BillsOfMaterial from "./components/BillsOfMaterial";
import { GET_TICKET } from "./TicketGraphQL";
import { useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";

const TicketDetails = (props) => {
  const { lablesVisible, ticket: ticketData, category, hideContentDrawer } = props;
  console.log('props: ', props);
  const { ticket_id } = ticketData
  const openSignature = true // this should be from ticket type setting
  const showBoM = true // this should be from ticket type setting

  const [open1, setopen1] = React.useState(null);

  const { loading, error, data } = useQuery(GET_TICKET, {
    variables: { id: ticket_id },
    fetchPolicy: "network-only",
    skip: !ticket_id,
  })

  if (error) return <ErrorPage error={error} />

  const ticket = !loading && data && data.ticket ? data.ticket : ticketData

  const handleIconButton = (event, childDrawer) => {
    preventEvent(event);
    setopen1(childDrawer);
  };

  const handleDrawerClose1 = () => {
    setopen1(null);
  };

  const renderChildComponent = () => {
    switch (open1) {
      case "Notes and Alerts":
        return "Coming Soon";
      default:
        return (
          <div className="drawer-wapper-full p-3 tex-center">
            {open1} Coming Soon
          </div>
        );
    }
  };
  return (
    <div>
      <Header
        ticket={ticket}
        category={category}
        setopen1={setopen1}
        hideContentDrawer={hideContentDrawer}
      />
      <div className="drawer-wrapper-full p-3">
        <Summary
          handleIconButton={handleIconButton}
          customer={ticket}
          lablesVisible={lablesVisible}
          showSignature={openSignature}
        />

        <Tasks
          handleIconButton={handleIconButton}
          customer={ticket}
          lablesVisible={lablesVisible}
        />
        {showBoM && (
          <BillsOfMaterial
            handleIconButton={handleIconButton}
            customer={ticket}
            showBoM={showBoM}
            lablesVisible={lablesVisible}
          />
        )}
        <Activity
          handleIconButton={handleIconButton}
          customer={ticket}
          lablesVisible={lablesVisible}
        />
      </div>
      <ChildDrawers
        open={Boolean(open1)}
        handleDrawerClose1={handleDrawerClose1}
        title={open1}
      >
        {renderChildComponent()}
      </ChildDrawers>
    </div>
  );
};

export default TicketDetails;
