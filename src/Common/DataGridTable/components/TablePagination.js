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
      fontWeight: 400,
      color: "#616161",
      fontSize: 11,
    },
  },
}));

const TablePagination = ({ count, paginationModel, onPaginationModelChange }) => {
  const classes = useStyles()
  
  // Get current page and page size from paginationModel
  const currentPage = paginationModel.page;
  const pageSize = paginationModel.pageSize;

  const [currentNumber, currentLastNumber] = React.useMemo(() => {
    let firstNumber = currentPage * pageSize + 1
    let lastNumber = (currentPage + 1) * pageSize
    if (lastNumber > count) {
      lastNumber = count
    }
    let numPages = Math.ceil(count / pageSize)
    if (count === 0) {
      firstNumber = 0
      numPages = 1
    }
    return [firstNumber, lastNumber, numPages]
  }, [count, currentPage, pageSize])

  const handleChangePage = React.useCallback(
    newPage => {
      onPaginationModelChange({
        ...paginationModel,
        page: newPage
      })
    },
    [paginationModel, onPaginationModelChange]
  )

  const handleChangeRowsPerPage = React.useCallback(
    event => {
      const newPageSize = Number(event.target.value)
      onPaginationModelChange({
        pageSize: newPageSize,
        page: 0 // Reset to first page when changing page size
      })
    },
    [onPaginationModelChange]
  )

  const handleBackButtonClick = React.useCallback(() => {
    handleChangePage(currentPage - 1)
  }, [currentPage, handleChangePage])

  const handleNextButtonClick = React.useCallback(() => {
    handleChangePage(currentPage + 1)
  }, [currentPage, handleChangePage])

  const pageLimit = includes(rowsPerPageOptions, pageSize) ? pageSize : 25

  return (
    <Grid
      container
      justifyContent="end"
      alignItems="center"
      spacing={1}
      className="mt-1 align-items-center"
    >
      <Grid item xs="auto">
        <Typography variant="caption">{`Rows per page:`}</Typography>
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
        <Typography variant="caption">{`${currentNumber} - ${currentLastNumber} of ${count}`}</Typography>
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
          disabled={currentPage >= Math.ceil(count / pageSize) - 1}
          aria-label="next page"
          size="small"
        >
          <KeyboardArrowRight />
        </IconButton>
      </Grid>
    </Grid>
  );
}
TablePagination.propTypes = {
  count: PropTypes.number,
  paginationModel: PropTypes.shape({
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired
  }).isRequired,
  onPaginationModelChange: PropTypes.func.isRequired
};

export default TablePagination