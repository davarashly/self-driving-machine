import { Controls, NeuralNetwork, Sensor } from "@/models"
import { Direction, Polygon, RoadBorders, Traffic } from "@/common/types"
import { IPoint } from "@/common/interfaces"
import { inRange, linearInterpolation, polygonsIntersection } from "@/modules"
import { CarTypeEnum } from "@/common/enums"

export class Car {
  private x: number
  private y: number
  private readonly width: number
  private readonly height: number
  private readonly color: string
  private readonly type: CarTypeEnum
  private damaged: boolean

  private angle: number
  private speed: number
  private readonly acceleration: number
  private readonly rotationModifier = 0.0125
  private readonly friction = 0.05
  private readonly maxSpeed: number
  private readonly maxReverseSpeed: number

  private readonly controls: Controls
  private readonly sensor?: Sensor
  private readonly brain?: NeuralNetwork

  private polygon: Polygon

  get isAI() {
    return this.type === CarTypeEnum.AI_PLAYER
  }

  get isBot() {
    return this.type === CarTypeEnum.BOT
  }

  getSize() {
    return { height: this.height, width: this.width }
  }

  getBrain() {
    return this.brain
  }

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    type: CarTypeEnum = CarTypeEnum.BOT
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    if (type === CarTypeEnum.BOT) {
      this.color = "orange"
    } else {
      this.color = type === CarTypeEnum.AI_PLAYER ? "green" : "blue"
    }

    this.type = type
    this.damaged = false

    this.acceleration = this.type === "bot" ? 0.1 : 1
    this.maxSpeed = this.type === "bot" ? inRange(0.7, 1.3) : 2.3
    this.maxReverseSpeed = this.maxSpeed * 0.68

    this.angle = 0
    this.speed = 0

    this.controls = new Controls(type)

    if (this.type !== "bot") {
      this.sensor = new Sensor(this)
      this.brain = new NeuralNetwork([
        this.sensor.getRayCount(),
        this.sensor.getRayCount() + 2,
        4
      ])
    }

    this.polygon = []
  }

  isDamaged() {
    return this.damaged
  }

  getX() {
    return this.x
  }

  getY() {
    return this.y
  }

  getAngle() {
    return this.angle
  }

  getPolygon() {
    return this.polygon
  }

  update(roadBorders: RoadBorders, traffic?: Traffic) {
    this.moveCar()
    this.polygon = this.createPolygon()
    this.damaged = this.assessDamage(roadBorders, traffic)

    if (this.sensor && this.brain) {
      this.sensor.update(roadBorders, traffic!)

      const offsets = this.sensor
        .getReadings()
        .map((t) => (!!t ? 1 - t.offset : 0))

      const outputs = NeuralNetwork.feedForward(offsets, this.brain)

      if (this.isAI) {
        const directions: Direction[] = ["forward", "reverse", "left", "right"]

        for (let i = 0; i < outputs.length; i++) {
          this.controls.setDirection(directions[i], !!outputs[i])
        }

        console.log(this.controls)
      }
    }
  }

  private assessDamage(roadBorders: RoadBorders, traffic: Traffic = []) {
    for (let i = 0; i < Math.max(roadBorders.length, traffic.length); i++) {
      if (
        (roadBorders[i] &&
          polygonsIntersection(this.polygon, roadBorders[i])) ||
        (traffic[i] && polygonsIntersection(this.polygon, traffic[i].polygon))
      ) {
        return true
      }
    }

    return false
  }

  private createPolygon() {
    const points: IPoint[] = []
    const radius = Math.hypot(this.width, this.height) / 2
    const angle = Math.atan2(this.width, this.height)

    points.push({
      x: this.x - Math.sin(this.angle - angle) * radius,
      y: this.y - Math.cos(this.angle - angle) * radius
    })
    points.push({
      x: this.x - Math.sin(this.angle + angle) * radius,
      y: this.y - Math.cos(this.angle + angle) * radius
    })
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - angle) * radius,
      y: this.y - Math.cos(Math.PI + this.angle - angle) * radius
    })
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + angle) * radius,
      y: this.y - Math.cos(Math.PI + this.angle + angle) * radius
    })

    return points
  }

  private moveCar() {
    const { forward, reverse, left, right } = this.controls.getDirections()

    // Direction of the car
    if (forward) {
      this.speed += this.acceleration
    }
    if (reverse) {
      this.speed -= this.acceleration
    }

    // Left and right directions check
    if (this.speed) {
      const isMovingForwards = this.speed > 0

      const angle = linearInterpolation(
        0,
        this.rotationModifier,
        this.speed / (isMovingForwards ? this.maxSpeed : this.maxReverseSpeed)
      )

      if (left) {
        this.angle += angle
      }
      if (right) {
        this.angle -= angle
      }
    }

    // Capping max allowed speed
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed
    }
    if (this.speed < -this.maxReverseSpeed) {
      this.speed = -this.maxReverseSpeed
    }

    // Friction of the car
    if (this.speed > 0) {
      this.speed -= this.friction
    }
    if (this.speed < 0) {
      this.speed += this.friction
    }

    // We stop the car if the speed is lower than the friction,
    // to prevent the bouncing of the speed on two directions
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0
    }

    this.x -= Math.sin(this.angle) * this.speed
    this.y -= Math.cos(this.angle) * this.speed
  }

  log() {
    console.log({
      x: this.x,
      y: this.y,
      speed: this.speed,
      acceleration: this.acceleration,
      type: this.type
    })
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.damaged ? "#a00" : "#000"
    ctx.fillStyle = this.damaged ? "#f00" : this.color

    ctx.beginPath()
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y)

    for (const point of this.polygon) {
      ctx.lineTo(point.x, point.y)
    }

    ctx.closePath()
    ctx.stroke()

    ctx.fill()

    if (this.sensor) {
      this.sensor.draw(ctx)
    }
  }
}
