import React, { useMemo } from "react";
import { preventEvent } from "../Common/helper";
import Header from "./components/Header";
import ChildDrawers from "../Common/ChildDrawers";
import Activity from "./components/Activity";
import Summary from "./components/Summary";
import WorkOrder from "./components/Summary/components/WorkOrder";
import Tasks from "./components/Tasks";
import BillsOfMaterial from "./components/BillsOfMaterial";
import { GET_TICKET } from "./TicketGraphQL";
import { useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faHouse } from '@awesome.me/kit-bf5f144381/icons/classic/solid'
import { useSelector } from "react-redux";
import GlobalSnackbar from "Common/GlobalSnackbar";

const TicketDetails = (props) => {
  const {
    lablesVisible,
    ticket: ticketData,
    category,
    hideContentDrawer,
    toggleOffCRMDrawer,
    handleOpenTicket,
    appuser_id
  } = props;
  const snackbar = useSelector(state => state.snackbar)

  const { ticket_id } = ticketData
  const openSignature = true // this should be from ticket type setting
  const showBoM = true // this should be from ticket type setting

  const [open1, setopen1] = React.useState(null);

  const { loading, error, data } = useQuery(GET_TICKET, {
    variables: { id: ticket_id },
    fetchPolicy: "network-only",
    skip: !ticket_id,
  })


  const ticket = useMemo(() => !loading && data && data.ticket ? data.ticket : ticketData, [loading, data, ticketData]);
  if (error) return <ErrorPage error={error} />

  const ticketTypes = !loading && data && data.ticketTypes ? data.ticketTypes : [];
  const ticketStatuses = !loading && data && data.ticketStatuses ? data.ticketStatuses : [];

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
      case "Work Order":
        return <WorkOrder ticket_id={ticket_id} />;
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
      {snackbar && snackbar.open && <GlobalSnackbar {...snackbar} />}
      <Header
        ticket={ticket}
        category={category}
        setopen1={setopen1}
        hideContentDrawer={hideContentDrawer}
        appuser_id={appuser_id}
        toggleOffCRMDrawer={toggleOffCRMDrawer}
      />
      <div className="drawer-wrapper-full p-3">
        <Summary
          loading={loading}
          handleIconButton={handleIconButton}
          customer={ticket}
          ticketTypes={ticketTypes}
          ticketStatuses={ticketStatuses}
          lablesVisible={lablesVisible}
          showSignature={openSignature}
          handleOpenTicket={handleOpenTicket}
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
