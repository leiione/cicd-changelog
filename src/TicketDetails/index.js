import React from "react";
import { preventEvent } from "../Common/helper";
import Header from "./components/Header";
import ChildDrawers from "../Common/ChildDrawers";
import Activity from "./components/Activity";
import Summary from "./components/Summary";
import Tasks from "./components/Tasks";
import BillsOfMaterial from "./components/BillsOfMaterial";

const TicketDetails = (props) => {
  const { lablesVisible, customer, showBoM } = props;
  const [open1, setopen1] = React.useState(null); 

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
      <Header customer={customer} />
      <div className="drawer-wrapper-full p-3">
        <Summary
          handleIconButton={handleIconButton}
          customer={customer}
          lablesVisible={lablesVisible}
        />

        <Tasks
          handleIconButton={handleIconButton}
          customer={customer}
          lablesVisible={lablesVisible}
        />
        {showBoM && (
          <BillsOfMaterial
            handleIconButton={handleIconButton}
            customer={customer}
            showBoM={showBoM}
            lablesVisible={lablesVisible}
          />
        )}
        <Activity
          handleIconButton={handleIconButton}
          customer={customer}
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
