import React from "react";
import { Grid, IconButton, MenuItem, MenuList, Popover, Typography } from "@mui/material";
import { getPriorityIcon } from "utils/getPriorityIcon";

const priorityOptions = ['Low', 'Normal', 'High']

const PriorityField = props => {
  const { values, setValue } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  return (
    <Grid container spacing={1}>
      <Grid item xs={"auto"}>
        <Typography variant="subtitle1" className="text-dark">Priority:</Typography>
      </Grid>
      <Grid item xs={"auto"} style={{ padding: "10px 0px 0px 10px" }}>
        <IconButton style={{ padding: 0 }} onClick={e => setAnchorEl(e.currentTarget)}>
          {getPriorityIcon(values.priority)}
        </IconButton>
      </Grid>
      <Grid item xs={"auto"}>
        <Typography variant="subtitle1" className="text-dark">{values.priority}</Typography>
      </Grid>
      {anchorEl &&
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuList>
            {priorityOptions.map((item, index) => (
              <MenuItem
                key={index}
                selected={item === values.priority}
                onClick={() => {
                  setValue("priority", item)
                  setAnchorEl(null)
                }}
              >
                <>
                  {getPriorityIcon(item)}
                  {`Priority: ${item}`}
                </>
              </MenuItem>
            ))}
          </MenuList>
        </Popover>
      }
    </Grid>
  )
}

export default React.memo(PriorityField);