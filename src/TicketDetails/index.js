import React, { useEffect, useMemo, useState } from "react";
import { preventEvent } from "../Common/helper";
import Header from "./components/Header";
import ChildDrawers from "../Common/ChildDrawers";
import Activity from "./components/Activity";
import Summary from "./components/Summary";
import WorkOrder from "./components/Summary/components/WorkOrder";
import Tasks from "./components/Tasks";
// import BillsOfMaterial from "./components/BillsOfMaterial";
import { GET_TICKET } from "./TicketGraphQL";
import { useMutation, useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
import { useDispatch, useSelector } from "react-redux";
import GlobalSnackbar from "Common/GlobalSnackbar";
import Messages from "./components/Messages";
import Attachments from "./components/Attachments";
import DialogAlert from "components/DialogAlert"; // Import DialogAlert
import BomDrawer from "./components/BillsOfMaterial/components/BomDrawer"; 
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";
import { GET_USER_PREFERENCES, SAVE_USER_PREFERENCES } from "components/UserPreferences/UserPreferencesGraphQL";
import { saveUserPreferences } from "components/UserPreferences/savePreferencesUtils";
import moment from "moment-timezone";
import { setInitialUserPreferences } from "config/store";
import UserPreferences from "components/UserPreferences";
import QueueJobs from "./components/Summary/components/QueueJobs";
import CustomFields from "./components/CustomFields";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const TicketDetails = (props) => {
  const removeDuplicateIds = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const elementsWithId = doc.querySelectorAll('[id]');

    elementsWithId.forEach((element, index) => {
      // Append a unique suffix to each duplicate id
      element.id += `-${index}`;
    });

    return doc.body.innerHTML;
  };

  const handlePrint = (detailText) => {
    try {
      // Remove duplicate IDs from the HTML content
      const cleanedHtml = removeDuplicateIds(detailText);

      // Convert cleaned HTML to pdfmake format
      const pdfContent = htmlToPdfmake(cleanedHtml, {
        window: window, // Required for html-to-pdfmake to work correctly
      });

      // Create a document definition for pdfmake
      const docDefinition = {
        content: pdfContent,
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          htmlContent: {
            fontSize: 12,
            margin: [0, 0, 0, 10]
          }
        }
      };

      // Open the PDF in a new window
      pdfMake.createPdf(docDefinition).open();
    } catch (error) {
      console.error("Failed to create and open PDF:", error);
    }
  };

  const [ticketDetail, setTicketDetail] = useState(null);
  const [editorContentChanged, setEditorContentChanged] = useState(false); // State to track editor changes
  const [dialogOpen, setDialogOpen] = useState(false); // State for DialogAlert
  const [handleSave, setHandleSave] = useState(null); // State to hold handleSave function
  const hideInprogress = false // just mark this false during development
  const [openQueueJobs, setOpenQueueJobs] = useState(false); // State for QueueJobs drawer
  const [selectedAddress, setSelectedAddress] = React.useState();
  const [defaultAttacmentCount, setDefaultAttacmentCount] = React.useState(0);
  const {
    lablesVisible,
    ticket: ticketData,
    category,
    hideContentDrawer,
    toggleOffCRMDrawer,
    handleOpenTicket,
    appuser_id,
    enableQueueJobs,
  } = props;
  const snackbar = useSelector((state) => state.snackbar);

  const { ticket_id } = ticketData;

  const [open1, setopen1] = useState(null);

  const { loading, error, data } = useQuery(GET_TICKET, {
    variables: { id: ticket_id },
    fetchPolicy: "network-only",
    skip: !ticket_id,
  });

  const ticket = useMemo(() => (!loading && data && data.ticket ? data.ticket : ticketData),
    [loading, data, ticketData]
  );

  const ticketTypes = !loading && data && data.ticketTypes ? data.ticketTypes : [];
  const ticketStatuses = !loading && data && data.ticketStatuses ? data.ticketStatuses : [];

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
      case "Bills of Material":
        return <BomDrawer />;
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
      {error ? <ErrorPage error={error} />
        : <div className="drawer-wrapper-full p-3" hidden={error}>
          <Summary
            loading={loading}
            appuser_id={appuser_id}
            handleIconButton={handleIconButton}
            customer={ticket}
            ticketTypes={ticketTypes}
            ticketStatuses={ticketStatuses}
            defaultAttacmentCount={defaultAttacmentCount}
            lablesVisible={lablesVisible}
            handleOpenTicket={handleOpenTicket}
            setOpenQueueJobs={setOpenQueueJobs}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            enableQueueJobs={enableQueueJobs}
          />

          {!hideInprogress &&
            <>
             <CustomFields
                loading={loading}
                ticket={ticket}
                appuser_id={appuser_id}
                lablesVisible={lablesVisible}
                handleOpenTicket={handleOpenTicket}
              />
              <Tasks
                loading={loading}
                ticket={ticket}
                appuser_id={appuser_id}
                lablesVisible={lablesVisible}
                handleOpenTicket={handleOpenTicket}
              />
              <Messages
                handleIconButton={handleIconButton}
                ticket={ticket}
                lablesVisible={lablesVisible}
                appuser_id={appuser_id}
              />
              <Attachments
                handleIconButton={handleIconButton}
                ticket={ticket}
                lablesVisible={lablesVisible}
                appuser_id={appuser_id}
                setDefaultAttacmentCount={setDefaultAttacmentCount}
              />
              {/* <BillsOfMaterial
                handleIconButton={handleIconButton}
                customer={ticket}
                lablesVisible={lablesVisible}
                appuser_id={appuser_id}
              /> */}
              <Activity
                handleIconButton={handleIconButton}
                customer={ticket}
                lablesVisible={lablesVisible}
                appuser_id={appuser_id}
              />
            </>
          }
        </div>
      }
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
      { openQueueJobs &&
        <QueueJobs openQueueJobs={openQueueJobs} setOpenQueueJobs={setOpenQueueJobs} selectedAddress={selectedAddress} />
      }
    </div>
  );
};

const TicketContainer = props => {
  const dispatch = useDispatch()
  const { isSigningOut } = props
  const userPreferencesTimeStamp = useSelector(state => state.userPreferencesTimeStamp)
  const summaryCard = useSelector(state => state.summaryCard)
  const tasksCard = useSelector(state => state.tasksCard)
  const messagesCard = useSelector(state => state.messagesCard)
  const attachmentsCard = useSelector(state => state.attachmentsCard)
  const billOfMaterialCard = useSelector(state => state.billOfMaterialCard)
  const activityCard = useSelector(state => state.activityCard)

  const [saveCRMUserPreferences] = useMutation(SAVE_USER_PREFERENCES)

  const { data, loading } = useQuery(GET_USER_PREFERENCES, {
    fetchPolicy: "cache-and-network",
    skip: isSigningOut
  });

  useEffect(() => {
    // save user preferences when user is about to sign out
    if (isSigningOut && (userPreferencesTimeStamp !== null && moment().diff(moment(userPreferencesTimeStamp)) < 3000)) {
      saveUserPreferences(saveCRMUserPreferences, {
        summaryCard,
        tasksCard,
        messagesCard,
        attachmentsCard,
        billOfMaterialCard,
        activityCard
      })
    }
    // eslint-disable-next-line
  }, [isSigningOut])

  useEffect(() => {
    // initialize redux based on saved user preferences
    if (data && !loading && !isSigningOut) {
      const userPreferences = data.getCRMUserPreferences;
      dispatch(setInitialUserPreferences(userPreferences));
    }
  }, [data, loading, dispatch, isSigningOut])

  return (
    <>
      <UserPreferences />
      <TicketDetails {...props} />
    </>
  )
}

export default TicketContainer;
