import React, { useMemo } from "react"
import PropTypes from 'prop-types';
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import { Divider, Grid, IconButton, MenuItem, MenuList, Popover, Typography } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope } from "@fortawesome/pro-regular-svg-icons"



const EmailDropdown = props => {
  const { onEditMode, contact, values, setValue, isSubscriber, handleEmailClick, permitMessageView } = props
  const [anchorEl, setAnchorEl] = React.useState(false)
  const open = Boolean(anchorEl);

  const emails = useMemo(() => {
    let emails = []
    if (contact) {
      if (isSubscriber && contact.emails) {
        contact.emails.forEach(email => {
          emails.push(email.email_address)
        })
      } else if (!isSubscriber && contact.email_addresses) {
        contact.email_addresses.forEach(email => {
          emails.push(email.email)
        })
      }
    }
    return emails
  }, [contact, isSubscriber])

  const onEmailChange = (email) => {
    setValue("ticket_contact_emails", email, { shouldValidate: true, shouldDirty: true })
    setAnchorEl(null)
  }

 
  return (
    <>
      <Grid item xs={12} className="d-inline-flex">
        <FontAwesomeIcon icon={faEnvelope} className="fa-fw text-muted f-16 mr-2" />
        {!values.ticket_contact_emails ? (
          <Typography variant="subtitle1" style={{ width: "40%" }}>
            No contact email.
           
          </Typography>
        ): (    <Typography variant="subtitle1"   component="span"
          color={permitMessageView ? "primary" : "textSecondary"}
          onClick={handleEmailClick}
          sx={{ cursor: "pointer", display: "inline" }}>{values.ticket_contact_emails}</Typography>)}
        {onEditMode && <>
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
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuList>
              {emails && emails.length > 0 ? emails.map((option, index) => (
                <MenuItem
                  key={option}
                  selected={values.ticket_contact_emails === option}
                  onClick={(event) => onEmailChange(option)}
                >
                  {option}
                </MenuItem>
              ))
                : <MenuItem disabled>No email address available.</MenuItem>}
            </MenuList>
          </Popover>
        </>}
      </Grid>
      {onEditMode && <Divider style={{ width: "42%", marginLeft: "5%" }} />}
    </>
  )
}

EmailDropdown.propTypes = {
  onEditMode: PropTypes.bool.isRequired,
  contact: PropTypes.shape({
    emails: PropTypes.arrayOf(PropTypes.shape({
      email_address: PropTypes.string.isRequired
    })),
    email_addresses: PropTypes.arrayOf(PropTypes.shape({
      email: PropTypes.string.isRequired
    }))
  }),
  isSubscriber: PropTypes.bool.isRequired,
  values: PropTypes.shape({
    ticket_contact_emails: PropTypes.string
  }).isRequired,
  setValue: PropTypes.func.isRequired
};

export default EmailDropdown