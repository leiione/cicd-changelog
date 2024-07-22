import React, { useState } from "react";
import { IconButton, MenuItem, MenuList, Popover, Typography } from "@mui/material";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";

const typeOptions = ['Subscriber', 'Infrastructure', 'Equipment']

const AssignmentType = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { values, setValue } = props;

  return (
    <>
      <Typography variant="subtitle1" className="text-muted">
        {values.category_type || "Select Assignment Type"}
        <IconButton style={{ padding: 0 }} onClick={e => setAnchorEl(e.currentTarget)}>
          {anchorEl ?
            <ArrowDropUp className="f-20" />
            : <ArrowDropDown className="f-20" />}
        </IconButton>
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
              horizontal: 'center',
            }}
          >
            <MenuList>
              {typeOptions.map((type, index) => (
                <MenuItem
                  key={index}
                  selected={type === values.category_type}
                  onClick={() => {
                    setValue("category_type", type)
                    setValue("customer_id", 0)
                    setValue("location_id", 0)
                    setValue("equipment_id", 0)
                    setAnchorEl(null)
                  }}
                >
                  {type}
                </MenuItem>
              ))}
            </MenuList>
          </Popover>
        }
      </Typography>
    </>
  )
}

export default React.memo(AssignmentType);