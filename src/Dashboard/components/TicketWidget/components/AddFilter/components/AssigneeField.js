import { useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
import { checkIfCacheExists } from "config/apollo";
import HookMultiAutoComplete from "Dashboard/common/HookMultiAutoComplete";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { GET_ASSIGNEES } from "TicketDetails/TicketGraphQL";

const AssigneeField = ({ control, name }) => {
  const online = useSelector(state => state.networkStatus?.online || false);
  const { data, loading, error, client } = useQuery(GET_ASSIGNEES, {
    fetchPolicy: online ? "network-only" : "cache-only",
  });
  const cacheExists = checkIfCacheExists(client, { query: GET_ASSIGNEES })

  const assignees = useMemo(() => {
    let options = []
    if ((!loading || cacheExists) && data?.assignees) {
      options = data.assignees.map(assignee => ({
        label: assignee.realname,
        value: assignee.appuser_id
      }))
    }
    return options;
  }, [loading, cacheExists, data]);
  
  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <HookMultiAutoComplete
      label="Assignee*"
      control={control}
      name={name}
      options={assignees}
    />
  );
};

export default AssigneeField;