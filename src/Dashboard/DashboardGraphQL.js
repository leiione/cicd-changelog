import gql from "graphql-tag";

export const GET_ISP_TICKETS = gql`
  query GetISPTickets(
    $page: Int, 
    $pageSize: Int, 
    $technicianId: [Int], 
    $status: [String], 
    $priority: [String], 
    $scheduled: [Boolean],
    $ticketType: [Int],
    $flag_subscriber_deleted: Boolean,
    $dateRange: DateRangeInput,
    $dueDateRange: DateRangeInput,
    $sortField: String,
    $sortOrder: String,
    $searchVal: String,
    $timeZone: String
  ) {
    getISPTickets(
      page: $page, 
      pageSize: $pageSize,
      technicianId: $technicianId,
      status: $status,
      priority: $priority,
      scheduled: $scheduled,
      ticketType: $ticketType,
      flag_subscriber_deleted: $flag_subscriber_deleted,
      dateRange: $dateRange,
      dueDateRange: $dueDateRange,
      sortField: $sortField,
      sortOrder: $sortOrder,
      searchVal: $searchVal,
      timeZone: $timeZone
    ) {
      tickets {
        id: ticket_id
        ticket_id
        type
        priority
        summary
        address
        technician_name
        start
        end
        date_added
        phone
        subscriber_name
        subscriber_username
        subscriber_status
        subscriber_main_company
        last_modified
        status
        flag_serverplus
        category_type
        assigned_name
        customer_id
        technician_id
        ticket_type_id
        followers
        flag_print_include_notes
        scheduled_type
        max_duration
        technicians
      }
      totalCount
      filteredCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
      }
    }
  }
`;

export const GET_TICKET = gql`
  query GetISPTicket(
    $ticket_id: Int
  ) {
    getISPTickets(
     ticket_id: $ticket_id
    ) {
      tickets {
        id: ticket_id
        ticket_id
        type
        priority
        summary
        address
        technician_name
        start
        end
        date_added
        phone
        subscriber_name
        subscriber_username
        subscriber_main_company
        last_modified
        status
        flag_serverplus
        category_type
        assigned_name
        customer_id
        technician_id
        ticket_type_id
        followers
        flag_print_include_notes
        scheduled_type
        max_duration
        technicians
        isClosedBlocked
        isResolveBlocked
      }
     
    }
  }
`;


export const GET_FILTERED_TICKETS = gql`
  query GetISPTickets(
    $page: Int, 
    $pageSize: Int, 
    $technicianId: [Int], 
    $status: [String], 
    $priority: [String], 
    $scheduled: [Boolean],
    $ticketType: [Int],
    $flag_subscriber_deleted: Boolean,
    $dateRange: DateRangeInput,
    $dueDateRange: DateRangeInput,
    $sortField: String,
    $sortOrder: String
    $ticket_id: Int,
    $timeZone: String
  ) {
    getISPTickets(
      page: $page, 
      pageSize: $pageSize,
      technicianId: $technicianId,
      status: $status,
      priority: $priority,
      scheduled: $scheduled,
      ticketType: $ticketType,
      flag_subscriber_deleted: $flag_subscriber_deleted,
      dateRange: $dateRange,
      dueDateRange: $dueDateRange,
      sortField: $sortField,
      sortOrder: $sortOrder,
      ticket_id: $ticket_id,
      timeZone: $timeZone
    ) {
      tickets {
        id: ticket_id
        ticket_id
        type
        priority
        summary
        address
        technician_name
        start
        end
        date_added
        phone
        subscriber_name
        subscriber_username
        subscriber_status
        subscriber_main_company
        last_modified
        status
        flag_serverplus
        category_type
        assigned_name
        customer_id
        technician_id
        ticket_type_id
        followers
        flag_print_include_notes
        scheduled_type
        max_duration
        technicians
        isClosedBlocked
        isResolveBlocked
      }
      totalCount
      filteredCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
      }
    }
  }
`;

export const BULK_UPDATE_TICKETS = gql`
  mutation BulkUpdateTickets(
    $bulkAction: String
    $technicianId: [Int]
    $status: [String]
    $ticketType: [Int]
    $flag_subscriber_deleted: Boolean
    $dateRange: DateRangeInput
    $dueDateRange: DateRangeInput
    $excludedTicketIds: [Int]
    $includedTicketIds: [Int]
    
  ) {
    bulkUpdateTickets(
      bulkAction: $bulkAction
      technicianId: $technicianId
      status: $status
      ticketType: $ticketType
      flag_subscriber_deleted: $flag_subscriber_deleted
      dateRange: $dateRange
      dueDateRange: $dueDateRange
      excludedTicketIds: $excludedTicketIds
      includedTicketIds: $includedTicketIds
    )
  }
`