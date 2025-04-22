import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Menu, 
  MenuItem, 
  ListItemText,
  IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from "config/store";
import DialogAlert from "components/DialogAlert";
import { useMutation } from '@apollo/client';
import { DELETE_TICKET } from 'TicketDetails/TicketGraphQL';
import { GET_ISP_TICKETS } from 'Dashboard/DashboardGraphQL';

// CSS for hover visibility
const actionStyles = {
  container: {
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '12px',
    opacity: 0, // Hidden by default
    transition: 'opacity 0.2s ease'
  },
  visibleButton: {
    opacity: 1
  }
};

/**
 * Row actions component for tickets table with show-on-hover functionality
 */
const RowActions = ({ params }) => {
  // State with useState hooks
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs
  const containerRef = useRef(null);
  
  // Redux dispatch and state
  const dispatch = useDispatch();
  
  // Get current filter settings from Redux store to use in refetching
  const page = useSelector(state => state.ticketTablePreferences.pageNumber || 0);
  const pageSize = useSelector(state => state.ticketTablePreferences.pageSize || 50);
  const technicianId = useSelector(state => state.ticketTablePreferences.technicianId);
  const statusFilter = useSelector(state => state.ticketTablePreferences.statusFilter || []);
  const priorityFilter = useSelector(state => state.ticketTablePreferences.priorityFilter || []);
  const schedulingFilter = useSelector(state => state.ticketTablePreferences.schedulingFilter || []);
  const dateRange = useSelector(state => state.ticketTablePreferences.dateRange || {});
  
  // Delete ticket mutation
  const [deleteTicket] = useMutation(DELETE_TICKET);

  // Helper to get row element - memoized with useCallback
  const getRowElement = useCallback(() => {
    try {
      // Access row id directly from params.row as defined in the props
      const id = params.row.id || params.id;
      const row = document.querySelector(`[data-id="${id}"]`);
      return row;
    } catch (e) {
      return null;
    }
  }, [params.row.id, params.id]);

  // Event handlers - memoized with useCallback
  const handleRowMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleRowMouseLeave = useCallback(() => {
    if (!anchorEl) {
      setIsHovered(false);
    }
  }, [anchorEl]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!anchorEl) {
      setIsHovered(false);
    }
  }, [anchorEl]);

  const handleClick = useCallback((event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    
    // If mouse is not over the row, hide the button
    const row = getRowElement();
    if (row && !row.matches(':hover')) {
      setIsHovered(false);
    }
  }, [getRowElement]);

  const copyTicketId = useCallback((e) => {
    e.stopPropagation();
    const ticketId = params.row.ticket_id;
    navigator.clipboard.writeText(ticketId.toString())
      .then(() => {
        // Use snackbar notification
        dispatch(
          showSnackbar({
            message: `Copied Ticket ID`,
            severity: "success",
          })
        );
      })
      .catch(error => {
        // Show error snackbar
        dispatch(
          showSnackbar({
            message: "Failed to copy ticket ID",
            severity: "error",
          })
        );
      });
      
    handleClose();
  }, [params.row.ticket_id, dispatch, handleClose]);

  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
    setAnchorEl(null); // Close menu
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    const ticketId = params.row.ticket_id;
    
    setIsSubmitting(true);
    
    try {
      // Build query variables for refetching - same as in TicketsTable component
      const queryVariables = {
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
        sortField: 'ticket_id',
        sortOrder: 'desc',
        flag_subscriber_deleted: false
      };
      
      // Add filters to query variables if they are set
      if (technicianId !== null) {
        queryVariables.technicianId = parseInt(technicianId, 10);
      }
      
      if (statusFilter && statusFilter.length > 0) {
        queryVariables.status = statusFilter;
      }
      
      if (priorityFilter && priorityFilter.length > 0) {
        queryVariables.priority = priorityFilter;
      }
      
      if (schedulingFilter && schedulingFilter.length > 0) {
        queryVariables.scheduled = schedulingFilter;
      }
      
      if (dateRange.startDate || dateRange.endDate) {
        queryVariables.dateRange = dateRange;
      }
      
      // Execute delete ticket mutation with refetch query
      await deleteTicket({
        variables: { id: ticketId },
        refetchQueries: [
          { 
            query: GET_ISP_TICKETS,
            variables: queryVariables
          }
        ],
        awaitRefetchQueries: true
      });
      
      // Show success message
      dispatch(
        showSnackbar({
          message: `Deleted Successfully`,
          severity: "success",
        })
      );
      
      // Close the dialog
      setDeleteDialogOpen(false);
    } catch (error) {
      // Handle error
      const message = error.message.replace("GraphQL error:", "").trim();
      dispatch(
        showSnackbar({
          message: message || "Failed to delete ticket",
          severity: "error",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    params.row.ticket_id, 
    deleteTicket, 
    dispatch, 
    page, 
    pageSize, 
    technicianId, 
    statusFilter, 
    priorityFilter, 
    schedulingFilter, 
    dateRange
  ]);

  // Setup and cleanup event listeners with useEffect
  useEffect(() => {
    // Find the row element and attach hover listeners
    let row = null;
    try {
      const timeoutId = setTimeout(() => {
        row = getRowElement();
        if (row) {
          row.addEventListener('mouseenter', handleRowMouseEnter);
          row.addEventListener('mouseleave', handleRowMouseLeave);
        }
      }, 100);
      
      // Cleanup function for componentWillUnmount
      return () => {
        clearTimeout(timeoutId);
        if (row) {
          row.removeEventListener('mouseenter', handleRowMouseEnter);
          row.removeEventListener('mouseleave', handleRowMouseLeave);
        }
      };
    } catch (e) {
      console.warn('Could not add row hover listeners', e);
      return () => {};
    }
  }, [getRowElement, handleRowMouseEnter, handleRowMouseLeave]);

  // Render component
  const canDelete = true;  // You may want to determine this dynamically

  // Button style based on hover state
  const buttonStyle = {
    ...actionStyles.button,
    ...(isHovered || Boolean(anchorEl) ? actionStyles.visibleButton : {})
  };

  return (
    <div
      ref={containerRef}
      style={actionStyles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <IconButton
        onClick={handleClick}
        style={buttonStyle}
        aria-controls="row-menu"
        aria-haspopup="true"
        size="small"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      
      <Menu
        id="row-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={copyTicketId}>
          <ListItemText>Copy Ticket ID</ListItemText>
        </MenuItem>
        
        {canDelete && (
          <MenuItem onClick={handleDeleteClick}>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
      
      {/* Delete Confirmation Dialog - Using project's DialogAlert component */}
      <DialogAlert
        open={deleteDialogOpen}
        message={`Are you sure you want to delete this ticket?`}
        buttonsList={[
          {
            label: "No",
            size: "medium",
            color: "default",
            disabled: isSubmitting,
            onClick: handleDeleteCancel,
          },
          {
            label: "Yes",
            size: "medium",
            color: "primary",
            isProgress: true,
            isSubmitting: isSubmitting,
            onClick: handleDeleteConfirm,
          }
        ]}
      />
    </div>
  );
};

RowActions.propTypes = {
  params: PropTypes.shape({
    row: PropTypes.shape({
      ticket_id: PropTypes.number.isRequired // Maintaining ticket_id as number to match app standards
    }).isRequired
  }).isRequired
};

export default RowActions;
