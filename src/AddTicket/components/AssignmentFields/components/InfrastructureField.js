import React, { useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { SEARCH_INFRASTRUCTURE } from "AddTicket/AddTicketGraphQL";
import HookAutoCompleteField from "Common/hookFields/HookAutoCompleteField";
import ErrorPage from "components/ErrorPage";
import { debounce, find, isEmpty } from "lodash";
import { getFormattedPGAddress } from "utils/formatter";

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
  }, [values.location_id, infrastructureOptions, selected])

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
        setValue('ticket_contact_name', `${selected.name}`)
        setValue('address', getFormattedPGAddress(selected.address))
      } else {
        setValue('assigned_name', '')
        setValue('ticket_contact_name', '')
        setValue('address', '')
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