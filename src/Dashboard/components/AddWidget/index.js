import React, { useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Grid,
  IconButton,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HookTextField from "../../../Common/hookFields/HookTextField";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { filterTypeOptions } from "Dashboard/commonUtils";
import DueDateField from "../TicketWidget/components/AddFilter/components/DueDateField";
import AssigneeField from "../TicketWidget/components/AddFilter/components/AssigneeField";
import StatusField from "../TicketWidget/components/AddFilter/components/StatusField";
import ProgressButton from "Common/ProgressButton";
import TicketTypeField from "../TicketWidget/components/AddFilter/components/TicketTypeField";
import { HighlightOffOutlined } from "@mui/icons-material";

dayjs.extend(utc);
dayjs.extend(timezone);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '45%',
  bgcolor: 'background.paper',
  borderRadius: "5px",
  padding: "16px 0px 0px 16px"
};

const FilterOptions = ({ filterType, control, index, filters, setValue }) => {
  const handleDateChange = (value, field, index) => {
    const curValue = filters[index].value && filters[index].value.length > 0 ? filters[index].value[0] : {};
    setValue(`filters.${index}.value`, [{ ...curValue, [field]: value }]);
  };

  switch (filterType) {
    case "date":
      return <DueDateField index={index} handleDateChange={handleDateChange} value={filters[index].value[0]} />
    case "assignee":
      return <AssigneeField control={control} name={`filters.${index}.value`} />;
    case "status":
      return <StatusField control={control} name={`filters.${index}.value`} />;
    case "type":
      return <TicketTypeField control={control} name={`filters.${index}.value`} />;
    default:
      return null;
  }
};

const AddWidget = ({ open, onClose, onSave, item }) => {

  const initialValues = useMemo(() => {
    const initFilter = item && item.filters && item.filters.length > 0 ?
      { title: item.title, filters: item.filters } :
      { title: "", filters: [{ filterType: "", value: [] }] };
    return initFilter;
  }, [item]);

  const form = useForm({
    defaultValues: initialValues,
    mode: "onChange",
    reValidateMode: "onSubmit",
  });

  useEffect(() => {
    if (item && item.title && item.filters) {
      form.reset({ title: item.title, filters: item.filters })
    }
    // eslint-disable-next-line
  }, [item]);

  const { control, handleSubmit, watch, setValue, reset } = form;

  const handleClose = () => {
    reset(initialValues);
    onClose();
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "filters",
  });

  const values = watch();
  const filters = values.filters || [];

  const handleFilterTypeChange = (index, value) => {
    setValue(`filters.${index}.filterType`, value);
    setValue(`filters.${index}.value`, value === "date" ? new Date() : []); // Initialize with current date for date type
  };

  const onSubmit = (data) => {
    onSave(data);
    handleClose();
  };

  const handleAddFilter = () => {
    append({ filterType: "", value: [] }); // Initialize with empty array
  };

  const isFormValid = values.title && values.title.trim() !== "" && filters.every((filter) => {
    // Every filter must have both a type and a valid value
    if (!filter.filterType) return false;

    // For date type, ensure the value is valid
    if (filter.filterType === 'date') {
      return filter.value?.length > 0 && filter.value[0].operator && filter.value[0].frequency && filter.value[0].period;
    }

    // For other filter types, ensure there's at least one value selected
    return Array.isArray(filter.value) ? filter.value.length > 0 : !!filter.value;
  });

  const canAddFilter = filters[filters.length - 1]?.filterType &&
    (Array.isArray(filters[filters.length - 1]?.value)
      ? filters[filters.length - 1]?.value.length > 0
      : filters[filters.length - 1]?.value);

  return (
    <Modal open={open}>
      <Box sx={style}>
        <Grid container spacing={2}>
          <Grid item xs={12} className="bg-lighter" style={{ borderRadius: "5px 5px 0px 0px", padding: "7px 15px" }}>
            <Typography variant="h6" className="text-dark">{item ? "Edit Widget Filter" : "Add Widget"}</Typography>
          </Grid>
          <Grid container spacing={3} style={{ padding: "10px" }}>
            <Grid item xs={4}>
              <HookTextField
                name="title"
                label="Title"
                control={control}
                required
                fullWidth
              />
            </Grid>
            {fields.map((field, index) => {
              const filterType = filters[index]?.filterType;
              const disabledTypes = values.filters.filter((_, i) => i !== index).map(item => item.filterType).flat()

              return (
                <Grid item xs={12} key={field.id}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <FormControl fullWidth variant="standard">
                        <InputLabel>Filter Type*</InputLabel>
                        <Controller
                          name={`filters.${index}.filterType`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              onChange={(e) => handleFilterTypeChange(index, e.target.value)}
                              label="Filter Type"
                              placeholder="Select filter type"
                              displayEmpty
                              required
                            >
                              {filterTypeOptions.map((option) => {
                                return (
                                  <MenuItem key={option.value} value={option.value} disabled={disabledTypes.includes(option.value)}>
                                    {option.label}
                                  </MenuItem>
                                  )
                                }
                              )}
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      {filterType ? (
                        <FormControl fullWidth variant="standard">
                          <FilterOptions
                            filters={filters}
                            setValue={setValue}
                            filterType={filterType}
                            control={control}
                            index={index}
                          />
                        </FormControl>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ pt: 2 }}>
                          Select Filter Type
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={"auto"} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {fields.length > 1 && (
                        <IconButton size="small" onClick={() => remove(index)} color="error">
                          <HighlightOffOutlined fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={handleAddFilter}
                        color="primary"
                        disabled={!canAddFilter}
                      >
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              );
            })}
            <Grid item xs={12}>
              <div className="text-right">
                <ProgressButton
                  variant="outlined"
                  color="primary"
                  size="small"
                  style={{ padding: "5px" }}
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isFormValid}
                >
                  Save
                </ProgressButton>
                <Button color="default" variant="outlined" size="small" style={{ padding: "5px" }} onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AddWidget;
