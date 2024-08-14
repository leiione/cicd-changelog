import React, { useEffect, useState } from "react";
import { AddCircleOutline, DragIndicator } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import ButtonWithLable from "../../../Common/ButtonWithLable";
import HeaderMenuOptions from "./components/HeaderMenuOptions";
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";
import TaskMenuOptions from "./components/TaskMenuOptions";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { cloneDeep } from "lodash";

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: 0,
  // styles we need to apply on draggables
  backgroundColor: isDragging ? "khaki" : "", // not working
  ...draggableStyle
})

const Tasks = (props) => {
  const { ticket, appuser_id, lablesVisible, open1, handleIconButton, loading } = props;
  const [ticketTasks, setTicketTasks] = useState(ticket.tasks || [])
  const [isHovered, setHover] = useState(-1)

  useEffect(() => {
    if (!loading && ticket.tasks !== ticketTasks) {
      setTicketTasks(ticket.tasks)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, ticket.ticket_id])

  const completed = (ticketTasks.filter(x => x.is_completed)).length
  const taskCount = ticketTasks.length


  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  const onDragEnd = result => {
    if (!result.destination) {
      return
    }

    if (result.source.index !== result.destination.index) {
      const items = reorder(ticketTasks, result.source.index, result.destination.index)

      const newRanks = items.map((x, index) => {
        return { ...x, rank_order: index + 1 }
      })
      setTicketTasks(newRanks);
    }
  }

  const onCompleteTask = (index) => {
    const newTasks = cloneDeep(ticketTasks)
    newTasks[index].is_completed = !newTasks[index].is_completed
    setTicketTasks(newTasks)
  }

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
          <span className="text-muted ml-3">
            {loading ?
              <Skeleton animation="wave" style={{ height: 25, backgroundColor: "##dfdede", width: "130px" }} />
              : `${completed}/${taskCount} task completed`
            }</span>
        </>
      }
      menuOption={<HeaderMenuOptions appuser_id={appuser_id} category="Task Card" />}
    >
      {loading ?
        <Skeleton animation="wave" style={{ height: 30, backgroundColor: "##dfdede", width: "60%" }} />
        : (taskCount > 0 ?
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <List dense {...provided.droppableProps} ref={provided.innerRef}>
                  {ticketTasks.length > 0 &&
                    ticketTasks.map((task, index) => (
                      <Draggable key={index} draggableId={`draggable-${index}`} index={index}>
                        {provided => {
                          return (
                            <ListItem
                              key={task.task_id}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                              className="pointer"
                              onMouseOver={() => setHover(index)}
                              onMouseLeave={() => setHover(-1)}
                              secondaryAction={<DragIndicator className="text-lighter f-20" />}
                            >
                              {<TaskMenuOptions show={isHovered === index} />}
                              <ListItemIcon >
                                <Checkbox
                                  checked={task.is_completed}
                                  onChange={() => onCompleteTask(index)}
                                  inputProps={{ 'aria-label': 'controlled' }}
                                  style={{ padding: 0 }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                id={task.id}
                                primary={task.task}
                                className={task.is_completed ? "text-decoration-line-through" : ""}
                              />
                            </ListItem>
                          )
                        }}
                      </Draggable>
                    ))
                  }
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
          : <Typography className="text-muted">
            No Task Added.
          </Typography>
        )
      }
    </AccordionCard >
  );
};
export default Tasks;
