import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'crm-redux',
  initialState: {
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
    unsavedFormStatus: { category: null, isFormDirty: false, open: false, handleContinue: null }
  },
  reducers: {
    setInitialUserPreferences: (state, action) => {
      return {
        ...state,
        ...action.payload.irmMicroserviceTablePreferences,
        ...action.payload.irmMicroserviceCardPreferences,
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
    setContentDrawer: (state, action) => {
      return {
        ...state,
        contentDrawer: action.payload
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
        status = {  category: null, isFormDirty: false, open: false, handleContinue: null }
      }

      return {
        ...state,
        unsavedFormStatus: status
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
  setUnsavedFormStatus
} = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
})

export default store
