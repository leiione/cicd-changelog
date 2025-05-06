import React, { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Grid,
  Button,
  FormControl,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import HookTextField from "../../../Common/hookFields/HookTextField";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { filterTypes } from "Dashboard/commonUtils";
import DueDateField from "../TicketWidget/components/AddFilter/components/DueDateField";
import AssigneeField from "../TicketWidget/components/AddFilter/components/AssigneeField";
import StatusField from "../TicketWidget/components/AddFilter/components/StatusField";
import ProgressButton from "Common/ProgressButton";
import TicketTypeField from "../TicketWidget/components/AddFilter/components/TicketTypeField";
import { findIndex } from "lodash";

dayjs.extend(utc);
dayjs.extend(timezone);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '25%',
  bgcolor: 'background.paper',
  borderRadius: "5px",
  padding: "16px 0px 0px 16px"
};

const FilterOptions = ({ filterType, control, index, filters, setValue }) => {
  const handleDateChange = (value, field, index) => {
    const curValue = filters[index].value && filters[index].value.length > 0 ? filters[index].value[0] : {};
    if (field === "operator" && value === "=") {
      curValue.frequency = 0
      curValue.period = ""
    }
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

    const filterFields = []
    filterTypes.forEach(type => {
      const fIdx = findIndex(initFilter.filters, { filterType: type })
      if (fIdx > -1) {
        filterFields.push(initFilter.filters[fIdx])
      } else {
        filterFields.push({ filterType: type, value: [] })
      }
    })
    
    return { ...initFilter, filters: filterFields };
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

  const { fields } = useFieldArray({
    control, name: "filters",
  });

  const values = watch();
  const filters = values.filters || [];

  const onSubmit = (data) => {
    onSave(data);
    handleClose();
  };

  const isFormValid = values.title && values.title.trim() !== "" && filters.some((filter) => {
    // For date type, ensure the value is valid
    if (filter.filterType === 'date') {
      return filter.value?.length > 0 && ((filter.value[0].operator && Number(filter.value[0].frequency) > 0 && filter.value[0].period) || filter.value[0].operator === "=");
    }
    return Array.isArray(filter.value) ? filter.value.length > 0 : !!filter.value;
  });

  const isDatePartiallyFilled = () => {
  const dateFilter = filters.find(filter => filter.filterType === 'date'); // Find the date filter
  if (!dateFilter || !dateFilter.value?.length) return false; // No date filter or empty value

  const { operator, frequency, period } = dateFilter.value[0];
  const filledCount = [operator, frequency, period].filter(Boolean).length;
  // Return true if 1 or 2 fields are filled (invalid case)
  return filledCount > 0 && filledCount < 3 && operator !== "=";
};
  
  const isSaveButtonDisabled = !isFormValid || isDatePartiallyFilled();

  return (
    <Modal open={open}>
      <Box sx={style}>
        <Grid container spacing={2}>
          <Grid item xs={12} className="bg-lighter" style={{ borderRadius: "5px 5px 0px 0px", padding: "7px 15px" }}>
            <Typography variant="h6" className="text-dark">{item ? "Edit Widget Filter" : "Add Widget"}</Typography>
          </Grid>
          <Grid container spacing={3} style={{ padding: "10px" }}>
            <Grid item xs={12}>
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
              return (
                <Grid item xs={12} key={field.id}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="standard">
                          <FilterOptions
                            filters={filters}
                            setValue={setValue}
                            filterType={filterType}
                            control={control}
                            index={index}
                          />
                      </FormControl>
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
                  disabled={isSaveButtonDisabled}
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
