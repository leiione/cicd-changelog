import React from "react";
import { IconButton } from "@mui/material";
import { Close as CloseIcon, ArrowForward } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setContentDrawer } from "config/store";
import { find } from "lodash";

const HeaderActions = (props) => {
  const dispatch = useDispatch();
  const {
    ticket,
    category,
    addRecentActionsDrawer,
    dockedItems
  } = props; 

  const closeContentDrawer = (closed = true) => {
		const docked = find(dockedItems, { category: 'Service Desk', id: ticket.ticket_id })
		if (closed && docked && docked.open) {
			addRecentActionsDrawer({ ...docked, remove: true })
		}
    dispatch(setContentDrawer({
      open: false,
      id: 0
    }));
  };
  return (
    <>
			<IconButton
				onClick={() => {
					addRecentActionsDrawer({ ...ticket, category, name: ticket.summary || ticket.type, id: ticket.ticket_id, fromMS: true })
					closeContentDrawer(false)
				}}
				aria-label="Add to Recent Actions"
				size="large"
				className="d-none d-md-inline-block"
			>
				<ArrowForward className="text-light" />
			</IconButton>
			<IconButton
				onClick={closeContentDrawer}
				aria-label="Close"
				className="text-light"
			>
				<CloseIcon />
			</IconButton>
		</>
  );
};

export default HeaderActions;
