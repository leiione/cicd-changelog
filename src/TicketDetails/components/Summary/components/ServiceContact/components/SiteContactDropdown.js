import React from "react"
import { IconButton, MenuItem, MenuList, Popover } from "@mui/material"
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import ErrorPage from "components/ErrorPage"
import Loader from "components/Loader"

const SiteContactDropdown = props => {
  const { selectedContact, setSelectedContact, loading, error, data } = props
  const [anchorEl, setAnchorEl] = React.useState(false)
  const open = Boolean(anchorEl);

  const contactOptions = React.useMemo(() => {
    const list = [];
    if (!loading && !error && data && data.serviceContacts) {
      data.serviceContacts.forEach((contact) => {
        list.push({
          label: `${contact.first_name} ${contact.last_name}`,
          value: contact.id,
          ...contact
        })
      })
    }
    return list; // eslint-disable-next-line
  }, [loading, error, data]);

  const handleOnSelect = (value) => {
    setSelectedContact(value)
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton style={{ padding: 0 }} onClick={e => setAnchorEl(e.currentTarget)}>
        {open ?
          <ArrowDropUp className="f-20" />
          : <ArrowDropDown className="f-20" />}
      </IconButton>
      <Popover
        open={open}
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
        {error ? <ErrorPage error={error} />
          : (loading ?
            <div style={{ width: 200 }}>
              <Loader size={14} loaderStyle={{ margin: 5, textAlign: "center" }} />
            </div>
            : <MenuList>
              {contactOptions.length > 0 ?
                contactOptions.map((option, index) => (
                  <MenuItem
                    key={index}
                    selected={selectedContact.value === option.value}
                    onClick={(event) => handleOnSelect(option)}
                  >
                    {option.label}
                  </MenuItem>
                )) :
                <MenuItem disabled>
                  No contacts found
                </MenuItem>
              }
            </MenuList>
          )}
      </Popover>
    </>
  )
}

export default React.memo(SiteContactDropdown)