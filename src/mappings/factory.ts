import { DataSourceContext } from "@graphprotocol/graph-ts"
import { CreateTournament } from "../../generated/tournamentFactory/tournamentFactory"
import { Tournament } from "../../generated/templates"

export function handleCreateTournament(event: CreateTournament): void {
  let context = new DataSourceContext()

  context.setBytes('ticketToken', event.params._ticketToken)

  Tournament.createWithContext(event.params.tournamentAddress, context)
}
