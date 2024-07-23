import gql from "graphql-tag";

export const GET_TICKET = gql`
  query ticket($id: Int!) {
    ticket(id: $id) {
      ticket_id
      description
      priority
      created_by 
      created_by_time
      last_updated_by
      last_updated_by_time
      status
      type
      ticket_type_id
      assigned_name
      followers
      due_by_date
      earliest_arrival_time
      latest_arrival_time
      category_type
      subscriber
      address
      ticket_contact_numbers
      ticket_contact_email
      location_id
      equipment_id
      site_contact_id
      infrastructure_address
      infrastructure {
        id
        first_name
        last_name
        main_company
        address {
          id
          street
          suffix
          city
          state
          zip
        }
        phone_numbers {
          id
          number
          type
        }
        email_addresses {
          id
          email
          type
        }
      }
      linked_count
    }
    ticketTypes {
      ticket_type_id
      ticket_type_desc
    }
    ticketStatuses {
      id
      name
    }
  }
`;

export const DELETE_TICKET = gql`
  mutation deleteTicket($id: Int!) {
    deleteTicket(id: $id) {
      ticket_id
    }
  }
`;

// 1. Define the GraphQL mutation
export const UPDATE_TICKET_MUTATION = gql`
  mutation UpdateTicket($input_ticket: TicketInput!) {
    updateTicket(input_ticket: $input_ticket) {
      ticket_id
    }
  }
`;

export const GET_CUSTOMER_ADDRESSES = gql`
  query customerAddresses($customer_id: Int!) {
    customerAddresses(customer_id: $customer_id) {
      type
      address1
      address2
      city
      state
      zip
    }
  }
`;

export const GET_SITE_CONTACTS = gql`
  query serviceContacts($location_id: Int, $equipment_id: Int) {
    serviceContacts(location_id: $location_id, equipment_id: $equipment_id) {
      id
      first_name
      last_name
      main_company
      address {
        id
        street
        suffix
        city
        state
        zip
      }
      phone_numbers {
        id
        number
        type
      }
      email_addresses {
        id
        email
        type
      }
    }
  }
`;

export const GET_LINKED_TICKETS = gql`
  query linkedTickets($ticket_id: Int!) {
    linkedTickets(ticket_id: $ticket_id) {
      id
      type_id
      ticket_id
      option_label
      description
      status
      priority
    }
  }
`;

export const REMOVE_LINKED_TICKET = gql`
  mutation removeLinkedTicket(
    $link_id: Int
    $ticket_id: Int
    $linked_ticket_id: Int
  ) {
    removeLinkedTicket(
      link_id: $link_id
      ticket_id: $ticket_id
      linked_ticket_id: $linked_ticket_id
    ) {
      id
      ticket_id
    }
  }
`;

export const GET_DETAIL_TEXT = gql`
    query workflowOrder($ticket_id: Int!) {
      workflowOrder(ticket_id: $ticket_id) {
        detail_text
      }
    }
`;

export const UPDATE_DETAIL_TEXT = gql`
  mutation updateTicketWorkOrder (
      $ticket_id: Int!
      $detail_id: Int!
      $history_id: Int!
      $detail_text: String
    ) {
      updateTicketWorkOrder (
        ticket_id: $ticket_id
        detail_id: $detail_id
        history_id: $history_id
        detail_text: $detail_text
      ) 
    }
`;

export const GET_ASSIGNEES = gql`
  query assignees {
    assignees {
      appuser_id
      email
      realname
    }
  }
`;

export const GET_FOLLOWERS = gql`
  query FOLLOWERS {
    followers {
      appuser_id
      email
      realname
    }
  }
`;

export const GET_TICKETS_QUERY = gql`
  query GetTickets($searchVal: String!, $ticket_id: Int!) {
    tickets(searchVal: $searchVal, ticket_id: $ticket_id) {
      ticket_id
      description
      status
      priority
      type
    }
  }
`;

export const GET_TICKET_LINK_TYPES = gql`
  query GetTicketLinkTypes {
    ticketLinkTypes {
      id
      name
      option_label
      group_label
      linked_type_id_partner
    }
  }
`;


export const ADD_LINKED_TICKET_MUTATION = gql`
  mutation AddLinkedTicket($ticket_id: Int!, $linked_input: LinkedTicketInput!) {
    addLinkedTicket(ticket_id: $ticket_id, linked_input: $linked_input) {
      id
    }
  }
`;
