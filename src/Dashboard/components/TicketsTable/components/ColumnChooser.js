import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Grid, 
  Button, 
  FormControlLabel, 
  Switch, 
  Typography 
} from '@mui/material';
import { sortBy } from 'lodash';
import { useForm } from 'react-hook-form';

/**
 * ColumnChooser component allows users to select which columns to display in the table
 */
const ColumnChooser = ({ 
  open, 
  columns, 
  selectedColumns, 
  onClose, 
  onApply, 
  onReset, 
  onRestoreDefaults,
  tableName
}) => {
  // Local state to track column selection during the dialog session
  const [localSelectedColumns, setLocalSelectedColumns] = useState([]);

  const form = useForm({
    defaultValues: selectedColumns
  })

  useEffect(() => {
    form.reset(selectedColumns)
    // eslint-disable-next-line
  }, [tableName])
  
  const { formState: { defaultValues } } = form
  
  // Sync local state with props when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelectedColumns([...selectedColumns]);
    }
  }, [open, selectedColumns]);

  // Handle column toggle with real-time update
  const handleColumnToggle = (columnId) => (event) => {
    let newSelectedColumns;
    if (event.target.checked) {
      // Adding a column is always allowed
      newSelectedColumns = [...localSelectedColumns, columnId];
    } else {
      // Prevent removing the last column
      if (localSelectedColumns.length <= 1) {
        // If this is the last column, don't allow deselecting it
        return;
      }
      newSelectedColumns = localSelectedColumns.filter(id => id !== columnId);
    }
    
    // Update local state
    setLocalSelectedColumns(newSelectedColumns);
    
    // Apply changes immediately - this check is now redundant but kept for safety
    if (newSelectedColumns.length > 0) {
      onApply(newSelectedColumns);
    }
  };

  // Close dialog only - changes are applied in real-time
  const handleClose = () => {
    // Ensure settings are saved before closing
    if (localSelectedColumns.length > 0) {
      onApply(localSelectedColumns);
    }
    onClose();
  };

  // Reset to original selection
  const handleReset = () => {
    const origColumns = [...defaultValues];
    setLocalSelectedColumns(origColumns);
    onApply(origColumns); // Apply changes immediately
  };
  const handleRestoreDefaults = () => {
    const defaultColumns = columns
      .filter(column => column.defaultCol)
      .map(column => column.field);
    setLocalSelectedColumns(defaultColumns);
    onApply(defaultColumns); // Apply changes immediately
    onRestoreDefaults(defaultColumns);
  };

  // Render columns in a grid layout
  const renderColumnSection = (sectionIndex) => {
    const sortedColumns = sortBy(columns.filter(col => col.field !== 'rowActions'), ['headerName']);
    const columnsPerSection = Math.ceil(sortedColumns.length / 4);
    const startIndex = (sectionIndex - 1) * columnsPerSection;
    const endIndex = sectionIndex * columnsPerSection;
    const sectionColumns = sortedColumns.slice(startIndex, endIndex);

    return sectionColumns.map((column) => (
      <FormControlLabel
        key={column.field}
        control={
          <Switch
            checked={localSelectedColumns.includes(column.field)}
            onChange={handleColumnToggle(column.field)}
            color="primary"
          />
        }
        label={column.headerName || column.field}
        style={{ display: 'block', marginBottom: '8px' }}
      />
    ));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="column-chooser-dialog-title"
    >
      <DialogTitle id="column-chooser-dialog-title">
        <Typography variant="h6">Choose Columns to Display</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            {renderColumnSection(1)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderColumnSection(2)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderColumnSection(3)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderColumnSection(4)}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Grid container justifyContent="space-between" alignItems="center" spacing={1}>
          <Grid item>
            <Button 
              onClick={handleRestoreDefaults} 
              color="secondary" 
              variant="contained"
              style={{ marginRight: 8 }}
            >
              Restore Defaults
            </Button>
            <Button 
              onClick={handleReset} 
              color="primary" 
              variant="contained"
            >
              Reset
            </Button>
          </Grid>
          <Grid item>
            <Button 
              onClick={handleClose} 
              color="primary" 
              variant="contained"
            >
              Close
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

ColumnChooser.propTypes = {
  open: PropTypes.bool.isRequired,
  columns: PropTypes.array.isRequired,
  selectedColumns: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onRestoreDefaults: PropTypes.func.isRequired
};

export default ColumnChooser;
