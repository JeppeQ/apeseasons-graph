import { BigInt, dataSource } from "@graphprotocol/graph-ts"
import { Deploy, BuyTicket } from "../../generated/templates/Tournament/tournament"
import { Tournament, Player, TokenBalance } from "../../generated/schema"

export function handleDeploy(event: Deploy): void {
  let context = dataSource.context();
  let entity = new Tournament(event.transaction.from.toHex())

  entity.startBlock = event.params.startBlock
  entity.endBlock = event.params.endBlock
  entity.ticketPrice = event.params.ticketPrice
  entity.ticketToken = context.getBytes('ticketToken');
  entity.playerCount = 0
  entity.finalized = false

  entity.save()
}

export function handleBuyTicket(event: BuyTicket): void {
  let tourney = event.transaction.to.toHex()
  let player = event.transaction.from.toHex()

  let tourneyEntity = Tournament.load(tourney)
  tourneyEntity.playerCount += 1
  tourneyEntity.save()

  let playerEntity = new Player(player)
  playerEntity.tournament = tourneyEntity.id
  playerEntity.rewarded = false
  playerEntity.save()

  let tokensEntity = new TokenBalance(player + tourneyEntity.ticketToken.toString())
  tokensEntity.player = playerEntity.id
  tokensEntity.token = tourneyEntity.ticketToken
  tokensEntity.amount = tourneyEntity.ticketPrice
  tokensEntity.save()
}