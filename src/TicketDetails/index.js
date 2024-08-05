import React, { useMemo, useState } from "react";
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
import { useSelector } from "react-redux";
import GlobalSnackbar from "Common/GlobalSnackbar";
import Messages from "./components/Messages";
import Attachments from "./components/Attachments";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import DialogAlert from "components/DialogAlert"; // Import DialogAlert

const TicketDetails = (props) => {
  const handlePrint = async (detailText) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = detailText;
    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv);
    const imgData = canvas.toDataURL("image/png");

    document.body.removeChild(tempDiv);

    const doc = new jsPDF();
    doc.addImage(imgData, "PNG", 10, 10);

    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  };

  const [ticketDetail, setTicketDetail] = useState(null);
  const [editorContentChanged, setEditorContentChanged] = useState(false); // State to track editor changes
  const [dialogOpen, setDialogOpen] = useState(false); // State for DialogAlert
  const [handleSave, setHandleSave] = useState(null); // State to hold handleSave function

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

  const [open1, setopen1] = useState(null);

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
    if (editorContentChanged) {
      setDialogOpen(true); // Open the dialog if there are unsaved changes
    } else {
      setopen1(null);
    }
  };

  const handleDialogClose = (action) => {
    if (action === "save") {
      if (handleSave) {
        handleSave().then(() => {
          setopen1(null);
        });
      }
    } else if (action === "discard") {
      // Reset states to ensure subsequent changes are detected
      setEditorContentChanged(false);
      setTimeout(() => {
        setopen1(null); // Discard changes and close drawer
      }, 100); // Small delay to ensure state is reset
    }
    setDialogOpen(false);
  };

  const renderChildComponent = () => {
    switch (open1) {
      case "Notes and Alerts":
        return "Coming Soon";
      case "Work Order":
        return (
            <WorkOrder
                ticket_id={ticket_id}
                setTicketDetail={setTicketDetail}
                setEditorContentChanged={setEditorContentChanged} // Pass the state setter to the WorkOrder component
                setHandleSave={setHandleSave} // Pass the setHandleSave function to the WorkOrder component
            />
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
            editorContentChanged={editorContentChanged} // Pass the state to ChildDrawers
        >
          {renderChildComponent()}
        </ChildDrawers>
        {dialogOpen && (
            <DialogAlert
                open={dialogOpen}
                message={
                  <span>
              You have unsaved changes. Would you like to save or discard them?
            </span>
                }
                buttonsList={[
                  {
                    label: "Save",
                    size: "medium",
                    color: "primary",
                    onClick: () => handleDialogClose("save"),
                  },
                  {
                    label: "Discard",
                    size: "medium",
                    color: "default",
                    onClick: () => handleDialogClose("discard"),
                  },
                ]}
            />
        )}
      </div>
  );
};

export default TicketDetails;
