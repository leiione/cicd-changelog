import React from "react";
import { AddCircleOutline } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import ButtonWithLable from "../../../Common/ButtonWithLable";
import HeaderMenuOptions from "./components/HeaderMenuOptions";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

const Tasks = (props) => {
  const { lablesVisible, open1, handleIconButton } = props;

  return (
    <AccordionCard
      label="Tasks"
      iconButtons={
        <>
          <ButtonWithLable
            buttonLabel="Add Task"
            lablesVisible={lablesVisible}
            onClick={(event) => handleIconButton(event, "Add Task")}
            open1={open1}
            buttonIcon={<AddCircleOutline />}
          /> 
          <span className="text-muted ml-3">3/5 task completed</span>
        </>
      }
      menuOption={<HeaderMenuOptions />}
    >

<FormGroup>
  <FormControlLabel control={<Checkbox defaultChecked />} label="Payments" />
  <FormControlLabel control={<Checkbox />} label="Lorem Ipsum is simply dummy text of the Lprinting and typesetting industry. " />
  <FormControlLabel control={<Checkbox />} label="Lorem Ipsum has been the industry's standard dummy text ever since the 1500s." />
  <FormControlLabel control={<Checkbox defaultChecked/>} label="LAldus PageMaker including versions of Lorem Ipsum." />
  <FormControlLabel control={<Checkbox defaultChecked/>} label="It is a long established fact that a reader" />
</FormGroup>

    </AccordionCard>
  );
};
export default Tasks;
