import React from "react";
import { AddCircleOutline } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import ButtonWithLable from "../../../Common/ButtonWithLable";
import HeaderMenuOptions from "./components/HeaderMenuOptions";
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { data } from "./components/helper";
import TaskMenuOptions from "./components/TaskMenuOptions";

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
      <List dense>
        {data.map((task) => {
          return (
            <ListItem key={task.id} className="visible-on-hover">
              <TaskMenuOptions />
              <ListItemIcon>
                <Checkbox checked={task.value} />
              </ListItemIcon>
              <ListItemText
                id={task.id}
                primary={task.name}
                className={
                  task.value === true ? "text-decoration-line-through" : ""
                }
              />
            </ListItem>
          );
        })}
      </List>
    </AccordionCard>
  );
};
export default Tasks;
