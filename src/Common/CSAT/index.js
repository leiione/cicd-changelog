import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux"
import makeStyles from '@mui/styles/makeStyles';
import { SentimentSatisfiedTwoTone, SentimentDissatisfiedTwoTone, SentimentVerySatisfiedTwoTone, SentimentSatisfiedAlt } from "@mui/icons-material"
import { get, omit } from "lodash"
import { useMutation } from "@apollo/client";
import { SAVE_SURVEY } from "./CSATGraphQL";
import { useForm } from "react-hook-form";
import {
  Box,
  IconButton,
  Popover,
  FormControlLabel,
  Radio,
  Typography,
  Collapse,
  Grid,
  FormControl,
  RadioGroup,
} from "@mui/material";
import ProgressButton from "Common/ProgressButton";
import HookTextField from "../hookFields/HookTextField";
import { showSnackbar } from "../../config/store";

const dissatisfiedIcon = <SentimentDissatisfiedTwoTone />
const neutralIcon = <SentimentSatisfiedTwoTone />
const satisfiedIcon = <SentimentVerySatisfiedTwoTone />

const emojiValues = {
  0: null,
  1: "dissatisfied",
  2: "neutral",
  3: "satisfied"
}

const iconValues = {
  0: null,
  1: dissatisfiedIcon,
  2: neutralIcon,
  3: satisfiedIcon
}

const buttonColorValues = {
  0: null,
  1: "btn-dissatisfied",
  2: "btn-neutral",
  3: "btn-satisfied"
}

const useStyles = makeStyles(theme => ({
  experiencePopoverBtn: { color: "#7D87B8", padding: "0px", borderRadius: 8 },
}))

const scoreMap = { dissatisfied: 1, neutral: 2, satisfied: 3 }

const CSATForm = props => {
  const {
    classes,
    anchorEl,
    OpenfeedbackBox,
    dissatisfiedIcon,
    neutralIcon,
    satisfiedIcon,
    value,
    TargetIcon,
    btnColor,
    open,
    setTargetIcon,
    setbtnColor,
    setFeedbackBox,
    setAnchorEl,
    sayThanks,
    setSayThanks,
    isSettings,
    dispatch,
    onSubmit,
    form
  } = props
  const {
    control,
    setValue,
    watch,
    handleSubmit,
  } = form

  const values = watch()

  const handleClose = isCancelled => e => {
    setAnchorEl(null)
    if (isCancelled) {
      setTimeout(() => {
        setValue("score", 0)
        setValue("note", "")
      }, 1000)
    }
  }

  const handleChange = event => {
    let score = 0
    if (event.target.value === "dissatisfied") {
      score = 1
      setTargetIcon(dissatisfiedIcon)
      setbtnColor("btn-dissatisfied")
      setValue("score", score)
    } else if (event.target.value === "neutral") {
      score = 2
      setTargetIcon(neutralIcon)
      setbtnColor("btn-neutral")
      setValue("score", score)
    } else if (event.target.value === "satisfied") {
      score = 3
      setTargetIcon(satisfiedIcon)
      setbtnColor("btn-satisfied")
      setValue("score", score)
    } else {
      setTargetIcon(null)
      setbtnColor(null)
    }
  }

  const sumbitFeedback = () => {
    if (get(values, 'score', 0) === 0) {
      dispatch(showSnackbar({ message: "Score is required.", severity: "error" }))
    } else {
      handleSubmit(onSubmit)()
      setFeedbackBox(false)
      setSayThanks(true)
      setTimeout(() => {
        setAnchorEl(null)
        setValue("score", 0)
        setValue("note", "")
      }, 2000)
      setTimeout(() => {
        setTargetIcon(<SentimentSatisfiedAlt />)
        setbtnColor(null)
      }, 3500)
    }
  }

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
    setValue("score", scoreMap[value])
  }

  return <>
    <IconButton
      aria-owns={open ? "mouse-over-popover" : undefined}
      aria-haspopup="true"
      onClick={handleClick}
      disableRipple
      className={`${classes.experiencePopoverBtn} ${value !== null ? btnColor : ""}`}
      size="large">
      {value === null ? <SentimentSatisfiedAlt /> : TargetIcon}
    </IconButton>
    <Popover
      id="mouse-over-popover"
      className={classes.popover}
      classes={{
        paper: isSettings ? "CSAT-settings" : "CSAT-paper"
      }}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right"
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right"
      }}
      onClose={handleClose(false)}
      disableRestoreFocus
    >
      <Box component="fieldset" className="my-auto">
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs="auto">
            <Typography className="text-white pr-4 pl-2 py-1">{sayThanks ? "Thanks for your feedback" : "How’s this experience?"}</Typography>
          </Grid>
          <Grid item xs="auto">
            <FormControl component="fieldset" className="mb-0">
              <RadioGroup row aria-label="score" name="score" value={String(emojiValues[values.score])} onChange={handleChange}>
                <FormControlLabel
                  className="dissatisfied"
                  value="dissatisfied"
                  control={<Radio />}
                  onClick={(event) => {
                    setFeedbackBox(true)
                    handleChange(event)
                  }}
                  label={dissatisfiedIcon}
                />
                <FormControlLabel
                  className="neutral"
                  value="neutral"
                  control={<Radio />}
                  onClick={(event) => {
                    setFeedbackBox(true)
                    handleChange(event)
                  }}
                  label={neutralIcon}
                />
                <FormControlLabel
                  className="satisfied"
                  value="satisfied"
                  control={<Radio />}
                  onClick={(event) => {
                    setFeedbackBox(true)
                    handleChange(event)
                  }}
                  label={satisfiedIcon}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <Collapse in={OpenfeedbackBox} timeout="auto">
        <div className="bg-white rounded my-2">
          <Grid container justifyContent="flex-end">
            <Grid item xs={12}>
              <HookTextField
                id="CSAT-feedback"
                name="note"
                fullWidth
                label=""
                multiline
                autoFocus
                minRows={4}
                control={control}
                placeholder="What could be improved? (Optional)"
                style={{ width: "100%", overflow: "auto", border: "none" }}
                classes={{ root: classes.inputRoot }}
              />
            </Grid>
            <Grid item xs="auto">
              <ProgressButton
                color="primary"
                size="small"
                disableRipple
                className={classes.btnWidth}
                onClick={() => {
                  sumbitFeedback()
                }}
              >
                Send
              </ProgressButton>
            </Grid>
          </Grid>
        </div>
      </Collapse>
    </Popover>
  </>
}

const CSAT = props => {
  const { category, isSettings, appuser_id, handlePopoverClose } = props
  const classes = useStyles()
  const dispatch = useDispatch()
  const defaultCsatValues = useMemo(() => ({ score: 0, note: "" }), []);
  let csat = useMemo(() => ({ ...defaultCsatValues, category: "" }), [defaultCsatValues]);

  const { score } = csat
  const [value, setValue] = React.useState(csat.category === category ? emojiValues[score] : null)
  const [TargetIcon, setTargetIcon] = React.useState(csat.category === category ? iconValues[score] : null)
  const [btnColor, setbtnColor] = React.useState(csat.category === category ? buttonColorValues[score] : null)
  const [sayThanks, setSayThanks] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [OpenfeedbackBox, setFeedbackBox] = useState(csat.category === category ? score !== 0 : null)
  const [saveSurvey] = useMutation(SAVE_SURVEY)

  const open = Boolean(anchorEl)

  const initialValues = React.useMemo(() => (
    csat.category === category ? csat : defaultCsatValues
  ), [category, csat, defaultCsatValues])

  let form = useForm({
    defaultValues: initialValues,
    mode: "onChange",
    reValidateMode: "onSubmit"
  });

  useEffect(() => {
    form.reset(initialValues)
    // eslint-disable-next-line
  }, [csat.category])

  const onSubmit = async (values, actions) => {
    if (get(values, "score", 0) !== null && get(values, "score", 0) !== undefined && get(values, "score", 0) > 0) {
      try {
        await saveSurvey({
          variables: {
            input: {
              type: "Feedback",
              appuser_id,
              category,
              ...omit(values, ["category"])
            }
          }
        })
        setTimeout(() => {
          setSayThanks(false)
          setValue(null)
          setTargetIcon(<SentimentSatisfiedAlt />)
          setbtnColor(null)
        }, 2500)
        dispatch(showSnackbar({ message: "Feedback successfully submitted", severity: "success" }))
        handlePopoverClose()
      } catch (err) {
        const msg = err.message.replace("GraphQL error: ", "")
        dispatch(showSnackbar({ message: msg, severity: "error" }))
      }
    }
  }

  return <CSATForm
    onSubmit={onSubmit}
    form={form}
    {...props}
    classes={classes}
    dispatch={dispatch}
    anchorEl={anchorEl}
    OpenfeedbackBox={OpenfeedbackBox}
    dissatisfiedIcon={dissatisfiedIcon}
    neutralIcon={neutralIcon}
    satisfiedIcon={satisfiedIcon}
    value={value}
    TargetIcon={TargetIcon}
    btnColor={btnColor}
    open={open}
    setTargetIcon={setTargetIcon}
    setbtnColor={setbtnColor}
    setFeedbackBox={setFeedbackBox}
    setAnchorEl={setAnchorEl}
    sayThanks={sayThanks}
    setSayThanks={setSayThanks}
    isSettings={isSettings}
  />
}

export default CSAT