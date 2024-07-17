import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import TextField from "@mui/material/TextField";
import { makeStyles } from "@mui/styles";
import { InputAdornment, IconButton, Grid } from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { isEmpty } from "lodash";

const rows = [
  { id: 1, name: "Laptop", quantity: 100, category: "Electronics" },
  { id: 2, name: "Chair", quantity: 45, category: "Furniture" },
  { id: 3, name: "Desk", quantity: 30, category: "Furniture" },
  // Add more rows as needed
];

const useStyles = makeStyles((theme) => ({
  container: {
    padding:theme.spacing(3),
    width: "100%",
    marginTop: "20px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
}));

function LinkedTicketsList() {
  const classes = useStyles();
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState(rows);
  const [showSearch, setShowSearch] = useState(false);

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "quantity", headerName: "Quantity", type: "number", width: 110 },
    { field: "category", headerName: "Category", width: 150 },
  ];

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filtered = rows.filter((row) => {
      return (
        row.name.toLowerCase().includes(value) ||
        row.category.toLowerCase().includes(value)
      );
    });
    setFilteredRows(filtered);
  };

  const handleCancelSearch = (event) => {
    const value = "";
    setSearchText(value);
    const filtered = rows.filter((row) => {
      return (
        row.name.toLowerCase().includes(value) ||
        row.category.toLowerCase().includes(value)
      );
    });
    setFilteredRows(filtered);
    setShowSearch(false)

  };

  return (
    <Grid container alignItems="center">
      <div className={classes.container}>
        <Grid item xs="auto">
          <div className={classes.actions}>
          {showSearch ? (
            <TextField
            variant="outlined"
            value={searchText}
            onChange={handleSearch}
            placeholder="Search…"
            InputProps={{
              endAdornment: !isEmpty(searchText) && (
                <InputAdornment
                  className="equipment-adornment"
                  position="end"
                >
                  <IconButton onClick={handleCancelSearch} size="large">
                    <Close className="f-14" />
                  </IconButton>
                </InputAdornment>
              ),
              inputProps: { className: "px-2 py-1" },
            }}
            InputLabelProps={{ shrink: false }}
            label=""
          />
            ) : (
              <IconButton onClick={() => setShowSearch(true)}  >
                <Search />
              </IconButton>
            )}
           
           
           
           
          </div>
        </Grid>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </div>
    </Grid>
  );
}

export default LinkedTicketsList;
