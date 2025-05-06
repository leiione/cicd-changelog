import { RestartAlt } from "@mui/icons-material";
import { FormControl, Grid, IconButton, MenuItem, Select, TextField, Typography } from "@mui/material";
import { isEmpty, startCase } from "lodash";

const OPERATORS = [{label: "< Less Than", value: "<"}, {label: "> Greater Than", value: ">"}, {label: "= Due Today", value: "="}];

const DueDateField = ({ handleDateChange, value, index }) => {
  const resetDate = () => {
    handleDateChange("", "operator", index);
    handleDateChange("", "frequency", index);
    handleDateChange("", "period", index);
  };
  return (
    <Grid container spacing={2} style={{ padding: "15px" }}>
      <Grid item xs={12} style={index > -1 ? { padding: "0px" } : {}}>
        <Typography variant={"caption"}>
          Due Date
        </Typography>
      </Grid>
      <Grid container spacing={2} style={!index && index !== 0 ? { marginLeft: "0px" } : {}}>
        <Grid item xs={4}>
          <FormControl variant="standard" fullWidth>
            <Select
              fullWidth
              labelId="operator-label"
              variant="standard"
              value={value && value.operator ? value.operator : ""}
              onChange={event => handleDateChange(event.target.value, "operator", index)}
            >
              {OPERATORS.map((operator) => (
                <MenuItem key={operator.value} value={operator.value} >
                  {operator.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            variant="standard"
            type="number"
            inputProps={{ min: 0 }}
            value={value?.frequency || 0}
            onChange={event => handleDateChange(event.target.value, "frequency", index)}
            disabled={value && value.operator === "="}
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl variant="standard" fullWidth>
            <Select
              fullWidth
              labelId="period-label"
              variant="standard"
              value={value && value.period ? value.period : ""}
              onChange={event => handleDateChange(event.target.value, "period", index)}
              disabled={value && value.operator === "="}
            >
              {["days", "weeks", "months"].map((period) => (
                <MenuItem key={period} value={period} >
                  {startCase(period)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {value && (value.operator || value.frequency || !isEmpty(value.period)) ?
          <Grid item xs={"auto"} style={{ padding: "15px 0px 0px 10px" }}>
            <IconButton
              size="small"
              onClick={resetDate}
            >
              <RestartAlt fontSize="small" />
            </IconButton>
          </Grid> : null
        }
      </Grid>
    </Grid>
  )
};
  
export default DueDateField;