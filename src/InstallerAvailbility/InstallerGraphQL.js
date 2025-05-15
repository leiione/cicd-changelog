import gql from "graphql-tag";

export const INSTALLER_AVAILABILITY_QUERY = gql`
  query InstallerAvailability {
    installerAvailability {
      work_hours
      work_days
      user_name
      user_id
      skills
      Scheduled_off
      time_off_count
    }
  }
`;

export const SCHEDULE_OFF_TIME = gql`
  mutation ScheduleOffTime(
    $userIds: [Int!]!
    $startTime: String!
    $endTime: String!
    $flagAllDay: Boolean!
    $ispId: Int
    $reason: String
    $id: Int
  ) {
    scheduleOffTime(
      input: {
        userIds: $userIds
        startTime: $startTime
        endTime: $endTime
        flagAllDay: $flagAllDay
        ispId: $ispId
        reason: $reason
        id: $id
      }
    ) {
      success
      message
      timeOffIds
    }
  }
`;

export const DELETE_SCHEDULE_OFF_TIME = gql`
  mutation DeleteScheduleOffTime($id: Int!) {
    deleteScheduleOffTime(id: $id) {
      success
      message
    }
  }
`;


export const GET_INSTALLER_SCHEDULE_OFF = gql`
  query GetInstallerScheduleOff($userId: Int!) {
    getInstallerScheduleOff(appuser_id: $userId) {
      id
      user_id
      user_name
      date
      time
      reason
    }
  }
`;



export const GET_INSTALLER_SCHEDULE_OFF_DETAIL = gql`
  query GetInstallerScheduleOff($id: Int!) {
    getInstallerScheduleOffDetail(id: $id) {
      id
      user_id
      user_name
      reason
      start_time
      end_time
      flag_all_day
    }
  }
`;