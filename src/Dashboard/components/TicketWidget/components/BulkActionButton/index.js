import { useMutation } from '@apollo/client';
import { Box, Button, Grid, Menu, MenuItem, Modal, Tooltip, Typography } from '@mui/material';
import ProgressButton from 'Common/ProgressButton';
import { showSnackbar } from 'config/store';
import { BULK_UPDATE_TICKETS, GET_FILTERED_TICKETS } from 'Dashboard/DashboardGraphQL';
import { startCase, uniq } from 'lodash';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 355,
  bgcolor: 'background.paper',
  borderRadius: "5px",
  padding: "16px 0px 0px 16px"
};


const BulkActionModal = props => {
  const dispatch = useDispatch()
  
  const { open, onClose, action, hasUnmetReqIds, checkedRows, widgetVar, setCheckedRows, setHasUnmetReqIds } = props;
  const [bulkUpdateTickets] = useMutation(BULK_UPDATE_TICKETS);
  const [loading, setLoading] = useState(false);

  let blockedTickets = []
  if (["resolve", "close"].includes(action)) {
    blockedTickets = action === "resolve" ? hasUnmetReqIds.blockedResolve : hasUnmetReqIds.blockedClosed;
    blockedTickets = blockedTickets.filter(id => checkedRows.includes(id));
  }
  blockedTickets = uniq(blockedTickets);

  const onSubmit = async () => {
    try {
      setLoading(true)
      await bulkUpdateTickets({
        variables: { includedTicketIds: checkedRows, bulkAction: action },
        refetchQueries: [
          { 
            query: GET_FILTERED_TICKETS,
            variables: widgetVar
          }
        ]
      });
      dispatch(showSnackbar({ message: `Updated ${checkedRows.length} tickets successfully`, severity: "success" }))
      setCheckedRows([])
      setHasUnmetReqIds({ blockedResolve: [], blockedClosed: [] })
      onClose();
    } catch (e) {
      setLoading(false);
      const message = e.message.split("GraphQL error:");
      dispatch(showSnackbar({ message, severity: "error" }));
    }
  };

  const deleteMessage =
    checkedRows.length === 1
      ? `Are you sure you want to ${action} this 1 ticket?`
      : `Are you sure you want to ${action} these ${checkedRows.length} tickets?`;
  
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Grid container spacing={2}>
          <Grid item xs={12} className="bg-lighter" style={{ borderRadius: "5px 5px 0px 0px", padding: "7px 15px" }}>
            <Typography variant="h6" className="text-dark">{`${startCase(action)} Bulk Action`}</Typography>
          </Grid>
          <Grid container spacing={2} style={{ padding: "20px 15px" }}>
            {blockedTickets.length > 0 ?
              <Grid item xs={12}>
                <Typography variant="body1">
                  Ticket No.{" "}
                  {blockedTickets.map((ticket, index) => (
                    <Typography
                      key={ticket}
                      component="span"
                      color="primary"
                    >
                      {ticket}
                      {index < blockedTickets.length - 1 ? ", " : " "}
                    </Typography>
                  ))}
                  has unmet requirements.
                </Typography>
              </Grid>
            : <Grid item xs={12}>
              <Typography variant="subtitle1">{deleteMessage}</Typography>
            </Grid>
          }
          </Grid>
          <Grid item xs={12}>
            <div className="text-right">
              {blockedTickets.length > 0 ?
                <Button color="default" variant="outlined" size="small" style={{ padding: "5px" }} onClick={onClose}>
                  Ok
                </Button>
                : <>
                  <ProgressButton
                    variant="outlined"
                    color="primary"
                    size="small"
                    style={{ padding: "5px" }}
                    onClick={onSubmit}
                    isSubmitting={loading}
                  >
                    Yes
                  </ProgressButton>
                  <Button color="default" variant="outlined" size="small" style={{ padding: "5px" }} onClick={onClose}>
                    No
                  </Button>
                </>
              }
            </div>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};


const BulkActionButton = ({ hasUnmetReqIds, checkedRows, widgetVar, setCheckedRows, setHasUnmetReqIds }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePromptClose = () => {
    setBulkAction(null)
    handleClose()
  }

  const handleBulkAction = (action) => {
    setBulkAction(action)
  };

  return (
    <Box>
      <Tooltip title={checkedRows.length === 0 ? "Select tickets to enable bulk actions" : ""}>
      <span>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          disabled={checkedRows.length === 0}
        >
          Bulk Action
          </Button>
        </span>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleBulkAction("resolve")}>Resolve</MenuItem>
        <MenuItem onClick={() => handleBulkAction("close")}>Close</MenuItem>
        <MenuItem onClick={() => handleBulkAction("delete")}>Delete</MenuItem>
      </Menu>
      {bulkAction &&
        <BulkActionModal
          open={open}
          onClose={handlePromptClose}
          action={bulkAction}
          hasUnmetReqIds={hasUnmetReqIds}
          checkedRows={checkedRows}
          setCheckedRows={setCheckedRows}
          setHasUnmetReqIds={setHasUnmetReqIds}
          widgetVar={widgetVar}
        />
      }
    </Box>
  );
};

export default BulkActionButton;