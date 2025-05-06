import React from 'react';
import { FilterList } from '@mui/icons-material';
import {  Badge, Box, IconButton } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setDashboardCards } from 'config/store';
import { cloneDeep } from 'lodash';
import AddWidget from 'Dashboard/components/AddWidget';

const AddFilter = ({ item, items, index, nextId}) => {
  const dispatch = useDispatch();
  const [openAddFilter, setOpenAddFilter] = React.useState(false);

  const handleAddFilter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenAddFilter(true);
  };

  const handleClose = () => {
    setOpenAddFilter(false);
  };


  const onSubmit = (values) => {
    let updatedItems = cloneDeep(items);
    updatedItems[index] = { ...updatedItems[index],...values };

    dispatch(setDashboardCards({
      items: updatedItems,
      nextId
    }));
    handleClose()
  };

  const filterCount = () => {
    let filledFilterCount = 0;

    item.filters.forEach(filter => {
      if (filter.filterType === 'date') {
        // For date filters, check if all fields are filled
        if (filter.value?.length > 0 && ((filter.value[0].operator && filter.value[0].frequency && filter.value[0].period) || filter.value[0].operator === "=")) {
          filledFilterCount++;
        }
      } else {
        // For other filters, check if the filter has a value
        if (Array.isArray(filter.value) ? filter.value.length > 0 : !!filter.value) {
          filledFilterCount++;
        }
      }
    });

    return filledFilterCount;
  };

  return (
    <>
      <Box
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddFilter(e);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <IconButton
          size="small"
          color="primary"
        >
          <Badge badgeContent={filterCount()} color="primary">
            <FilterList fontSize="small" />
          </Badge>
        </IconButton>
      </Box>
      {openAddFilter && <AddWidget open={openAddFilter} onClose={handleClose} onSave={onSubmit} item={item} />}
    </>
  );
};

export default AddFilter;