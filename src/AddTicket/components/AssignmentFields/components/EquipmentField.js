import React, { useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { SEARCH_EQUIPMENT } from "AddTicket/AddTicketGraphQL";
import HookAutoCompleteField from "Common/hookFields/HookAutoCompleteField";
import ErrorPage from "components/ErrorPage";
import { debounce, find, isEmpty } from "lodash";
import { getFormattedPGAddress } from "utils/formatter";

const EquipmentField = (props) => {
  const { control, setValue, values } = props;
  const [searchValue, setSearchVal] = React.useState('')
  const [selected, setSelected] = React.useState({})

  const { loading, error, data } = useQuery(SEARCH_EQUIPMENT, {
    variables: { searchValue },
    fetchPolicy: "network-only",
    skip: !searchValue
  })

  const equipmentOptions = useMemo(() => {
    let list = [];
    if (searchValue && !loading && data && data.searchEquipment) {
      data.searchEquipment.forEach((item) => {
        list.push({
          ...item,
          label: `${item.description} (${item.location_name})`,
          value: item.id
        })
      })
    }
    if (values.equipment_id > 0 && isEmpty(searchValue) && selected.value > 0 && !find(list, { value: values.equipment_id })) { // selected should be in the list
      list = [{ ...selected }]
    }

    if (list.length === 0 && !searchValue) {
      list.push({ label: "Type to search for Equipment (Description, Serial, MAC)", value: 'type', disabled: true })
    }
    return list;
  }, [searchValue, loading, data, values.equipment_id, selected]);

  useEffect(() => {
    const selectedItem = find(equipmentOptions, { value: values.equipment_id })
    if (selectedItem && selectedItem.value !== selected.value) {
      setSelected(selectedItem)
    }else if (values.assigned_name) {
      setSelected({ label: values.assigned_name, value: values.equipment_id });
    }
  }, [values.equipment_id, values.assigned_name, equipmentOptions, selected])

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
      const selected = find(equipmentOptions, { value })
      if (selected) {
        setValue('assigned_name', `${selected.description} (${selected.location_name})`)
        setValue('ticket_contact_name', `${selected.description} (${selected.location_name})`)
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
      name={"equipment_id"}
      label={""}
      options={equipmentOptions}
      InputLabelProps={{ shrink: true }}
      onChange={handleOnChange}
      overrideOnChange
      placeholder="Type to search for Equipment (Description, Serial, MAC)"
      required
      onInputChange={keyPress}
      onBlur={() => setSearchVal('')} // to reset options
      loading={loading}
      filterOptions={(options) => options}
      noOptionMsg={loading ? "Loading..." : (searchValue ? 'Equipment not found.' : '')}
    />
  )
}

export default React.memo(EquipmentField);