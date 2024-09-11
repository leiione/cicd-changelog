export const ADDING = { hex:0x0001, label:'adding' }
export const EDITING = { hex:0x0002, label:'editing' }
export const RESOLVING = { hex: 0x0004, label:'resolving' }
export const CLOSING = { hex:0x0008, label:'closing' }

export const getUserAction = actionValue => {
  const actions = []
  if((actionValue & ADDING.hex) === ADDING.hex) {
      actions.push(ADDING)
    }

  if((actionValue & EDITING.hex) === EDITING.hex) {
    actions.push(EDITING)
  }

  if((actionValue & RESOLVING.hex) === RESOLVING.hex) {
    actions.push(RESOLVING)
  }

  if((actionValue & CLOSING.hex) === CLOSING.hex) {
    actions.push(CLOSING)
  }
  return actions
}