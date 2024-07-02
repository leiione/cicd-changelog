import React from "react";
import { preventEvent } from "../Common/helper";
import Header from "./components/Header";
import ChildDrawers from "../Common/ChildDrawers";
import Activity from "./components/Activity";
import Summary from "./components/Summary";
import Tasks from "./components/Tasks";
import BillsOfMaterial from "./components/BillsOfMaterial";
import DialogAlert from "components/DialogAlert";

const TicketDetails = (props) => {
  const { lablesVisible, ticket, category } = props;
  const openSignature = true // this should be from ticket type setting
  const showBoM = true // this should be from ticket type setting

  const [open1, setopen1] = React.useState(null);
  const [openDelete, toggleDelete] = React.useState(null);

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
        return "text";
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
        toggleDelete={toggleDelete}
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
      {openDelete && <DialogAlert
        open={openDelete}
        message={<span>Are you sure you want to delete this ticket?</span>}
        buttonsList={[
          {
            label: "Yes",
            size: "medium",
            color: "primary",
            isProgress: true,
            // isSubmitting: loading,
            onClick: () => toggleDelete(false)
          },
          {
            label: "No",
            size: "medium",
            color: "default",
            // disabled: loading,
            onClick: () => toggleDelete(false)
          }
        ]}
      />}
    </div>
  );
};

export default TicketDetails;
