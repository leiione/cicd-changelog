import { pick } from "lodash"

export const saveUserPreferences = (saveCRMUserPreferences, state) => {
  const authorization = localStorage.getItem("Visp.token")
  if (authorization) { // execute only when the authorization is not empty to prevent 404 error.
    saveCRMUserPreferences({
      variables: {
        preferences: JSON.stringify({
          crmDrawerPreferences: {
            ...pick(state, [
              "summaryCard",
              "tasksCard",
              "messagesCard",
              "attachmentsCard",
              "billOfMaterialCard",
              "activityCard",
            ])
          },
        })
      }
    })
  }
}