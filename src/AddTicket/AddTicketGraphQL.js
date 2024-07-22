import gql from "graphql-tag"

export const ADD_TICKET = gql`
  mutation addTicket($input_ticket: TicketInput) {
    addTicket(input_ticket: $input_ticket) {
      ticket_id
      priority
      status
      description
    }
  }
`

export const SEARCH_EQUIPMENT = gql`
  query searchEquipment($searchValue: String!) {
    searchEquipment(searchValue: $searchValue)
  }
`

export const SEARCH_INFRASTRUCTURE = gql`
  query searchInfrastructure($searchValue: String!) {
    searchInfrastructure(searchValue: $searchValue)
  }
`

export const SEARCH_SUBSCRIBER = gql`
  query searchCustomer($searchValue: String!) {
    searchCustomer(searchValue: $searchValue)
  }
`


export const GET_TICKET_TYPES = gql`
  query ticketTypes {
    ticketTypes {
      ticket_type_id
      ticket_type_desc
    }
  }
`