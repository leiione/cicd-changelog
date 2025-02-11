import React, { useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { SEARCH_INFRASTRUCTURE } from "AddTicket/AddTicketGraphQL";
import HookAutoCompleteField from "Common/hookFields/HookAutoCompleteField";
import ErrorPage from "components/ErrorPage";
import { debounce, find, isEmpty } from "lodash";
import { formatPhoneNumber, getFormattedPGAddress } from "utils/formatter";

const InfrastructureField = (props) => {
  const { control, setValue, values } = props;
  const [searchValue, setSearchVal] = React.useState('')
  const [selected, setSelected] = React.useState({})

  const { loading, error, data } = useQuery(SEARCH_INFRASTRUCTURE, {
    variables: { searchValue },
    fetchPolicy: "network-only",
    skip: !searchValue
  })

  const infrastructureOptions = useMemo(() => {
    let list = [];
    if (searchValue && !loading && data && data.searchInfrastructure) {
      data.searchInfrastructure.forEach((item) => {
        list.push({
          ...item,
          label: item.name,
          value: item.id
        })
      })
    }
    if (values.location_id > 0 && isEmpty(searchValue) && selected.value > 0 && !find(list, { value: values.location_id })) { // selected should be in the list
      list = [{ ...selected }]
    }

    if (list.length === 0 && !searchValue) {
      list.push({ label: "Type to search for Infrastructure", value: 'type', disabled: true })
    }
    return list;
  }, [searchValue, loading, data, values.location_id, selected]);

  useEffect(() => {
    const selectedItem = find(infrastructureOptions, { value: values.location_id })
    if (selectedItem && selectedItem.value !== selected.value) {
      setSelected(selectedItem)
    }else if (values.assigned_name) {
      setSelected({ label: values.assigned_name, value: values.location_id });
    }
  }, [values.location_id, values.assigned_name, infrastructureOptions, selected])

  if (error) return <ErrorPage error={error} />

  const onInputChange = async (event) => {
    const { value } = event.target
    setSearchVal(value)
  }

  const keyPress = debounce(event => {
    onInputChange(event)
  }, 300)

  const handleOnChange = (name, value) => {
    setValue(name, value)
    if (value > 0) {
      const selected = find(infrastructureOptions, { value })
      if (selected) {
        setValue('assigned_name', `${selected.name}`)
        setValue('address', getFormattedPGAddress(selected.address))
        const siteContact = selected.site_contacts && selected.site_contacts.length > 0 ? selected.site_contacts[0] : null
        if (siteContact) {
          let numbers = [];
          if (siteContact.phone_numbers && siteContact.phone_numbers.length > 0) {
            siteContact.phone_numbers.forEach(phone => {
              numbers.push(formatPhoneNumber(phone.number))
            })
          }
          setValue('ticket_contact_name', `${siteContact.first} ${siteContact.last}`)
          setValue('ticket_contact_emails', siteContact.email_addresses && siteContact.email_addresses.length > 0 ? siteContact.email_addresses[0].email : '')
          setValue('ticket_contact_numbers', numbers.join(','))
        } else {
          setValue('ticket_contact_name', `${selected.name}`)
          setValue('ticket_contact_emails', '')
          setValue('ticket_contact_numbers', '')
        }
      } else {
        setValue('assigned_name', '')
        setValue('ticket_contact_name', '')
        setValue('address', '')
        setValue('ticket_contact_emails', '')
        setValue('ticket_contact_numbers', '')
      }
    }
  }

  return (
    <HookAutoCompleteField
      control={control}
      name={"location_id"}
      label={""}
      options={infrastructureOptions}
      InputLabelProps={{ shrink: true }}
      onChange={handleOnChange}
      overrideOnChange
      placeholder="Type to search for Infrastructure"
      required
      onInputChange={keyPress}
      onBlur={() => setSearchVal('')} // to reset options
      loading={loading}
      filterOptions={(options) => options}
      noOptionMsg={loading ? "Loading..." : (searchValue ? 'Infrastructure not found.' : '')}
    />
  )
}

export default React.memo(InfrastructureField);