import React from "react"
import { IconButton, MenuItem, MenuList, Popover } from "@mui/material"
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"
import { GET_CUSTOMER_ADDRESSES } from "TicketDetails/TicketGraphQL"
import { useQuery } from "@apollo/client"
import ErrorPage from "components/ErrorPage"
import Loader from "components/Loader"
import { isEmpty, pick, startCase } from "lodash"
import { getFormattedAddress } from "utils/formatter"

const ContactAddressDropdown = props => {
  const { customer, customerAddress, selectedAddress, setSelectedAddress } = props
  const [anchorEl, setAnchorEl] = React.useState(false)
  const open = Boolean(anchorEl);

  const { loading, error, data } = useQuery(GET_CUSTOMER_ADDRESSES, {
    variables: { customer_id: customer.customer_id },
    fetchPolicy: "network-only",
    skip: !customer.customer_id,
  })

  const addressOptions = React.useMemo(() => {
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

  const handleOnSelect = (value) => {
    setSelectedAddress(value)
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
            <Loader style={{ fontSize: 12 }} />
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

export default ContactAddressDropdown