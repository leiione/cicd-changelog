import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'irm-redux',
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
    equipment_card_layouts: [
      { i: "sites", x: 0, y: 0, w: 2, h: 7 },
      { i: "equipment", x: 0, y: 7, w: 2, h: 7 },
      { i: "purchase_orders", x: 0, y: 14, w: 2, h: 7 }
    ],
    card_settings: {
      sites: {
        fullWidth: true,
        viewAs: "list"
      },
      equipment: {
        fullWidth: true,
        cardView: "profiles",
        profile_id: 0,
        assemblies: {
          viewAs: "tiles"
        },
        profiles: {
          viewAs: "tiles"
        },
        inventory: {
          viewAs: "list"
        }
      },
      purchase_orders: {
        fullWidth: true,
        viewAs: "list"
      }
    },
    infrastructureTableOptions: {
      openColumnChooser: false,
      enableInlineEditing: false,
      pagination: { pageSize: 25 },
      columnOrder: [
        'icon_url',
        'name',
        'street',
        'suffix',
        'city',
        'state',
        'zip',
        'profile_name',
        'max_elevation',
        "latitude",
        "longitude",
        "site_status"
      ],
      columnWidths: {
        icon_url: 45,
        name: 170,
        street: 180,
        suffix: 180,
        city: 160,
        state: 150,
        zip: 140,
        profile_name: 160,
        max_elevation: 140,
        latitude: 180,
        longitude: 180,
        site_status: 80
      }
    },
    inventoryItemsListOptions: {
      openColumnChooser: false,
      columnOrder: ["serial", "location", "date_modified", "order_id", "purchase_price"],
      columnWidths: {
        serial: 150,
        location: 160,
        date_modified: 120,
        order_id: 80,
        purchase_price: 100
      }
    },
    purchaseOrdersOptions: {
      openColumnChooser: false,
      enableInlineEditing: false,
      columnOrder: ["id", "item_name", "vendor", "created_on", "submitted_on", "status", "total"],
      showArchived: false,
      columnWidths: {
        id: 200,
        item_name: 350,
        vendor: 250,
        created_on: 200,
        submitted_on: 200,
        status: 220,
        total: 200
      },
    },
    equipmentItemsOptions: {
      openColumnChooser: false,
      enableInlineEditing: false,
      enableBulkEditing: false,
      columnOrder: ["icon_url", "profileDescription", "type", "description", "location_name", "parentDescription", "subscriber_id", "serial", "mac_address", "ip_address",],
      columnWidths: {
        icon_url: 40,
        "profileDescription": 160,
        "type": 100,
        description: 180,
        location_name: 200,
        parentDescription: 190,
        subscriber_id: 0,
        serial: 0,
        mac_address: 0,
        ip_address: 0
      }
    },
    inventoryTableOptions: {
      openColumnChooser: false,
      enableInlineEditing: false,
      pagination: { pageSize: 25 },
      columnOrder: ["model", "manufacturer", "description", "sku", "assigned", "total", "serial", "mac_address", "ip_address", "location", "type", "equipment_description"],
      columnWidths: {
        model: 400,
        manufacturer: 300,
        description: 450,
        sku: 300,
        assigned: 150,
        total: 150,
        serial: 0,
        mac_address: 0,
        ip_address: 0,
        location: 0,
        type: 0,
        equipment_description: 0,
      }
    },
    equipmentTableOptions: {
      openColumnChooser: false,
      enableInlineEditing: false,
      pagination: { pageSize: 25 },
      columnOrder: ["summary", "description", "type", "assigned_count", "sku", "serial", "mac_address", "ip_address", "location", "manufacturer"],
      columnWidths: {
        summary: 500,
        description: 400,
        type: 200,
        assigned_count: 200,
        sku: 0,
        serial: 0,
        mac_address: 0,
        ip_address: 0,
        location: 0,
        manufacturer: 0
      }
    },
    equipmentAssembliesTableOptions: {
      openColumnChooser: false,
      enableInlineEditing: false,
      pagination: { pageSize: 25 },
      columnOrder: ["icon_url", "description", "summary", "profile_description", "location_name", "type", "sku", "serial", "mac_address", "ip_address", "location", "manufacturer", "equipment_assembly_status"],
      columnWidths: {
        icon_url: 45,
        description: 330,
        summary: 320,
        profile_description: 430,
        location_name: 330,
        type: 180,
        equipment_assembly_status: 80,
        sku: 0,
        serial: 0,
        mac_address: 0,
        ip_address: 0,
        location: 0,
        manufacturer: 0
      }
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
    setCardSettings: (state, action) => {
      const { category, card_settings } = action.payload
      return {
        ...state,
        card_settings: {
          ...state.card_settings,
          [category]: { ...card_settings }
        },
        userPreferencesTimeStamp: new Date()
      }
    },
    setCardEquipmentGridLayouts: (state, action) => {
      return {
        ...state,
        equipment_card_layouts: action.payload,
        userPreferencesTimeStamp: new Date()
      }
    },
    setInfrastructureTableOptions: (state, action) => {
      return {
        ...state,
        infrastructureTableOptions: {
          ...state.infrastructureTableOptions,
          ...action.payload
        },
        userPreferencesTimeStamp: new Date()
      }
    },
    setInventoryItemsListOptions: (state, action) => {
      return {
        ...state,
        inventoryItemsListOptions: {
          ...state.inventoryItemsListOptions,
          ...action.payload
        }
      }
    },
    setPurchaseOrdersOptions: (state, action) => {
      return {
        ...state,
        purchaseOrdersOptions: {
          ...state.purchaseOrdersOptions,
          ...action.payload
        }
      }
    },
    setEquipmentItemsOptions: (state, action) => {
      return {
        ...state,
        equipmentItemsOptions: {
          ...state.equipmentItemsOptions,
          ...action.payload
        }
      }
    },
    setInventoryTableOptions: (state, action) => {
      return {
        ...state,
        inventoryTableOptions: {
          ...state.inventoryTableOptions,
          ...action.payload
        },
        userPreferencesTimeStamp: new Date()
      }
    },
    setEquipmentTableOptions: (state, action) => {
      return {
        ...state,
        equipmentTableOptions: {
          ...state.equipmentTableOptions,
          ...action.payload
        },
        userPreferencesTimeStamp: new Date()
      }
    },
    setEquipmentAssembliesTableOptions: (state, action) => {
      return {
        ...state,
        equipmentAssembliesTableOptions: {
          ...state.equipmentAssembliesTableOptions,
          ...action.payload
        },
        userPreferencesTimeStamp: new Date()
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
  setCardSettings,
  setCardEquipmentGridLayouts,
  setInfrastructureTableOptions,
  setInventoryItemsListOptions,
  setEquipmentItemsOptions,
  setInventoryTableOptions,
  setEquipmentTableOptions,
  setEquipmentAssembliesTableOptions,
  setPurchaseOrdersOptions,
  setUnsavedFormStatus
} = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
})

export default store
