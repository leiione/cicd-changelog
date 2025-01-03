import React from "react"
import { IconButton, MenuItem, MenuList, Popover, Typography } from "@mui/material"
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import ErrorPage from "components/ErrorPage"
import Loader from "components/Loader"
import { includes, sortBy } from "lodash"
import { formatPhoneNumber, getFormattedPGAddress } from "utils/formatter"

import PropTypes from 'prop-types';

const SiteContactDropdown = props => {
  const { values, loading, error, data, setValue } = props
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

  const handleOnSelect = (selected) => {
    const phone = selected.phone_numbers ? sortBy(
      selected.phone_numbers.filter((x) => includes(["home", "work"], x.type)), ["type"]
    ).map((phone) => formatPhoneNumber(phone.number)) : []
    const email = selected.email_addresses ? selected.email_addresses.map((mail) => mail.email) : ""
    setValue('site_contact_id', selected.value, { shouldValidate: true, shouldDirty: true })
    setValue('ticket_contact_name', `${selected.first_name} ${selected.last_name}`, { shouldValidate: true, shouldDirty: true })
    setValue('ticket_contact_numbers', phone.join(','), { shouldValidate: true, shouldDirty: true })
    setValue('ticket_contact_emails', email.join(','), { shouldValidate: true, shouldDirty: true })
    setValue('address', getFormattedPGAddress(selected.address), { shouldValidate: true, shouldDirty: true })
    setAnchorEl(null)
  }

  const selectedContact = React.useMemo(() => {
    const contact = contactOptions.find((contact) => contact.value === values.site_contact_id)
    return contact
  }, [contactOptions, values.site_contact_id])

  return (
    <Typography variant="subtitle1">
      {selectedContact && selectedContact.value > 0
        ? selectedContact.label
        : "Choose Contact"}
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
                    selected={values.site_contact_id === option.value}
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
    </Typography>
  )
}

SiteContactDropdown.propTypes = {
  values: PropTypes.shape({
    site_contact_id: PropTypes.number.isRequired,
  }).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.object,
  data: PropTypes.object,
  setValue: PropTypes.func.isRequired,
};

export default React.memo(SiteContactDropdown)