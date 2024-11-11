import React from "react";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setCardPreferences } from "config/store";
import { includes, toLower, trim } from "lodash";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/pro-regular-svg-icons";

const AccordionCard = (props) => {
  const dispatch = useDispatch()
  const { children, label, iconButtons, menuOption, cardFooter, className } = props;
  const card = includes(label, "Bill") ? "billOfMaterialCard": `${trim(toLower(label))}Card`;
  const cardPreferences = useSelector(state => state[card]);
  const expanded = cardPreferences ? cardPreferences.expanded : false;

  const handleChange = () => {
    dispatch(setCardPreferences({ card, preferences: { expanded: !expanded } }))
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
    >
      <AccordionSummary
        expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography variant="h6" className="mr-3">{label}</Typography>
        <div className="d-flex align-items-center">{iconButtons}</div>
        <div className="ml-auto">{menuOption}</div>
      </AccordionSummary>
      <AccordionDetails className={className}>{children}</AccordionDetails>
      {cardFooter && <AccordionActions>{cardFooter}</AccordionActions>}
    </Accordion>
  );
};
export default React.memo(AccordionCard);
