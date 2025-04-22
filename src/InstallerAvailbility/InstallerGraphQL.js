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
  ) {
    scheduleOffTime(
      input: {
        userIds: $userIds
        startTime: $startTime
        endTime: $endTime
        flagAllDay: $flagAllDay
        ispId: $ispId
        reason: $reason
      }
    ) {
      success
      message
      timeOffIds
    }
  }
`;

export const GET_INSTALLER_SCHEDULE_OFF = gql`
  query GetInstallerScheduleOff($userId: Int!) {
    getInstallerScheduleOff(appuser_id: $userId) {
      user_id
      user_name
      date
      time
      reason
    }
  }
`;
