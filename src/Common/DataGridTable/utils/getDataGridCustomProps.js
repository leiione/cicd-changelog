export const getDataGridCustomProps = props => {
  const {
    handleRowClick,
    handleCellClick,
  } = props

  let dataGridProps = {}
  let initialState = {}

  if (handleRowClick) {
    dataGridProps = {
      onCellDoubleClick: (params, event) => {
        event.defaultMuiPrevented = true;
      },
      onCellClick: handleCellClick
    }
  }

  return { dataGridProps, initialState }
}

