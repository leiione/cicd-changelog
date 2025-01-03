import React from "react"
import PropTypes from 'prop-types';
import { IconButton, MenuItem, MenuList, Popover } from "@mui/material"
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import { GET_CUSTOMER_ADDRESSES } from "TicketDetails/TicketGraphQL"
import { useQuery } from "@apollo/client"
import ErrorPage from "components/ErrorPage"
import Loader from "components/Loader"
import { isEmpty, pick, startCase } from "lodash"
import { getFormattedAddress, getFormattedPGAddress } from "utils/formatter"

const ContactAddressDropdown = props => {
  const { ticket, customer, customerAddress, selectedAddress, setValue, cLoading, cError, cData } = props
  const [anchorEl, setAnchorEl] = React.useState(false)
  const open = Boolean(anchorEl);

  const { loading, error, data } = useQuery(GET_CUSTOMER_ADDRESSES, {
    variables: { customer_id: customer.customer_id },
    fetchPolicy: "network-only",
    skip: !customer.customer_id,
  })

  const subscriberOptions = React.useMemo(() => {
    const list = [];
    if (!loading && !error && data && data.customerAddresses) {
      data.customerAddresses.forEach((address) => {
        let customerAddress = getFormattedAddress(address)
        if (!isEmpty(customerAddress) && !list.some(e => e.value === customerAddress)) {
          list.push({
            category: address.type === "PACKAGE" ? address.name : startCase(address.type),
            label: customerAddress,
            value: customerAddress,
            ...pick(address, ['lat', 'lng'])
          })
        }
      })
    }
    return list; // eslint-disable-next-line
  }, [loading, error, data, customerAddress]);

  const locationOptions = React.useMemo(() => {
    let list = [];
    if (ticket && ticket.address) {
      list.push({ value: ticket.address, label: ticket.address })
    }
    if (ticket && ticket.infrastructure_address && !list.some(e => e.value === ticket.infrastructure_address)) {
      list.push({ value: ticket.infrastructure_address, label: ticket.infrastructure_address })
    }
    if (!cLoading && !cError && cData && cData.serviceContacts) {
      cData.serviceContacts.forEach(item => {
        if (item.address && !list.some(e => e.value === getFormattedPGAddress(item.address))) {
          list.push({
            label: getFormattedPGAddress(item.address),
            value: getFormattedPGAddress(item.address)
          })
        }
      })
    }
    return list
  }, [ticket, cLoading, cError, cData])

  const handleOnSelect = (value) => {
    setValue("address", value, { shouldValidate: true, shouldDirty: true })
    setAnchorEl(null)
  }

  const addressOptions = customer.customer_id > 0 ? subscriberOptions : locationOptions

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
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {error || cError ? <ErrorPage error={error || cError} />
          : (loading || cLoading ?
            <div style={{ width: 200 }}>
              <Loader size={14} loaderStyle={{ margin: 5, textAlign: "center" }} />
            </div>
            : <MenuList>
              {addressOptions.map((option, index) => (
                <MenuItem
                  key={index}
                  selected={selectedAddress === option.value}
                  onClick={(event) => handleOnSelect(option.value)}
                >
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          )}
      </Popover>
    </>
  )
}

ContactAddressDropdown.propTypes = {
  ticket: PropTypes.object.isRequired,
  customer: PropTypes.object.isRequired,
  customerAddress: PropTypes.string,
  selectedAddress: PropTypes.string,
  setValue: PropTypes.func.isRequired,
  cLoading: PropTypes.bool,
  cError: PropTypes.object,
  cData: PropTypes.object
};

export default React.memo(ContactAddressDropdown)