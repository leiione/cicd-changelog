import gql from "graphql-tag"

export const GET_TICKET = gql`
 query ticket($id: Int!) {
    ticket(id: $id) {
      ticket_id
      description
      priority
      status
      type
      ticket_type_id
      assigned_name
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
`

export const DELETE_TICKET = gql`
  mutation deleteTicket($id: Int!) {
    deleteTicket(id: $id) {
      ticket_id
    }
  }
`

// 1. Define the GraphQL mutation
export const UPDATE_TICKET_MUTATION = gql`
  mutation UpdateTicket($input_ticket: TicketInput!) {
    updateTicket(input_ticket: $input_ticket) {
      ticket_id
      priority
      status
      type
      due_by_date
      earliest_arrival_time
      latest_arrival_time
      address
    }
  }
`;


export const GET_CUSTOMER_ADDRESSES = gql`
  query customerAddresses ($customer_id: Int!) {
    customerAddresses(customer_id: $customer_id) {
      type
      address1
      address2
      city
      state
      zip
    }
  }
`

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
`

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
`