import React, { useEffect, useState } from "react";
import { DragIndicator } from "@mui/icons-material";
import AccordionCard from "../../../Common/AccordionCard";
import ButtonWithLabel from "../../../Common/ButtonWithLabel";
import HeaderMenuOptions from "../../../components/HeaderMenuOptions";
import {
  Button,
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
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  SAVE_TICKET_TASKS,
  GET_ACTIVITIES,
  GET_TICKET_TASKS,
  TASK_SUBSCRIPTION,
} from "TicketDetails/TicketGraphQL";
import { useDispatch } from "react-redux";
import { setCardPreferences, setContentDrawer, showSnackbar } from "config/store";
import ProgressButton from "Common/ProgressButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/pro-regular-svg-icons";
import { useSelector } from "react-redux";
import { checkIfCacheExists } from "config/apollo";
import AddTicket from "AddTicket";

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: 0,
  // styles we need to apply on draggables
  backgroundColor: isDragging ? "khaki" : "", // not working
  ...draggableStyle,
});

const taskData = {
  task_id: 0,
  task: "",
  is_completed: false,
};

const Tasks = (props) => {
  const dispatch = useDispatch();
  const { ticket, tasks, appuser_id, lablesVisible, loading, handleOpenTicket, setTaskToConvert } =
    props;
  const [ticketTasks, setTicketTasks] = useState(tasks || []);
  const [isHovered, setHover] = useState(-1);
  const [onEditMode, setOnEditMode] = useState({ index: -1, value: "" });
  const [isSubmitting, setSubmitting] = useState(false);
  const [saveTicketTasks] = useMutation(SAVE_TICKET_TASKS);

  useEffect(() => {
    if (!loading && tasks !== ticketTasks && onEditMode.index < 0) {
      const sortedTasks = sortBy(tasks, "rank");
      setTicketTasks(sortedTasks);
      setOnEditMode({ index: -1, value: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, ticket.ticket_id, ticket.ticket_type_id, tasks]);

  const completed = ticketTasks.filter((x) => x.is_completed).length;
  const taskCount = ticketTasks.filter((x) => x.task_id !== 0).length;
  const error = onEditMode.index > -1 && isEmpty(trim(onEditMode.value));

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    if (result.source.index !== result.destination.index) {
      const items = reorder(
        ticketTasks,
        result.source.index,
        result.destination.index
      );

      const newRanks = items.map((x, index) => {
        return { ...x, rank: index + 1 };
      });
      setTicketTasks(newRanks);
      onSaveTaskChanges(newRanks);
    }
  };

  const onCompleteTask = (index) => {
    const newTasks = cloneDeep(ticketTasks);
    newTasks[index].is_completed = !newTasks[index].is_completed;
    setTicketTasks(newTasks);
    onSaveTaskChanges(newTasks);
  };

  const addTicketTask = (event) => {
    preventEvent(event);
    if (!error) {
      let newTasks = cloneDeep(ticketTasks);
      newTasks.unshift(taskData);
      newTasks = newTasks.map((x, index) => ({ ...x, rank: index + 1 }));
      setTicketTasks(newTasks);
      dispatch(
        setCardPreferences({
          card: "tasksCard",
          preferences: { expanded: true },
        })
      );
      setOnEditMode({ index: 0, value: "" });
    }
  };

  const onTaskNameChange = async (index) => {
    if (!isEmpty(trim(onEditMode.value))) {
      const newTasks = cloneDeep(ticketTasks);
      if (newTasks[index].task !== onEditMode.value) {
        newTasks[index].task = onEditMode.value;
        setTicketTasks(newTasks);
        await onSaveTaskChanges(newTasks);
      }
      setOnEditMode({ index: -1, value: "" });
    }
  };

  const onNameClick = (index, task) => {
    if (onEditMode.index > -1) {
      onTaskNameChange(onEditMode.index);
    }

    if (!isEmpty(trim(onEditMode.value)) || onEditMode.index < 0) {
      setOnEditMode({ index, value: task.task });
    }
  };

  const onSaveTaskChanges = async (newTasks) => {
    try {
      setSubmitting(true);
      const tasks = newTasks.map((x, index) => ({
        ...omit(x, ["is_default", "__typename", "flag_ticket_deleted", "default_required"]),
        rank: index + 1,
      }));

      const hasNewTask = tasks.some((x) => x.task_id === 0);
      await saveTicketTasks({
        variables: {
          ticket_id: ticket.ticket_id,
          tasks,
        },
        update: (cache, { data }) => {
          if (hasNewTask) {
            setTicketTasks(data.saveTicketTasks);
          }
        },
        refetchQueries: [
          { query: GET_TICKET_TASKS, variables: { ticket_id: ticket.ticket_id } },
          { query: GET_ACTIVITIES, variables: { ticket_id: ticket.ticket_id } },
        ],
      });
      dispatch(
        showSnackbar({
          message: "Ticket task updated successfully",
          severity: "success",
        })
      );
      setSubmitting(false);
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "");
      dispatch(showSnackbar({ message: msg, severity: "error" }));
      setSubmitting(false);
    }
  };

  const onEnter = (e, index) => {
    if (get(e, "key", "").toLowerCase() === "enter") {
      onTaskNameChange(index);
    }
  };

  const onCancelTask = () => {
    let newTasks = cloneDeep(ticketTasks);
    newTasks = newTasks.filter((x) => x.task_id !== 0);
    setTicketTasks(newTasks);
    setOnEditMode({ index: -1, value: "" });
  };

  const onTaskClick = (ticket) => {
    const updatedTicket = {
      ...ticket,
      ticket_id: ticket.converted_ticket_id,
    };
    handleOpenTicket({ ...updatedTicket, disableCRMDrawertoggleButton: true });
  };

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
            buttonIcon={<FontAwesomeIcon icon={faPlusCircle} />}
          />
          <span className="text-muted ml-3">
            {loading ? (
              <Skeleton
                animation="wave"
                style={{
                  height: 25,
                  backgroundColor: "##dfdede",
                  width: "130px",
                }}
              />
            ) : (
              `${completed}/${taskCount} task completed`
            )}
          </span>
        </>
      }
      menuOption={
        <HeaderMenuOptions appuser_id={appuser_id} category="Task Card" />
      }
    >
      {loading ? (
        <Skeleton
          animation="wave"
          style={{ height: 30, backgroundColor: "##dfdede", width: "60%" }}
        />
      ) : ticketTasks.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <List dense {...provided.droppableProps} ref={provided.innerRef}>
                {ticketTasks.length > 0 &&
                  ticketTasks.map((task, index) => (
                    <Draggable
                      key={index}
                      draggableId={`draggable-${index}`}
                      index={index}
                    >
                      {(provided) => {
                        return (
                          <ListItem
                            key={task.task_id}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              ),
                            }}
                            className={
                              task.converted_ticket_id > 0 &&
                              !task.flag_ticket_deleted
                                ? "bg-hover"
                                : ""
                            }
                            onMouseOver={() => setHover(index)}
                            onMouseLeave={() => setHover(-1)}
                            secondaryAction={
                              <DragIndicator
                                className="text-lighter f-20"
                                hidden={onEditMode.index === index}
                              />
                            }
                          >
                            {task.task_id > 0 && (
                              <>
                                <TaskMenuOptions
                                  ticket_id={ticket.ticket_id}
                                  ticket={ticket}
                                  show={isHovered === index}
                                  disabled={
                                    onEditMode.index === index ||
                                    (task.converted_ticket_id > 0 &&
                                      !task.flag_ticket_deleted)
                                  }
                                  task={task}
                                  ticketTasks={ticketTasks}
                                  setTicketTasks={setTicketTasks}
                                  onSaveTaskChanges={onSaveTaskChanges}
                                  setTaskToConvert={setTaskToConvert}
                                  setOnEditMode={setOnEditMode}
                                  onEdit={() => onNameClick(index, task)}
                                />
                                <ListItemIcon>
                                  <Checkbox
                                    checked={task.is_completed}
                                    onChange={() => onCompleteTask(index)}
                                    inputProps={{ "aria-label": "controlled" }}
                                    disabled={
                                      onEditMode.index === index ||
                                      (task.converted_ticket_id > 0 &&
                                        !task.flag_ticket_deleted)
                                    }
                                    size="small"
                                  />
                                </ListItemIcon>
                              </>
                            )}
                            {onEditMode.index === index ? (
                              <ListItemText>
                                <div
                                  className="position-relative"
                                  style={
                                    task.task_id === 0
                                      ? { margin: "0px 20px 20px 53px" }
                                      : { marginRight: "20px" }
                                  }
                                >
                                  <TextField
                                    autoFocus
                                    variant="standard"
                                    className="m-0"
                                    fullWidth
                                    value={onEditMode.value}
                                    placeholder="Add text here"
                                    onChange={(e) =>
                                      setOnEditMode({
                                        index,
                                        value: e.target.value,
                                      })
                                    }
                                    error={error}
                                    onKeyDown={(e) => onEnter(e, index)}
                                    inputProps={{ maxLength: 100 }}
                                  />
                                  <div
                                    className="position-absolute right-0 bg-white rounded shadow"
                                    style={{ bottom: -32, zIndex: 99 }}
                                  >
                                    <ProgressButton
                                      color="primary"
                                      size="small"
                                      className="my-1"
                                      onClick={() => onTaskNameChange(index)}
                                      isSubmitting={isSubmitting}
                                    >
                                      Save
                                    </ProgressButton>
                                    <Button
                                      color="default"
                                      size="small"
                                      className="my-1"
                                      disabled={isSubmitting}
                                      onClick={onCancelTask}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </ListItemText>
                            ) : (
                              <ListItemText
                                id={task.id}
                                primary={
                                  <Typography
                                    variant="body2"
                                    className={
                                      task.is_completed
                                        ? "text-decoration-line-through"
                                        : ""
                                    }
                                    style={{ width: "90%" }}
                                  >
                                    {task.converted_ticket_id > 0 &&
                                    !task.flag_ticket_deleted ? (
                                      <span
                                        onClick={() => onTaskClick(task)}
                                        style={{
                                          color: "#0053F4",
                                          cursor: "pointer",
                                        }}
                                      >
                                        {`${task.task}${" *"}`}
                                      </span>
                                    ) : (`${task.task}${task.default_required ? " *" : ""}`)}
                                  </Typography>
                                }
                              />
                            )}
                          </ListItem>
                        );
                      }}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <Typography className="text-muted" variant="body2">
          No Task Added.
        </Typography>
      )}
    </AccordionCard>
  );
};

const TicketTaskContainer = props => {
  const dispatch = useDispatch()
  const online = useSelector(state => state.networkStatus?.online || false);
  const contentDrawer = useSelector(state => state.contentDrawer);
  const { ticket, handleOpenTicket, addRecentActionsDrawer } = props;

  const [convertTask, setTaskToConvert] = useState(null);
  
  const { data, error, loading, client, refetch } = useQuery(GET_TICKET_TASKS, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: online ? "cache-and-network" : "cache-only",
  });

  const cacheExists = checkIfCacheExists(client, { query: GET_TICKET_TASKS, variables: { ticket_id: ticket.ticket_id } })

  const tasks = (!loading || cacheExists) && data && data.ticketTasks ? data.ticketTasks : [];

  useSubscription(TASK_SUBSCRIPTION, {
    variables: { ticket_id: ticket.ticket_id },
    onData: async () => {
      refetch();
    },
  });

  const onClose = () => {
    setTaskToConvert(null);
    dispatch(setContentDrawer({
      open: false,
      id: 0,
    }));
  };

  const handleOpenTicketMS = (ticket, action, prevTicket) => {
    if (contentDrawer && contentDrawer.open && contentDrawer.ticket_id > 0) {
      if (addRecentActionsDrawer && action === 'docked' && prevTicket && prevTicket.ticket_id > 0) {
        addRecentActionsDrawer({ ...prevTicket, category: "Service Desk", name: prevTicket.summary || prevTicket.type, id: prevTicket.ticket_id, fromMS: true })
      }
      dispatch(setContentDrawer({
        open: true,
        component: 'ticket',
        description: ticket.description || ticket.type,
        id: ticket.ticket_id,
        ticket_id: ticket.ticket_id,
        ticket: ticket
      }));
    } else {
      handleOpenTicket(ticket, action, prevTicket)
    }
    setTaskToConvert(null);
  }

  return (
    <>
      <Tasks
        {...props}
        ticket={ticket}
        loading={loading && !cacheExists}
        tasks={tasks}
        taskError={error}
        handleOpenTicket={handleOpenTicketMS}
        setTaskToConvert={setTaskToConvert}
      />
      {convertTask && (
        <AddTicket
          category={"Convert to Ticket"}
          ticket={convertTask.ticket}
          handleOpenTicket={handleOpenTicketMS}
          hideContentDrawer={onClose}
        />
      )}
    </>
  )
};

export default TicketTaskContainer;
