import { DataSourceContext } from "@graphprotocol/graph-ts"
import { CreateTournament } from "../../generated/tournamentFactory/tournamentFactory"
import { Tournament } from "../../generated/templates"

export function handleCreateTournament(event: CreateTournament): void {
  let context = new DataSourceContext()

  context.setBytes('ticketToken', event.params.ticketToken)
  context.setBytes('address', event.params.tournamentAddress)
  context.setString('name', event.params.name)

  Tournament.createWithContext(event.params.tournamentAddress, context)
}
