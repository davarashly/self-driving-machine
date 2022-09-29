import { Canvas, drawNetwork } from "@/modules"
import { Car, Road } from "@/models"
import { CarTypeEnum } from "@/common/enums"
import { Traffic } from "@/common/types"

export class Game {
  private gameCanvas: Canvas
  private networkCanvas: Canvas
  private overlayCanvas: Canvas
  private road: Road
  private car: Car
  private readonly traffic: Traffic
  private prevTimeStamp = 0
  private fps: number

  constructor() {
    this.gameCanvas = new Canvas("#game-canvas")
    this.networkCanvas = new Canvas("#network-canvas", "66%")
    this.overlayCanvas = new Canvas("#overlay-canvas", "100%")
    const canvasElement = this.gameCanvas.getCanvas()

    this.road = new Road(canvasElement.width / 2, canvasElement.width * 0.95, 3)
    this.car = new Car(
      this.road.getLaneCenter(Math.floor(this.road.getLaneCount() / 2)),
      canvasElement.height / 2,
      this.road.laneWidth * 0.45,
      this.road.laneWidth * 0.7,
      CarTypeEnum.AI_PLAYER
    )
    this.traffic = [
      new Car(
        this.road.getLaneCenter(Math.floor(this.road.getLaneCount() / 2)),
        canvasElement.height / 2 - 300,
        this.road.laneWidth * 0.45,
        this.road.laneWidth * 0.7
      )
    ]

    this.fps = 0
  }

  startGame() {
    this.game(0)
  }

  drawFPS() {
    this.drawOverlayText(this.fps + " FPS", "yellow")
  }

  drawOverlayText(text: string, color: string) {
    const overlayCtx = this.overlayCanvas.getContext()

    overlayCtx.font = "bold 30px Arial"
    overlayCtx.strokeStyle = "#000"
    overlayCtx.lineWidth = 1.75
    overlayCtx.fillStyle = color
    overlayCtx.fillText(text, window.innerWidth - 150, 50)
    overlayCtx.strokeText(text, window.innerWidth - 150, 50)
  }

  drawGameOver() {
    this.drawOverlayText("WASTED", "red")
  }

  private game(prevTimeStamp: number) {
    const [gameCanvasElement, gameCtx] = [
      this.gameCanvas.getCanvas(),
      this.gameCanvas.getContext()
    ]

    this.car.update(this.road.getBorders(), this.traffic)
    for (const trafficCar of this.traffic) {
      trafficCar.update(this.road.getBorders())
    }

    this.gameCanvas.updateWindow()
    this.networkCanvas.updateWindow()
    this.overlayCanvas.updateWindow()

    gameCtx.save()
    gameCtx.translate(0, -this.car.getY() + gameCanvasElement.height / 2)

    this.road.draw(gameCtx)

    this.car.draw(gameCtx)
    for (const trafficCar of this.traffic) {
      trafficCar.draw(gameCtx)
    }

    gameCtx.restore()

    if (!this.car.isBot) {
      const networkCtx = this.networkCanvas.getContext()
      networkCtx.lineDashOffset = -prevTimeStamp / 50

      drawNetwork(networkCtx, this.car.getBrain()!)
    }

    if (this.car.isDamaged()) {
      this.drawGameOver()

      return
    }

    const run = requestAnimationFrame(this.game.bind(this))

    if (run % 60 === 0) {
      const fpsDelta = (prevTimeStamp - this.prevTimeStamp) / 1000
      this.fps = Math.floor(1 / fpsDelta)
    }
    this.prevTimeStamp = prevTimeStamp

    this.drawFPS()
  }
}
