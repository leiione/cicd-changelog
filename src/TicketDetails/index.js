import React, { useEffect, useMemo, useRef, useState } from "react";
import { preventEvent } from "../Common/helper";
import Header from "./components/Header";
import ChildDrawers from "../Common/ChildDrawers";
import Activity from "./components/Activity";
import Summary from "./components/Summary";
import WorkOrder from "./components/Summary/components/WorkOrder";
import Tasks from "./components/Tasks";
// import BillsOfMaterial from "./components/BillsOfMaterial";
import { GET_TICKET, TICKET_SUBSCRIPTION } from "./TicketGraphQL";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
import { useDispatch, useSelector } from "react-redux";
import GlobalSnackbar from "Common/GlobalSnackbar";
import Messages from "./components/Messages";
import Attachments from "./components/Attachments";
import DialogAlert from "components/DialogAlert"; // Import DialogAlert
import BomDrawer from "./components/BillsOfMaterial/components/BomDrawer";
import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";
import { GET_USER_PREFERENCES, SAVE_USER_PREFERENCES } from "components/UserPreferences/UserPreferencesGraphQL";
import { saveUserPreferences } from "components/UserPreferences/savePreferencesUtils";
import moment from "moment-timezone";
import { populateISPUserSettings, setInitialUserPreferences } from "config/store";
import UserPreferences from "components/UserPreferences";
import QueueJobs from "./components/Summary/components/QueueJobs";
import CustomFields from "./components/CustomFields";
import PropTypes from 'prop-types';
import usePermission from "config/usePermission";
import { checkIfCacheExists } from "config/apollo";

// Set virtual file system for pdfMake - compatible with pdfmake 0.2.10 on Node 18
// if (pdfFonts && typeof pdfFonts === 'object') {
//   if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
//     pdfMake.vfs = pdfFonts.pdfMake.vfs;
//   } else if (pdfFonts.vfs) {
//     pdfMake.vfs = pdfFonts.vfs;
//   } else {
//     console.warn('Could not find valid fonts structure for pdfMake');
//   }
// }

const pdfFonts = {
  // download default Roboto font from cdnjs.com
  Roboto: {
    normal:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf",
    bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf",
    italics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

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

  // Helper function to convert image URL to data URL
  const imageUrlToDataUrl = async (url) => {
    try {
      // Create an image element
      const img = new Image();
      
      // Create a promise that resolves when the image loads or errors
      const imageLoaded = new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      });
      
      // Set crossOrigin to anonymous to handle CORS
      img.crossOrigin = 'anonymous';
      img.src = url;
      
      // Wait for the image to load
      await imageLoaded;
      
      // Create a canvas and draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Convert to data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error(`Error converting image ${url} to data URL:`, error);
      // Return a small transparent image as fallback
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
  };
  
  const handlePrint = async (detailText) => {
    try {
      // Remove duplicate IDs from the HTML content
      const cleanedHtml = removeDuplicateIds(detailText);
      
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanedHtml;
      
      // Find all images
      const images = tempDiv.querySelectorAll('img');
      
      // Process all S3 images
      const imagePromises = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgSrc = img.getAttribute('src');
        
        // Only process remote URLs (including S3)
        if (imgSrc && (imgSrc.startsWith('http') || imgSrc.startsWith('https'))) {
          // Save position in the promises array
          const promiseIndex = imagePromises.length;
          
          // Add the promise to convert this image
          imagePromises.push(imageUrlToDataUrl(imgSrc));
          
          // Tag the image with the promise index for later reference
          img.setAttribute('data-promise-index', promiseIndex.toString());
        }
      }
      
      // Wait for all image conversions to complete
      const dataUrls = await Promise.all(imagePromises);
      
      // Create image dictionary for pdfMake
      const imageDict = {};
      
      // Update image sources with unique IDs pointing to the data URLs
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const promiseIndexStr = img.getAttribute('data-promise-index');
        
        if (promiseIndexStr !== null) {
          const promiseIndex = parseInt(promiseIndexStr, 10);
          const imgId = `img_${promiseIndex}`;
          
          // Add to image dictionary
          imageDict[imgId] = dataUrls[promiseIndex];
          
          // Update image src to use the dictionary ID
          img.setAttribute('src', imgId);
          
          // Remove the temporary attribute
          img.removeAttribute('data-promise-index');
        }
      }
      
      // Get the updated HTML
      const processedHtml = tempDiv.innerHTML;
      
      // Convert processed HTML to pdfmake format
      const pdfContent = htmlToPdfmake(processedHtml, {
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
        },
        // Add the image dictionary for pdfMake to use
        images: imageDict
      };

      // Open the PDF in a new window
      pdfMake.createPdf(docDefinition, null, pdfFonts).open();
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
  const [defaultAttacmentCount, setDefaultAttacmentCount] = React.useState(0);
  const [requiredCustomFieldsCount, setRequiredCustomFieldsCount] = useState(0);
  const [isSignatureAdded, setIsSignatureAdded] = useState(false);
  const {
    lablesVisible,
    ticket: ticketData = {},
    category,
    hideContentDrawer,
    toggleOffCRMDrawer,
    handleOpenTicket,
    appuser_id,
    handleOpenTicketAssignment,
    fromDashboard,
    addRecentActionsDrawer
  } = props;
  const timeZone = useSelector((state) => state.timeZone);
  const snackbar = useSelector((state) => state.snackbar);
  const online = useSelector(state => state.networkStatus?.online || false);
  const attachmentRef = useRef(null);

  const permitMessageView = usePermission("ticket_note_message", "flag_read") 

  const { ticket_id } = ticketData;
  const [open1, setopen1] = useState(null);
  const [ticketCached, setTicketCached] = useState({});

  const { loading, error, data, refetch, client } = useQuery(GET_TICKET, {
    variables: { id: ticket_id, time_zone: timeZone },
    fetchPolicy: online ? "cache-and-network" : "cache-only",
    skip: !ticket_id,
  });

  const cacheExists = checkIfCacheExists(client, { query: GET_TICKET, variables: { id: ticket_id, time_zone: timeZone } })

  const ticket = useMemo(() => (!loading || cacheExists) && data?.ticket ? data.ticket : { ...ticketData },
    [loading, cacheExists, data, ticketData]
  );

  useEffect(() => {
    setTicketCached({ ...ticketCached, ...ticket });
    // eslint-disable-next-line
  }, [ticket])

  useSubscription(TICKET_SUBSCRIPTION, {
    variables: { ticket_id: ticket.ticket_id },
    onData: async ({ data: { data }, client }) => {
      refetch();
    },
  });

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
        ticketData={ticketData}
        ticket={ticketCached}
        setTicketCached={setTicketCached}
        category={category}
        setopen1={setopen1}
        hideContentDrawer={hideContentDrawer}
        appuser_id={appuser_id}
        toggleOffCRMDrawer={toggleOffCRMDrawer}
        handleOpenTicketAssignment={handleOpenTicketAssignment}
        fromDashboard={fromDashboard}
        addRecentActionsDrawer={addRecentActionsDrawer}
      />
      {error ? <ErrorPage error={error} />
        : <div className="drawer-wrapper-full p-3" hidden={error}>
          <Summary
            attachmentRef={attachmentRef}
            loading={loading && !cacheExists}
            appuser_id={appuser_id}
            handleIconButton={handleIconButton}
            customer={ticketCached}
            requiredCustomFieldsCount={requiredCustomFieldsCount}
            defaultAttacmentCount={defaultAttacmentCount}
            lablesVisible={lablesVisible}
            handleOpenTicket={handleOpenTicket}
            setOpenQueueJobs={setOpenQueueJobs}
            isSignatureAdded={isSignatureAdded}
            setIsSignatureAdded={setIsSignatureAdded}
            ticketCached={ticketCached}
            setTicketCached={setTicketCached}
          />

          {!hideInprogress &&
            <>
              <CustomFields
                loading={loading && !cacheExists}
                ticket={ticketCached}
                appuser_id={appuser_id}
                lablesVisible={lablesVisible}
                handleOpenTicket={handleOpenTicket}
                setRequiredCustomFieldsCount={setRequiredCustomFieldsCount}
              />
              <Tasks
                ticket={ticketCached}
                appuser_id={appuser_id}
                lablesVisible={lablesVisible}
                handleOpenTicket={handleOpenTicket}
                addRecentActionsDrawer={addRecentActionsDrawer}
              />
              {permitMessageView &&
                <Messages
                  handleIconButton={handleIconButton}
                  ticket={ticketCached}
                  lablesVisible={lablesVisible}
                  appuser_id={appuser_id}
                />
              }
              <Attachments
                attachmentRef={attachmentRef}
                handleIconButton={handleIconButton}
                ticket={ticketCached}
                lablesVisible={lablesVisible}
                appuser_id={appuser_id}
                setDefaultAttacmentCount={setDefaultAttacmentCount}
                setTicketCached={setTicketCached}
              />
              {/* <BillsOfMaterial
                handleIconButton={handleIconButton}
                customer={ticket}
                lablesVisible={lablesVisible}
                appuser_id={appuser_id}
              /> */}
              <Activity
                handleIconButton={handleIconButton}
                customer={ticketCached}
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
      {openQueueJobs &&
        <QueueJobs
          openQueueJobs={openQueueJobs}
          setOpenQueueJobs={setOpenQueueJobs}
          selectedAddress={ticketCached.address}
          ticket={ticketCached}
          handleOpenTicket={handleOpenTicket}
        />
      }
    </div>
  );
};

const TicketContainer = props => {
  const dispatch = useDispatch()
  const ispId = localStorage.getItem("Visp.ispId")
  const { isSigningOut, timeZone, settingsPreferences, user, flags, networkStatus, fromDashboard = false } = props
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
    skip: isSigningOut || fromDashboard
  });

  useEffect(() => {
    // save user preferences when user is about to sign out
    if (!fromDashboard && isSigningOut && (userPreferencesTimeStamp !== null && moment().diff(moment(userPreferencesTimeStamp)) < 3000)) {
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
  }, [isSigningOut, fromDashboard])

  useEffect(() => {
    // initialize redux based on saved user preferences
    if (!fromDashboard && data && !loading && !isSigningOut) {
      const userPreferences = data.getCRMUserPreferences;
      dispatch(setInitialUserPreferences(userPreferences));
    }
  }, [data, loading, dispatch, isSigningOut, fromDashboard])

  useEffect(() => {
    if (!fromDashboard && (ispId && timeZone)) {
      dispatch(populateISPUserSettings({ ispId: Number(ispId), timeZone, settingsPreferences, user, flags, networkStatus }))
    } else {
      // app was rendered outside main app so fetch separately
    }
  }, [dispatch, timeZone, settingsPreferences, user, ispId, flags, networkStatus, fromDashboard])


  return (
    <>
      <UserPreferences />
      <TicketDetails {...props} />
    </>
  )
}

TicketDetails.propTypes = {
  ticket: PropTypes.shape({
    subscriber_name: PropTypes.string,
    customer_id: PropTypes.number,
    assigned_name: PropTypes.string,
  }).isRequired,
  category: PropTypes.string,
  hideContentDrawer: PropTypes.func,
  toggleOffCRMDrawer: PropTypes.func,
  handleOpenTicket: PropTypes.func,
  appuser_id: PropTypes.number,
  lablesVisible: PropTypes.bool,
};

TicketContainer.propTypes = {
  isSigningOut: PropTypes.bool,
  timeZone: PropTypes.string,
  settingsPreferences: PropTypes.object,
  user: PropTypes.object,
  flags: PropTypes.object,
};

export default TicketContainer;
