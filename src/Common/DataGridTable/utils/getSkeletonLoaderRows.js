import { floor } from "lodash"

export const getSkeletonLoaderRows = ({ containerHeight }) => {
  const rowCount = floor((containerHeight / 26) / 2)
  const loadingRows = []
  let count = 0
  while (count < rowCount) {
    count++
    loadingRows.push({
      id: count,
      hierarchy: [count],
    })
  }

  return loadingRows
}