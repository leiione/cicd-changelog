import { gql } from '@apollo/client';

export const SAVE_SURVEY = gql`
  mutation saveSurvey($input: SurveyInput!) {
    saveSurvey(input: $input) {
      id
      type
      category
      score
      datetime
      appuser_id
      note
      flag_deleted
    }
  }
`