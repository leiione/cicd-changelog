import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'crm-redux',
  initialState: {
    timeZone: '',
    ispId: null,
    settingsPreferences: {},
    user: {},
    networkStatus: {},
    ticketTablePreferences: {
      activeTab: 'list',
      technicianId: null,
      statusFilter: [],
      priorityFilter: [],
      schedulingFilter: [],
      dateRange: { 
        startDate: null, 
        endDate: null 
      },
      columns: [],
      sortBy: 'ticket_id',
      sortDirection: 'desc',
      pageSize: 50,
      pageNumber: 0
    },
    userPreferencesTimeStamp: null,
    snackbar: {
      open: false,
      message: "",
      duration: 4000,
    },
    contentDrawer: {
      open: false,
      id: 0,
    },
    ticketDashboardWidget: {
      items: [],
      nextId: 1
    },
    unsavedFormStatus: { category: null, isFormDirty: false, open: false, handleContinue: null },
    summaryCard: {
      expanded: true,
      subComponent: {
        service: true,
        schedule: false,
        linkedTickets: false,
        assignee: false,
      }
    },
    tasksCard: {
      expanded: false
    },
    messagesCard: {
      expanded: false,
      filter: "all"
    },
    attachmentsCard: {
      expanded: false,
    },
    billOfMaterialCard: {
      expanded: false,
    },
    activityCard: {
      expanded: false,
    },
  },
  reducers: {
    setInitialUserPreferences: (state, action) => {
      return {
        ...state,
        ...(action.payload.crmDrawerPreferences ? action.payload.crmDrawerPreferences : action.payload),
        setPreferences: true
      }
    },
    populateISPUserSettings: (state, action) => {
      return {
        ...state,
        ...action.payload
      }
    },
    preferenceSaved: (state, action) => {
      return { ...state, userPreferencesTimeStamp: null }
    },
    showSnackbar: (state, action) => {
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          ...action.payload,
          open: true
        }
      }
    },
    hideSnackbar: (state, action) => {
      return {
        ...state,
        snackbar: {
          open: false,
          message: "",
          duration: 4000,
        },
      }
    },
    setUnsavedFormStatus: (state, action) => {
      let status = { ...action.payload }
      if (action.payload.open) {
        status = {
          ...status,
          isFormDirty: true
        }
      } else if (!action.payload.isFormDirty) {
        status = { category: null, isFormDirty: false, open: false, handleContinue: null }
      }

      return {
        ...state,
        unsavedFormStatus: status
      }
    },
    setCardPreferences: (state, action) => {
      return {
        ...state,
        [action.payload.card]: {
          ...state[action.payload.card],
          ...action.payload.preferences
        },
        userPreferencesTimeStamp: new Date()
      }
    },
    setDashboardCards: (state, action) => {
      return {
        ...state,
        ticketDashboardWidget: {
          ...state.ticketDashboardWidget,
          ...action.payload
        },
        userPreferencesTimeStamp: new Date()
      }
    },

    setActiveTab: (state, action) => {
      state.ticketTablePreferences.activeTab = action.payload;
    },
    setTechnicianFilter: (state, action) => {
      state.ticketTablePreferences.technicianId = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.ticketTablePreferences.statusFilter = action.payload;
    },
    setPriorityFilter: (state, action) => {
      state.ticketTablePreferences.priorityFilter = action.payload;
    },
    setSchedulingFilter: (state, action) => {
      state.ticketTablePreferences.schedulingFilter = action.payload;
    },
    setDateRangeFilter: (state, action) => {
      state.ticketTablePreferences.dateRange = action.payload;
    },
    setTicketTableColumns: (state, action) => {
      state.ticketTablePreferences.columns = action.payload;
    },
    sortTicketTable: (state, action) => {
      const { sortBy, sortDirection } = action.payload;
      state.ticketTablePreferences.sortBy = sortBy;
      state.ticketTablePreferences.sortDirection = sortDirection;
    },
    setPageSize: (state, action) => {
      state.ticketTablePreferences.pageSize = action.payload;
      state.ticketTablePreferences.pageNumber = 0; // Reset to first page when changing page size
    },
    setPageNumber: (state, action) => {
      state.ticketTablePreferences.pageNumber = action.payload;
    },
    resetFilters: (state) => {
      state.ticketTablePreferences.technicianId = null;
      state.ticketTablePreferences.statusFilter = [];
      state.ticketTablePreferences.priorityFilter = [];
      state.ticketTablePreferences.schedulingFilter = [];
      state.ticketTablePreferences.dateRange = { startDate: null, endDate: null };
    }
  }
})

export const {
  setInitialUserPreferences,
  populateISPUserSettings,
  preferenceSaved,
  showSnackbar,
  hideSnackbar,
  setContentDrawer,
  setUnsavedFormStatus,
  setCardPreferences,
  setDashboardCards,
  setActiveTab,
  setTechnicianFilter,
  setStatusFilter,
  setPriorityFilter,
  setSchedulingFilter,
  setDateRangeFilter,
  setTicketTableColumns,
  sortTicketTable,
  setPageSize,
  setPageNumber,
  resetFilters
} = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
})

export default store
