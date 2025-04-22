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
          <Badge badgeContent={item.filters?.length} color="primary">
            <FilterList fontSize="small" />
          </Badge>
        </IconButton>
      </Box>
      {openAddFilter && <AddWidget open={openAddFilter} onClose={handleClose} onSave={onSubmit} item={item} />}
    </>
  );
};

export default AddFilter;