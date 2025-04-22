import { Checkbox } from "@mui/material"
import { gridFilteredSortedRowEntriesSelector, gridFilteredSortedRowIdsSelector, useGridApiContext } from "@mui/x-data-grid-pro"
import { uniq } from "lodash"

export const RowCheckbox = props => {
  const { checkedRows, setCheckedRows, rowData, setHasUnmetReqIds } = props

  const handleCheck = () => {
    const id = rowData.id
    setCheckedRows((prevSelectedIds) =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevSelectedIds, id]
    );
    setHasUnmetReqIds((prev) => ({
      blockedResolve: rowData.isResolveBlocked ? uniq([...prev.blockedResolve, id]) : prev.blockedResolve,
      blockedClosed: rowData.isClosedBlocked ? uniq([...prev.blockedClosed, id]) : prev.blockedClosed,
    }));
  };

  return (
    <Checkbox
      checked={checkedRows.includes(rowData.id)}
      size="small"
      onClick={e => e.stopPropagation()}
      onChange={handleCheck}
      style={{ padding: 0 }}
    />
  )
}

export const HeaderCheckbox = (props) => {
  const { checkedRows, setCheckedRows, loading, hasUnmetReqIds, setHasUnmetReqIds } = props;
  const apiRef = useGridApiContext();
  const list = gridFilteredSortedRowIdsSelector(apiRef);
  const listData = gridFilteredSortedRowEntriesSelector(apiRef);
  const checked = list.every(item => checkedRows.includes(item));

  const handleCheck = () => {
    let selectedIds = checked ? [] : [...checkedRows, ...listData.map(x => x.id)]
    setCheckedRows(selectedIds)
    let blockedResolvedTickets = listData.filter(ticket => ticket.model.isResolveBlocked);
    let blockedClosedTickets = listData.filter(ticket => ticket.model.isClosedBlocked);

    setHasUnmetReqIds({ blockedResolve: [...hasUnmetReqIds.blockedResolve, ...blockedResolvedTickets.map(x => x.id)], blockedClosed: [...hasUnmetReqIds.blockedClosed, ...blockedClosedTickets.map(x => x.id)] })
  }
  
  if (list.length === 0 || loading) return null

  return (
    <Checkbox
      checked={checked}
      size="small"
      onChange={handleCheck}
      style={{ padding: 0 }}
    />
  )
}