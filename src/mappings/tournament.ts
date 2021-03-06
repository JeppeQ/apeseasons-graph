import { BigInt, dataSource } from "@graphprotocol/graph-ts"
import { Deploy, BuyTicket, Trade, WithdrawWinnings, GameFinalized } from "../../generated/templates/Tournament/tournament"
import {
  Tournament,
  Player,
  TokenBalance,
  Trade as TradeEntity,
  PlayerReward
} from "../../generated/schema"

export function handleDeploy(event: Deploy): void {
  let context = dataSource.context();
  let entity = new Tournament(context.getBytes('address').toHex())

  entity.name = context.getString('name')
  entity.eventBlock = event.block.number
  entity.start = (event.block.timestamp.times(BigInt.fromI32(1000))).plus(event.params.startBlock.minus(event.block.number).times(BigInt.fromI32(2100)))
  entity.end = (event.block.timestamp.times(BigInt.fromI32(1000))).plus(event.params.endBlock.minus(event.block.number).times(BigInt.fromI32(2100)))
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

  let playerEntity = new Player(tourney + player)
  playerEntity.address = event.transaction.from
  playerEntity.eventBlock = event.block.number
  playerEntity.tournament = tourneyEntity.id
  playerEntity.rewarded = false
  playerEntity.save()

  let tokensEntity = new TokenBalance(event.transaction.hash.toHex())
  tokensEntity.player = playerEntity.id
  tokensEntity.token = tourneyEntity.ticketToken
  tokensEntity.amount = tourneyEntity.ticketPrice
  tokensEntity.save()
}

export function handleTrade(event: Trade): void {
  let tourney = event.transaction.to.toHex()

  let entity = new TradeEntity(event.transaction.hash.toHex())
  entity.eventBlock = event.block.number
  entity.player = tourney + event.params.player.toHex()
  entity.tournament = tourney
  entity.from = event.params.from
  entity.to = event.params.to
  entity.fromAmount = event.params.amountFrom
  entity.toAmount = event.params.amountTo
  entity.time = event.block.timestamp
  entity.save()
}

export function handleWithdrawWinnings(event: WithdrawWinnings): void {
  let tourney = event.transaction.to.toHex()
  let player = tourney + event.transaction.from.toHex()

  let playerRewardEntity = new PlayerReward(player)
  playerRewardEntity.amount = event.params.winnings
  playerRewardEntity.eventBlock = event.block.number
  playerRewardEntity.player = player
  playerRewardEntity.tournament = tourney
  playerRewardEntity.save()
}

export function handleGameFinalized(event: GameFinalized): void {
  let tourney = event.transaction.to.toHex()

  let tourneyEntity = Tournament.load(tourney)
  tourneyEntity.eventBlock = event.block.number
  tourneyEntity.finalized = true
  tourneyEntity.save()
}