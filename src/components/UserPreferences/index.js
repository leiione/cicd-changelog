import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { debounce } from 'lodash'
import moment from 'moment-timezone'
import { useBeforeunload } from 'react-beforeunload';
import { preferenceSaved } from 'config/store';
import { GET_USER_PREFERENCES, SAVE_USER_PREFERENCES } from './UserPreferencesGraphQL';
import { useMutation } from '@apollo/client';

const savePreferences = ({
  saveCRMUserPreferences,
  crmDrawerPreferences
}) => {
  const authorization = localStorage.getItem("Visp.token")
  if (authorization) { // execute only when the authorization is not empty to prevent 404 error.
    saveCRMUserPreferences({
      variables: {
        preferences: JSON.stringify({ crmDrawerPreferences })
      },
      update: (cache, { data }) => {
        cache.writeQuery({
          query: GET_USER_PREFERENCES,
          data: {
            getCRMUserPreferences: data.saveCRMUserPreferences
          }
        })
      }
    })
  }
}

const debouncedSavePreferences = debounce(savePreferences, 3000)
// the time is on ms rather than seconds... so it is 3s now...

export const UserPreferences = () => {
  const dispatch = useDispatch()
  const lastChanges = useSelector(state => state.userPreferencesTimeStamp)
  const summaryCard = useSelector(state => state.summaryCard)
  const tasksCard = useSelector(state => state.tasksCard)
  const messagesCard = useSelector(state => state.messagesCard)
  const attachmentsCard = useSelector(state => state.attachmentsCard)
  const billOfMaterialCard = useSelector(state => state.billOfMaterialCard)
  const activityCard = useSelector(state => state.activityCard)

  const [saveCRMUserPreferences] = useMutation(SAVE_USER_PREFERENCES)

  useBeforeunload((event) => {
    if ((lastChanges !== null && moment().diff(moment(lastChanges)) < 3000)) {
      savePreferences({
        saveCRMUserPreferences,
        crmDrawerPreferences: {
          summaryCard,
          tasksCard,
          messagesCard,
          attachmentsCard,
          billOfMaterialCard,
          activityCard
        }
      })
      dispatch(preferenceSaved())
      event.preventDefault();
    }
  });

  useEffect(() => {
    if (lastChanges !== null) { // so that the initial null wont saveCRMUserPreferences
      debouncedSavePreferences({
        saveCRMUserPreferences,
        crmDrawerPreferences: {
          summaryCard,
          tasksCard,
          messagesCard,
          attachmentsCard,
          billOfMaterialCard,
          activityCard
        }
      })
    }
    // eslint-disable-next-line
  }, [lastChanges]);

  return null;
};

export default React.memo(UserPreferences);
