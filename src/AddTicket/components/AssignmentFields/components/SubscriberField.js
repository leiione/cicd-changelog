import React, { useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { SEARCH_SUBSCRIBER } from "AddTicket/AddTicketGraphQL";
import HookAutoCompleteField from "Common/hookFields/HookAutoCompleteField";
import ErrorPage from "components/ErrorPage";
import { debounce, find, isEmpty, uniq } from "lodash";
import { formatPhoneNumber, getFormattedAddress } from "utils/formatter";

const SubscriberField = (props) => {
  const { control, setValue, values } = props;
  const [searchValue, setSearchVal] = React.useState()
  const [selected, setSelected] = React.useState(values.initSelected ? values.initSelected : {})

  const { loading, error, data } = useQuery(SEARCH_SUBSCRIBER, {
    variables: { searchValue },
    fetchPolicy: "network-only",
    skip: !searchValue
  })

  const subscriberOptions = useMemo(() => {
    let list = [];
    if (searchValue && !loading && data && data.searchCustomer) {
      data.searchCustomer.forEach((item) => {
        list.push({
          ...item,
          label: `${item.first_name} ${item.last_name}`,
          value: item.customer_id
        })
      })
    }
    if (values.customer_id > 0 && isEmpty(searchValue) && selected.value > 0 && !find(list, { value: values.customer_id })) { // selected should be in the list
      list = [{ ...selected }]
    }

    if (list.length === 0 && !searchValue) {
      list.push({ label: "Type to search for Subscriber", value: 'type', disabled: true })
    }
    return list;
  }, [searchValue, loading, data, values.customer_id, selected]);

  useEffect(() => {
    const selectedItem = find(subscriberOptions, { value: values.customer_id })
    if (selectedItem && selectedItem.value !== selected.value) {
      setSelected(selectedItem)
    } else if (values.assigned_name) {
      setSelected({ label: values.assigned_name, value: values.customer_id });
    }
  }, [values.customer_id, subscriberOptions, selected])

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
    const cust = find(subscriberOptions, { value })
    if (value > 0 && cust) {
      let emails = ''
      if (cust.billing_emails) {
        emails += `${emails ? ',' : ''}${cust.billing_emails}`
      }
      if (cust.marketing_emails) {
        emails += `${emails ? ',' : ''}${cust.marketing_emails}`
      }
      if (cust.technical_emails) {
        emails += `${emails ? ',' : ''}${cust.technical_emails}`
      }
      emails = emails ? emails.split(',') : []

      let contactNumbers = [];
      if (!isEmpty(cust.main_phone1)) {
        contactNumbers.push(formatPhoneNumber(cust.main_phone1));
      }
      if (!isEmpty(cust.main_phone2)) {
        contactNumbers.push(formatPhoneNumber(cust.main_phone2));
      }
      if (!isEmpty(cust.main_phone3)) {
        contactNumbers.push(formatPhoneNumber(cust.main_phone3));
      }
      if (!isEmpty(cust.main_fax)) {
        contactNumbers.push(formatPhoneNumber(cust.main_fax));
      }

      setValue('assigned_name', `${cust.first_name} ${cust.last_name} (${cust.customer_id})`)
      setValue('ticket_contact_name', `${cust.first_name} ${cust.last_name}`)
      setValue('address', getFormattedAddress(cust, 'main'))
      setValue('ticket_contact_emails', uniq(emails).join(','))
      setValue('ticket_contact_numbers', contactNumbers.join(','))
    } else {
      setValue('assigned_name', '')
      setValue('ticket_contact_name', '')
      setValue('address', '')
      setValue('ticket_contact_emails', '')
      setValue('ticket_contact_numbers', '')
    }
  }

  return (
    <HookAutoCompleteField
      control={control}
      name={"customer_id"}
      label={""}
      options={subscriberOptions}
      InputLabelProps={{ shrink: true }}
      onChange={handleOnChange}
      overrideOnChange
      placeholder="Type to search for Subscriber"
      required
      onInputChange={keyPress}
      onBlur={() => setSearchVal('')} // to reset options
      loading={loading}
      filterOptions={(options) => options}
      noOptionMsg={loading ? "Loading..." : (searchValue ? 'Subscriber not found.' : '')}
    />
  )
}

export default React.memo(SubscriberField);