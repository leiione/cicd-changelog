import React, { useMemo } from "react"
import { Grid, IconButton, Menu, MenuItem, MenuList, Typography } from "@mui/material"
import { useQuery } from "@apollo/client"
import { GET_TICKET_TYPES } from "AddTicket/AddTicketGraphQL"
import ErrorPage from "components/ErrorPage"
import Loader from "components/Loader"
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  paperHeight: {
    maxHeight: 300,
  },
}));

const TicketTypeField = props => {
  const classes = useStyles();
  const { values, setValue } = props
  const [anchorEl, setAnchorEl] = React.useState(null)

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
        <IconButton style={{ padding: 0 }} onClick={e => setAnchorEl(e.currentTarget)}>
          {anchorEl ?
            <ArrowDropUp className="f-20" />
            : <ArrowDropDown className="f-20" />}
        </IconButton>
      </Grid>
      {anchorEl &&
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
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
          {loading ?
            <Loader size={14} loaderStyle={{ margin: 5, textAlign: "center" }} />
            : <MenuList>
              {ticketTypes.map((item, index) => (
                <MenuItem
                  key={index}
                  selected={item.value === values.ticket_type_id}
                  onClick={() => {
                    setValue("ticket_type_id", item.value)
                    setAnchorEl(null)
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </MenuList>}
        </Menu>
      }
    </Grid>
  )
}

export default React.memo(TicketTypeField)