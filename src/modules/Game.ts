import { Canvas } from "@/modules"
import { Car, Road } from "@/models"
import { CarTypeEnum } from "@/common/enums"
import { Traffic } from "@/common/types"

export class Game {
  private gameCanvas: Canvas
  private overlayCanvas: Canvas
  private road: Road
  private car: Car
  private readonly traffic: Traffic
  private fps: number

  constructor() {
    this.gameCanvas = new Canvas("#game-canvas")
    this.overlayCanvas = new Canvas("#overlay-canvas", "100%")
    const canvasElement = this.gameCanvas.getCanvas()

    this.road = new Road(canvasElement.width / 2, canvasElement.width * 0.95, 3)
    this.car = new Car(
      this.road.getLaneCenter(Math.floor(this.road.getLaneCount() / 2)),
      canvasElement.height / 2,
      50,
      80,
      CarTypeEnum.PLAYER
    )
    this.traffic = [
      new Car(
        this.road.getLaneCenter(Math.floor(this.road.getLaneCount() / 2)),
        canvasElement.height / 2 - 300,
        50,
        80
      )
    ]

    this.fps = 0
  }

  startGame() {
    this.game()
  }

  drawFPS() {
    this.drawOverlayText(this.fps + " FPS", "yellow")
  }

  drawOverlayText(text: string, color: string) {
    const overlayCtx = this.overlayCanvas.getContext()

    overlayCtx.font = "bold 40px Arial"
    overlayCtx.strokeStyle = "#000"
    overlayCtx.lineWidth = 2
    overlayCtx.fillStyle = color
    overlayCtx.fillText(text, window.innerWidth - 200, 100)
    overlayCtx.strokeText(text, window.innerWidth - 200, 100)
  }

  drawGameOver() {
    this.drawOverlayText("WASTED", "red")
  }

  private game(prevTimeStamp = Date.now()) {
    const [gameCanvasElement, gameCtx] = [
      this.gameCanvas.getCanvas(),
      this.gameCanvas.getContext()
    ]

    this.car.update(this.road.getBorders(), this.traffic)
    for (const trafficCar of this.traffic) {
      trafficCar.update(this.road.getBorders())
    }

    this.gameCanvas.updateWindow()
    this.overlayCanvas.updateWindow()

    gameCtx.save()
    gameCtx.translate(0, -this.car.getY() + gameCanvasElement.height / 2)

    this.road.draw(gameCtx)

    this.car.draw(gameCtx)
    for (const trafficCar of this.traffic) {
      trafficCar.draw(gameCtx)
    }

    gameCtx.restore()

    if (this.car.isDamaged()) {
      this.drawGameOver()

      return
    }

    const run = requestAnimationFrame(this.game.bind(this, Date.now()))

    if (run % 60 === 0) {
      const fpsDelta = (Date.now() - prevTimeStamp) / 1000
      this.fps = Math.floor(1 / fpsDelta)
    }

    this.drawFPS()
  }
}
