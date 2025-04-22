import { FormControl, Grid, MenuItem, Select, TextField, Typography } from "@mui/material";
import { getDueDateMessage } from "Dashboard/commonUtils";
import { startCase } from "lodash";

const OPERATORS = [{label: "< Less Than", value: "<"}, {label: "> Greater Than", value: ">"}, {label: "= Due Today", value: "="}];

const DueDateField = ({ handleDateChange, value, index }) => {
  return (
    <Grid container spacing={2} style={index > -1 ? { margin: "-3px 0px 0px 10px" } : {}}>
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
        <Grid item xs={2}>
          <TextField
            fullWidth
            variant="standard"
            type="number"
            inputProps={{ min: 0 }}
            value={value?.frequency || 0}
            onChange={event => handleDateChange(event.target.value, "frequency", index)}
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
            >
              {["days", "weeks", "months"].map((period) => (
                <MenuItem key={period} value={period} >
                  {startCase(period)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {value && value.operator && value.frequency && value.period && (
        <Grid item xs={12} style={{ padding: "0px", marginBottom: "-10%" }}>
          <Typography variant={"caption"}>{getDueDateMessage(value)}</Typography>
        </Grid>
      )}
    </Grid>
  )
};
  
export default DueDateField;