export const preventEvent = e => {
  let ev = e || window.event
  if (ev.preventDefault) ev.preventDefault()
  else ev.returnValue = false
  if (ev.stopPropagation) ev.stopPropagation()
  return false
}
