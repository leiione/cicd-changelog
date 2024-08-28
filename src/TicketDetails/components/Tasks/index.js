import React, { useEffect, useState } from "react";
import { AddCircleOutline, DragIndicator } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import ButtonWithLabel from "../../../Common/ButtonWithLabel";
import HeaderMenuOptions from "../../../components/HeaderMenuOptions";
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import TaskMenuOptions from "./components/TaskMenuOptions";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { cloneDeep, get, isEmpty, omit, sortBy, trim } from "lodash";
import { preventEvent } from "Common/helper";
import { useMutation } from "@apollo/client";
import { GET_TICKET, SAVE_TICKET_TASKS } from "TicketDetails/TicketGraphQL";
import { useDispatch } from "react-redux";
import { setCardPreferences, showSnackbar } from "config/store";

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: 0,
  // styles we need to apply on draggables
  backgroundColor: isDragging ? "khaki" : "", // not working
  ...draggableStyle
})

const taskData = {
  task_id: 0,
  task: "",
  is_completed: false
}

const Tasks = (props) => {
  const dispatch = useDispatch();
  const { ticket, appuser_id, lablesVisible, loading, handleOpenTicket } = props;
  const [ticketTasks, setTicketTasks] = useState(ticket.tasks || [])
  const [isHovered, setHover] = useState(-1)
  const [onEditMode, setOnEditMode] = useState({ index: -1, value: '' })
  const [saveTicketTasks] = useMutation(SAVE_TICKET_TASKS)

  useEffect(() => {
    if (!loading && ticket.tasks !== ticketTasks) {
      const tasks = sortBy(ticket.tasks, "rank")
      setTicketTasks(tasks)
      setOnEditMode({ index: -1, value: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, ticket.ticket_id, ticket.ticket_type_id, ticket.tasks])

  const completed = (ticketTasks.filter(x => x.is_completed)).length
  const taskCount = ticketTasks.length
  const error = onEditMode.index > -1 && isEmpty(trim(onEditMode.value))

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
        return { ...x, rank: index + 1 }
      })
      setTicketTasks(newRanks);
      onSaveTaskChanges(newRanks)
    }
  }

  const onCompleteTask = (index) => {
    const newTasks = cloneDeep(ticketTasks)
    newTasks[index].is_completed = !newTasks[index].is_completed
    setTicketTasks(newTasks)
    onSaveTaskChanges(newTasks)
  }

  const addTicketTask = (event) => {
    preventEvent(event);
    if (!error) {
      let newTasks = cloneDeep(ticketTasks)
      newTasks.unshift(taskData)
      newTasks = newTasks.map((x, index) => ({ ...x, rank: index + 1 }))
      setTicketTasks(newTasks)
      dispatch(setCardPreferences({ card: 'tasksCard', preferences: { expanded: true } }))
      setOnEditMode({ index: 0, value: '' })
    }
  }

  const onTaskNameChange = (index) => {
    if (!isEmpty(trim(onEditMode.value))) {
      const newTasks = cloneDeep(ticketTasks)
      if (newTasks[index].task !== onEditMode.value) {
        newTasks[index].task = onEditMode.value
        setTicketTasks(newTasks)
        onSaveTaskChanges(newTasks)
      }
      setOnEditMode({ index: -1, value: '' })
    }
  }

  const onNameClick = (index, task) => {
    if (onEditMode.index > -1) {
      onTaskNameChange(onEditMode.index)
    }

    if (!isEmpty(trim(onEditMode.value)) || onEditMode.index < 0) {
      setOnEditMode({ index, value: task.task })
    }
  }

  const onSaveTaskChanges = async (newTasks) => {
    try {
      const tasks = newTasks.map((x, index) => ({
        ...omit(x, ["__typename"]),
        rank: index + 1
      }))

      const hasNewTask = tasks.some(x => x.task_id === 0)
      await saveTicketTasks({
        variables: {
          ticket_id: ticket.ticket_id,
          tasks
        },
        update: (cache, { data }) => {
          if (hasNewTask) {
            setTicketTasks(data.saveTicketTasks)
          }
        },
        refetchQueries: [
          { query: GET_TICKET, variables: { id: ticket.ticket_id } },
        ],
      });
      dispatch(showSnackbar({
        message: "Ticket task updated successfully",
        severity: "success",
      }));
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "");
      dispatch(showSnackbar({ message: msg, severity: "error" }));
    }
  }

  const onEnter = (e, index) => {
    if (get(e, 'key', '').toLowerCase() === "enter") {
      onTaskNameChange(index)
    }
  }

  return (
    <AccordionCard
      label="Tasks"
      iconButtons={
        <>
          <ButtonWithLabel
            buttonLabel="Add Task"
            lablesVisible={lablesVisible}
            onClick={addTicketTask}
            disabled={error}
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
                              onMouseOver={() => setHover(index)}
                              onMouseLeave={() => setHover(-1)}
                              secondaryAction={<DragIndicator className="text-lighter f-20" />}
                            >
                              <TaskMenuOptions
                                ticket={ticket}
                                show={isHovered === index}
                                disabled={onEditMode.index === index}
                                task={task}
                                ticketTasks={ticketTasks}
                                setTicketTasks={setTicketTasks}
                                onSaveTaskChanges={onSaveTaskChanges}
                                handleOpenTicket={handleOpenTicket}
                                setOnEditMode={setOnEditMode}
                              />
                              <ListItemIcon >
                                <Checkbox
                                  checked={task.is_completed}
                                  onChange={() => onCompleteTask(index)}
                                  inputProps={{ 'aria-label': 'controlled' }}
                                  disabled={onEditMode.index === index}
                                  size="small"
                                />
                              </ListItemIcon>
                              {onEditMode.index === index ?
                                <TextField
                                  autoFocus
                                  variant="standard"
                                  className="m-0"
                                  fullWidth
                                  value={onEditMode.value}
                                  placeholder="Add text here"
                                  onChange={e => setOnEditMode({ index, value: e.target.value })}
                                  onBlur={() => onTaskNameChange(index)}
                                  error={error}
                                  onKeyDown={(e) => onEnter(e, index)}
                                  inputProps={{ maxLength: 100 }}
                                  style={{ width: "90%" }}
                                />
                                : <ListItemText
                                  id={task.id}
                                  primary={
                                    <Typography
                                      variant="body2"
                                      onClick={() => onNameClick(index, task)}
                                      className={task.is_completed ? "text-decoration-line-through" : ""}
                                      style={{ cursor: "text", width: "90%" }}
                                    >
                                      {task.task}
                                    </Typography>
                                  }


                                />
                              }
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
