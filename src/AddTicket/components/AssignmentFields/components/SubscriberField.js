import React, { useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { SEARCH_SUBSCRIBER } from "AddTicket/AddTicketGraphQL";
import HookAutoCompleteField from "Common/hookFields/HookAutoCompleteField";
import ErrorPage from "components/ErrorPage";
import { debounce, find, isEmpty } from "lodash";

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