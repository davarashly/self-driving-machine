import { Canvas, drawNetwork, inRange } from "@/modules"
import { Car, NeuralNetwork, Road } from "@/models"
import { CarTypeEnum } from "@/common/enums"
import { Traffic } from "@/common/types"
import { IPoint, LevelData } from "@/common/interfaces"
import { load, remove, save } from "@/modules/Store"

export class Game {
  private gameCanvas: Canvas
  private networkCanvas: Canvas
  private overlayCanvas: Canvas
  private road: Road
  private readonly cars: Car[]
  private readonly initialTraffic: Traffic
  private readonly traffic: Traffic
  private startTimeStamp = 0
  private prevTimeStamp = 0
  private fps: number

  constructor() {
    this.gameCanvas = new Canvas("#game-canvas")
    this.networkCanvas = new Canvas("#network-canvas", "66%")
    this.overlayCanvas = new Canvas("#overlay-canvas", "100%")

    if (load<boolean>("auto-save")) {
      document.querySelector("input")!.checked = load<boolean>("auto-save")
    }

    Array.from(document.querySelectorAll("button")).forEach((btn, idx) => {
      switch (idx) {
        case 0:
          btn.onclick = () => {
            console.log(this.initialTraffic)
            save(this.initialTraffic, "traffic")

            console.log("Traffic Saved")
          }
          break
        case 1:
          btn.onclick = () => {
            this.save()
            console.log("Saved")
          }
          break
        case 2:
          btn.onclick = () => {
            remove("bestBrain")
            console.log("Deleted")
          }
          break
      }
    })

    const canvasElement = this.gameCanvas.getCanvas()

    this.road = new Road(canvasElement.width / 2, canvasElement.width * 0.95, 7)
    this.cars = this.generateCars(1000)

    // @ts-ignore
    window.cars = this.cars

    if (load("bestBrain")) {
      for (let i = 0; i < this.cars.length; i++) {
        this.cars[i].setBrain(load<LevelData[]>("bestBrain"))

        if (i) {
          NeuralNetwork.mutate(this.cars[i].getBrain()!, 0.1)
        }
      }
    }

    this.traffic = load("traffic")
      ? this.generateTraffic(load("traffic"))
      : this.generateTraffic(35)

    this.initialTraffic = JSON.parse(JSON.stringify(this.traffic))

    // this.traffic = [
    //   new Car(
    //     this.road.getLaneCenter(0),
    //     canvasElement.height / 2 - 300,
    //     this.road.laneWidth * 0.45,
    //     this.road.laneWidth * 0.7
    //   ),
    //   new Car(
    //     this.road.getLaneCenter(2),
    //     canvasElement.height / 2 - 300,
    //     this.road.laneWidth * 0.45,
    //     this.road.laneWidth * 0.7
    //   ),
    //   new Car(
    //     this.road.getLaneCenter(1),
    //     canvasElement.height / 2 - 500,
    //     this.road.laneWidth * 0.45,
    //     this.road.laneWidth * 0.7
    //   ),
    //
    //   new Car(
    //     this.road.getLaneCenter(3),
    //     canvasElement.height / 2 - 500,
    //     this.road.laneWidth * 0.45,
    //     this.road.laneWidth * 0.7
    //   ),
    //   new Car(
    //     this.road.getLaneCenter(1),
    //     canvasElement.height / 2 - 900,
    //     this.road.laneWidth * 0.45,
    //     this.road.laneWidth * 0.7
    //   ),
    //   new Car(
    //     this.road.getLaneCenter(2),
    //     canvasElement.height / 2 - 700,
    //     this.road.laneWidth * 0.45,
    //     this.road.laneWidth * 0.7
    //   )
    // ]

    this.fps = 0
  }

  save(bestCar?: Car) {
    bestCar = bestCar || this.getBestCar()

    save(bestCar.getBrain()?.getLevels(), "bestBrain")
    save({ x: bestCar.getX(), y: bestCar.getY() }, "bestCar")
  }

  generateTraffic(traffic: IPoint[]): Traffic
  generateTraffic(carAmount: number): Traffic
  generateTraffic(arg: number | IPoint[]): Traffic {
    const traffic: Traffic = []

    if (typeof arg === "number") {
      for (let i = 0; i < arg; i++) {
        let lastCarInTraffic

        if (i) {
          lastCarInTraffic = traffic.at(-1)
        }

        const lane = inRange(0, this.road.getLaneCount() - 1, true)

        traffic.push(
          new Car(
            this.road.getLaneCenter(lane),
            lastCarInTraffic
              ? lastCarInTraffic.getY() -
                this.road.laneWidth * 0.7 * inRange(1.5, 2)
              : this.gameCanvas.getCanvas().height / 2 -
                this.road.laneWidth * 0.7 * inRange(1.5, 2) -
                100,
            this.road.laneWidth * 0.45,
            this.road.laneWidth * 0.7
          )
        )
      }
    } else {
      for (const trafficCar of arg) {
        traffic.push(
          new Car(
            trafficCar.x,
            trafficCar.y,
            this.road.laneWidth * 0.45,
            this.road.laneWidth * 0.7
          )
        )
      }
    }

    return traffic
  }

  startGame() {
    this.game()
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

  private game(prevTimeStamp?: number) {
    // console.log(this.cars.length, Car.damagedCarsAmount)

    this.startTimeStamp = this.startTimeStamp || prevTimeStamp || 0

    const bestCar: Car = this.getBestCar()

    if (
      document.querySelector("input")!.checked &&
      this.cars.length - Car.damagedCarsAmount <= 1
    ) {
      this.save(bestCar)
      save(true, "auto-save")
      console.log("Auto-save")
    }

    if (this.cars.every((car) => car.isDamaged())) {
      setTimeout(() => window.location.reload(), 300)

      return
    }

    const [gameCanvasElement, gameCtx] = [
      this.gameCanvas.getCanvas(),
      this.gameCanvas.getContext()
    ]

    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i]

      car.update(this.road.getBorders(), this.traffic, bestCar, this.cars)
    }

    if (!document.querySelector("input")!.checked) {
      save(false, "auto-save")
    }

    for (const trafficCar of this.traffic) {
      trafficCar.update(this.road.getBorders())
    }

    this.gameCanvas.updateWindow()
    this.networkCanvas.updateWindow()
    this.overlayCanvas.updateWindow()

    gameCtx.save()
    gameCtx.translate(0, -bestCar.getY() + gameCanvasElement.height / 2)

    this.road.draw(gameCtx)

    this.gameCanvas.getContext().globalAlpha = 0.2
    for (const car of this.cars) {
      car.draw(gameCtx, false)
    }
    this.gameCanvas.getContext().globalAlpha = 1
    bestCar.draw(gameCtx)

    for (const trafficCar of this.traffic) {
      trafficCar.draw(gameCtx)
    }

    gameCtx.restore()

    if (!bestCar.isBot) {
      const networkCtx = this.networkCanvas.getContext()
      networkCtx.lineDashOffset = -(prevTimeStamp || 0) / 50

      drawNetwork(networkCtx, bestCar.getBrain()!)
    }

    // if (bestCar.isDamaged()) {
    //   this.drawGameOver()
    //
    //   return
    // }

    const run = requestAnimationFrame(this.game.bind(this))

    if (prevTimeStamp && run % 60 === 0) {
      const fpsDelta = (prevTimeStamp - this.prevTimeStamp) / 1000
      this.fps = Math.floor(1 / fpsDelta)
    }
    this.prevTimeStamp = (prevTimeStamp as number) || 0

    this.drawFPS()
  }

  generateCars(carAmount: number) {
    const cars: Car[] = []

    for (let i = 0; i < carAmount; i++) {
      cars.push(
        new Car(
          this.road.getLaneCenter(Math.floor(this.road.getLaneCount() / 2)),
          100,
          this.road.laneWidth * 0.45,
          this.road.laneWidth * 0.7,
          CarTypeEnum.AI_PLAYER
        )
      )
    }

    return cars
  }

  getBestCar() {
    let minY = Infinity
    let carIdx = -1

    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i]

      if (car.getY() < minY) {
        minY = car.getY()
        carIdx = i
      }
    }

    return this.cars[carIdx]
  }
}
