import React, { useMemo } from "react"
import { Grid, IconButton, Menu, MenuItem, MenuList, Typography, TextField } from "@mui/material"
import { useQuery } from "@apollo/client"
import { GET_TICKET_TYPES } from "AddTicket/AddTicketGraphQL"
import ErrorPage from "components/ErrorPage"
import Loader from "components/Loader"
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  paperHeight: {
    maxHeight: 300,
    minWidth: 250,
    overflowY: "auto",
  },
  skeletonLoader: {
   padding: "5px 10px"
  },
  menuList: {
    minHeight: 100
  }
}));

const TicketTypeField = props => {
  const classes = useStyles();
  const { values, setValue } = props
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  const { loading, error, data } = useQuery(GET_TICKET_TYPES, {
    fetchPolicy: "network-only"
  })

  const ticketTypes = useMemo(() => {
    let list = []
    if (!loading && data && data.ticketTypes) {
      data.ticketTypes.forEach((item) => {
        list.push({
          value: item.ticket_type_id,
          label: item.ticket_type_desc
        })
      })
    }
    if (!values.ticket_type_id) {
      list.unshift({ value: 0, label: "" })
    }
    return list
  }, [data, loading, values.ticket_type_id])

  const filteredTicketTypes = useMemo(() => {
    if (!searchQuery) return ticketTypes;
    return ticketTypes.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ticketTypes, searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    event.stopPropagation();
  };

  if (error) return <ErrorPage error={error} />
  const selected = ticketTypes.find(e => e.value === values.ticket_type_id)

  return (
    <Grid container spacing={1}>
      <Grid item xs={"auto"}>
        <Typography variant="subtitle1" className="text-dark">Ticket Type:</Typography>
      </Grid>
      <Grid item xs={"auto"}>
        <Typography variant="subtitle1" className="text-muted">{selected && selected.label ? selected.label : "Select Ticket Type"}</Typography>
      </Grid>
      <Grid item xs={"auto"}>
        <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}>
          {anchorEl ?
            <ArrowDropUp className="f-20" />
            : <ArrowDropDown className="f-20" />}
        </IconButton>
      </Grid>
      {anchorEl &&
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => {
            setSearchQuery("");
            setAnchorEl(null);
          }}
          classes={{ paper: classes.paperHeight }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div className="p-2">
            <TextField
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              fullWidth
              autoFocus
              autoComplete="off"
              variant="standard"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                // Prevent default behavior for arrow keys to stop automatic selection
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.stopPropagation();
                }
              }}
            />
          </div>
          {loading ?
            <Loader size={14} loaderStyle={{ margin: 5, textAlign: "center" }} />
            : <MenuList className={classes.menuList}>
              {filteredTicketTypes.length > 0 ? (
                filteredTicketTypes.map((item, index) => (
                  <MenuItem
                    key={index}
                    selected={item.value === values.ticket_type_id}
                    onClick={() => {
                      setValue("ticket_type_id", item.value)
                      setSearchQuery("");
                      setAnchorEl(null)
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No matching ticket types</MenuItem>
              )}
            </MenuList>}
        </Menu>
      }
    </Grid>
  )
}

export default React.memo(TicketTypeField)