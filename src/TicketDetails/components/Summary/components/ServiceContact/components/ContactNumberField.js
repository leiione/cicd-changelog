import React, { useMemo } from "react";
import PropTypes from 'prop-types';
import { Checkbox, Divider, FormControlLabel, Grid, IconButton, MenuItem, MenuList, Popover, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/pro-regular-svg-icons";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { findIndex, startCase, uniqBy } from "lodash";
import { formatPhoneNumber } from "utils/formatter";

const phoneLabel = ['Home', 'Work', 'Cell', 'Fax'];
const mainPhoneFields = ["main_phone1", "main_phone2", "main_phone3", "main_fax"];
const billPhoneFields = ["bill_phone1", "bill_phone2", "bill_phone3", "bill_fax"];

const ContactNumberField = props => {
  const { onEditMode, values, contact, setValue, isSubscriber } = props;
  const [anchorEl, setAnchorEl] = React.useState(false)
  const open = Boolean(anchorEl);

  const contactNumbers = useMemo(() => {
    let numbers = [];
    if (contact) {
      if (isSubscriber) {
        mainPhoneFields.forEach((field, index) => {
          if (contact[field]) {
            numbers.push({ label: phoneLabel[index], phone: formatPhoneNumber(contact[field]) })
          }
        })
        billPhoneFields.forEach((field, index) => {
          if (contact[field]) {
            numbers.push({ label: phoneLabel[index], phone: formatPhoneNumber(contact[field]) })
          }
        })
      } else if (contact.phone_numbers) {
        contact.phone_numbers.forEach((phone, index) => {
          numbers.push({ label: startCase(phone.type), phone: formatPhoneNumber(phone.number) })
        })
      }
    }
    return uniqBy(numbers, 'phone');
  }, [contact, isSubscriber])

  const selectedNumbers = useMemo(() => {
    const phoneArr = values.ticket_contact_numbers ? values.ticket_contact_numbers.split(',') : [];
    let displayNumbers = []
    phoneArr.forEach((phone, index) => {
      const phoneIndex = findIndex(contactNumbers, (o) => o.phone === phone);
      if (phoneIndex > -1) {
        displayNumbers.push({ label: phoneLabel[phoneIndex], phone })
      }
    })
    return displayNumbers;
  }, [values.ticket_contact_numbers, contactNumbers])

  const onPhoneChange = (value) => {
    let phoneArr = values.ticket_contact_numbers ? values.ticket_contact_numbers.split(',') : [];
    const index = phoneArr.indexOf(value.phone);
    if (index > -1) {
      phoneArr.splice(index, 1);
    } else {
      phoneArr.push(value.phone);
    }
    setValue('ticket_contact_numbers', phoneArr.join(','), { shouldValidate: true, shouldDirty: true });
  }

  return (
    <>
      <Grid item xs={12} className="d-inline-flex">
        <FontAwesomeIcon icon={faPhone} className="fa-fw text-muted f-16 mr-2" />
        <Grid item xs={12} className="d-inline-flex">
          <Grid container spacing={1} style={{ width: "42%" }}>
            {selectedNumbers.length > 0 ? (
              selectedNumbers.map((item, index) => (
                <Grid item xs={6} key={item.phone}>
                  <Typography variant="subtitle1">
                    <span>{item.label} &nbsp; {item.phone}</span>
                  </Typography>
                </Grid>
              ))
            ) : <Grid item xs={12}>
              <Typography variant="subtitle1">
                No contact number.
              </Typography>
            </Grid>}
          </Grid>
          {onEditMode &&
            <><IconButton style={{ padding: 0 }} onClick={e => setAnchorEl(e.currentTarget)}>
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
                  {contactNumbers && contactNumbers.length > 0 ?
                    contactNumbers.map((option, index) => (
                      <MenuItem key={option.phone} >
                        <FormControlLabel
                          control={<Checkbox
                            checked={findIndex(selectedNumbers, (o) => o.phone === option.phone) > -1}
                            onChange={() => onPhoneChange(option)}
                          />}
                          label={<Typography variant="subtitle1"><span>{option.label} &nbsp; {option.phone}</span></Typography>}
                        />
                      </MenuItem>
                    )) : <MenuItem disabled>No contact number available.</MenuItem>}
                </MenuList>
              </Popover>
            </>
          }
        </Grid>
      </Grid>
      {onEditMode && <Divider style={{ width: "42%", marginLeft: "5%" }} />}
    </>
  )
}

ContactNumberField.propTypes = {
  values: PropTypes.shape({
    ticket_contact_numbers: PropTypes.string.isRequired,
  }).isRequired,
  onEditMode: PropTypes.bool.isRequired,
  contact: PropTypes.shape({
    phone: PropTypes.arrayOf(PropTypes.string),
  }),
  setValue: PropTypes.func.isRequired,
};

export default ContactNumberField;