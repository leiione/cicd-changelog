import gql from "graphql-tag"

export const SAVE_USER_PREFERENCES = gql`
  mutation saveCRMUserPreferences($preferences: String!) {
    saveCRMUserPreferences(preferences: $preferences)
  }
`

export const GET_USER_PREFERENCES = gql`
  query getCRMUserPreferences {
    getCRMUserPreferences
  }
`