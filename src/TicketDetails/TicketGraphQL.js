import gql from "graphql-tag"

export const GET_TICKET = gql`
  query ticket($id: Int!) {
    ticket(id: $id) {
      ticket_id
      description
      priority
      status
      assigned_name
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