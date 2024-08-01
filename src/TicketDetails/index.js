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
import Messages from "./components/Messages";
import Attachments from "./components/Attachments";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const TicketDetails = (props) => {
  const handlePrint = async (detailText) => {
    // Create a temporary DOM element to hold the HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = detailText;
    document.body.appendChild(tempDiv);

    // Use html2canvas to convert the content to a canvas
    const canvas = await html2canvas(tempDiv);
    const imgData = canvas.toDataURL("image/png");

    // Remove the temporary element from the DOM
    document.body.removeChild(tempDiv);

    // Create a PDF and add the image to it
    const doc = new jsPDF();
    doc.addImage(imgData, "PNG", 10, 10);

    // Create a Blob from the PDF and open it in a new tab
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  };

  const [ticketDetail, setTicketDetail] = React.useState(null);

  const {
    lablesVisible,
    ticket: ticketData,
    category,
    hideContentDrawer,
    toggleOffCRMDrawer,
    handleOpenTicket,
    appuser_id,
  } = props;
  const snackbar = useSelector((state) => state.snackbar);

  const { ticket_id } = ticketData;

  const [open1, setopen1] = React.useState(null);

  const { loading, error, data } = useQuery(GET_TICKET, {
    variables: { id: ticket_id },
    fetchPolicy: "network-only",
    skip: !ticket_id,
  });

  const ticket = useMemo(
    () => (!loading && data && data.ticket ? data.ticket : ticketData),
    [loading, data, ticketData]
  );
  if (error) return <ErrorPage error={error} />;

  const ticketTypes =
    !loading && data && data.ticketTypes ? data.ticketTypes : [];
  const ticketStatuses =
    !loading && data && data.ticketStatuses ? data.ticketStatuses : [];

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
        return (
          <WorkOrder ticket_id={ticket_id} setTicketDetail={setTicketDetail} />
        );
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
          handleOpenTicket={handleOpenTicket}
        />

        <Tasks
          handleIconButton={handleIconButton}
          customer={ticket}
          lablesVisible={lablesVisible}
        />
        <Messages
          handleIconButton={handleIconButton}
          customer={ticket}
          lablesVisible={lablesVisible}
        />
        <Attachments
          handleIconButton={handleIconButton}
          customer={ticket}
          lablesVisible={lablesVisible}
        />
        <BillsOfMaterial
          handleIconButton={handleIconButton}
          customer={ticket}
          lablesVisible={lablesVisible}
        />
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
        handlePrint={handlePrint}
        ticketDetail={ticketDetail}
      >
        {renderChildComponent()}
      </ChildDrawers>
    </div>
  );
};

export default TicketDetails;
