import React from "react"
import PropTypes from 'prop-types';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  IconButton,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material"
import { makeStyles } from "@mui/styles";
import { includes } from "lodash";

const rowsPerPageOptions = [10, 25, 50]

const useStyles = makeStyles((theme) => ({
  pageLimitInput: {
    minWidth: 25,
    height: 26,
    "& .MuiOutlinedInput-input": {
      padding: "6px",
    },
    "& .MuiSelect-iconOutlined": {
      right: 0,
    },
  },
  pageCountInput: {
    minWidth: 10,
    height: 25,
    width: "min-content",
    "& .MuiOutlinedInput-input": {
      padding: "6px",
    },
  },
  borderlessInput: {
    "& .MuiInputBase-root": {
      "&:before": { border: "0 !important" },
      "&:after": { border: "0 !important" },
    },
    "& .MuiSelect-select": {
      fontWeight: 500,
    },
  },
}));

const ServerSidePagination = props => {
  const { page, count, setPage } = props
  const classes = useStyles()
  const [currentPage, setCurrentPage] = React.useState(0)

  React.useEffect(() => {
    setCurrentPage(Math.ceil(page.offset / page.limit))
  }, [page.offset, page.limit])

  const [currentNumber, currentLastNumber] = React.useMemo(() => {
    let firstNumber = page.offset + 1
    let lastNumber = page.offset + page.limit
    if (lastNumber > count) {
      lastNumber = count
    }
    let numPages = Math.ceil(count / page.limit)
    if (count === 0) {
      firstNumber = 0
      numPages = 1
    }
    return [firstNumber, lastNumber, numPages]
  }, [count, page.offset, page.limit])

  const handleChangePage = React.useCallback(
    newPage => {
      const offset = newPage * page.limit
      setPage({ offset, page: newPage, limit: page.limit })
    },
    [page, setPage]
  )

  const handleChangeRowsPerPage = React.useCallback(
    event => {
      const limit = Number(event.target.value)
      setPage({ offset: 0, page: 0, limit })
    },
    [setPage]
  )

  const handleBackButtonClick = React.useCallback(() => {
    handleChangePage(currentPage - 1)
  }, [currentPage, handleChangePage])

  const handleNextButtonClick = React.useCallback(() => {
    handleChangePage(currentPage + 1)
  }, [currentPage, handleChangePage])

  const pageLimit = includes(rowsPerPageOptions, page.limit) ? page.limit : 25

  return (
    <Grid
      container
      justifyContent="end"
      alignItems="center"
      spacing={1}
      className="mt-1 align-items-center"
    >
      <Grid item xs="auto">
        <Typography variant="body2">{`Rows per page:`}</Typography>
      </Grid>
      <Grid item xs="auto">
        <TextField
          value={pageLimit}
          onChange={handleChangeRowsPerPage}
          select
          variant="standard"
          classes={{ root: classes.borderlessInput }}
          className={classes.pageLimitInput}
          InputLabelProps={{ shrink: false }}
          label=""
        >
          {rowsPerPageOptions.map((item, index) => (
            <MenuItem key={`rowParPage_${index}_${item}`} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs="auto" className="mx-4">
        <Typography>{`${currentNumber} - ${currentLastNumber} of ${count}`}</Typography>
      </Grid>
      <Grid item xs="auto">
        <IconButton
          onClick={handleBackButtonClick}
          disabled={currentPage <= 0}
          aria-label="previous page"
          size="small"
        >
          <KeyboardArrowLeft />
        </IconButton>
      </Grid>
      <Grid item xs="auto">
        <IconButton
          onClick={handleNextButtonClick}
          disabled={currentPage >= Math.ceil(count / page.limit) - 1}
          aria-label="next page"
          size="small"
        >
          <KeyboardArrowRight />
        </IconButton>
      </Grid>
    </Grid>
  );
}
ServerSidePagination.propTypes = {
  page: PropTypes.shape({
    offset: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
  }),
  count: PropTypes.number,
  setPage: PropTypes.func,
  tableName: PropTypes.string,
};

export default ServerSidePagination