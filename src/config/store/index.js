import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'crm-redux',
  initialState: {
    timeZone: '',
    ispId: null,
    settingsPreferences: {},
    user: {},
    networkStatus: {},
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
        ...action.payload.crmDrawerPreferences,
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
} = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
})

export default store
