import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  CircularProgress,
  MenuItem,
  Grid,
  Typography,
  Tooltip,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { debounce } from "lodash";
import { client } from "config/apollo";
import { GET_TICKETS_QUERY } from "TicketDetails/TicketGraphQL";
import { getPriorityIcon } from "utils/getPriorityIcon";
import AvatarText from "Common/AvatarText";
// import AvatarText from "Common/AvatarText";

const LinkedTicketField = (props) => {
  const { ticket, setUserSelectedRows,inputValue,setInputValue,userSelectedRows } = props;
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSetInputValue = debounce((newInputValue) => {
    setInputValue(newInputValue);
  }, 300);

  const handleInputChange = useCallback(
    (newInputValue) => {
      debouncedSetInputValue(newInputValue);
    },
    [debouncedSetInputValue] // No need to include debounce here, as the function is stable
  );
  useEffect(() => {
    const fetchData = async () => {
      if (inputValue) {
        try {
          setLoading(true);
          const { data, loading } = await client.query({
            query: GET_TICKETS_QUERY,
            variables: { searchVal: inputValue, ticket_id: ticket.ticket_id },
            fetchPolicy: "network-only",
            skip: !inputValue, // Skip the query if debouncedSearchTerm is empty
          });

          let list = [];

          if (inputValue && !loading && data && data.tickets.tickets) {
            data.tickets.tickets.forEach((item) => {
              list.push({
                ...item,
                label: `${item.ticket_id} ${item.description}`,
                value: item.ticket_id,
              });
            });
          }

          if (list.length === 0 && !inputValue) {
            list.push({
              label: "Type to search for Tickets",
              value: "type",
              disabled: true,
            });
          }

          setOptions(list);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setOptions([]);
      }
    };

    fetchData();
  }, [inputValue, ticket.ticket_id]);

  return (
    <div style={{ marginLeft: "3%" }}>
      <Autocomplete
        multiple
        value={userSelectedRows}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onInputChange={(event, newInputValue) =>
          handleInputChange(newInputValue)
        }
        isOptionEqualToValue={(option, value) =>
          option.ticket_id === value.ticket_id
        }
        onChange={(event, newValue) => setUserSelectedRows(newValue)}
        options={options}
        loading={loading}
        getOptionLabel={(option) => `${option.ticket_id}`}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <MenuItem
              key={option.ticket_id} // Pass the key directly here
              style={{ height: 40 }}
              {...otherProps}
            >
              <Grid container spacing={1}>
                <Grid item xs={1.5}>
                  <Typography variant="subtitle1" className="text-primary">
                    {option.ticket_id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" className="text-dark">
                    {option.description}
                  </Typography>
                </Grid>
                <Grid item xs={4.5} className="text-right">
                  <div className="d-inline-flex">
                    <span style={{ margin: "0px 10px" }}>
                      <Tooltip title={option.priority} placement="top">
                        {getPriorityIcon(option.priority)}
                      </Tooltip>
                    </span>
                        {option.technician &&
                            <AvatarText
                              title={option.technician}
                              charCount={1}
                              sx={{ width: 16, height: 16, margin: "3px 10px", background: "#4b89ff", fontSize: "11px" }}
                            />
                          }

                    <Typography variant="subtitle1" className="text-dark">
                      {option.status}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </MenuItem>
          );
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              label="Search Tickets"
              variant="standard"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          );
        }}
      />
    </div>
  );
};

export default React.memo(LinkedTicketField);
