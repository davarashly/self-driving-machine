import { Car } from "@/models/Car"
import { getIntersection, linearInterpolation } from "@/modules"
import { IPoint } from "@/common/interfaces"
import { Intersection, PointList, RoadBorders, Traffic } from "@/common/types"

export class Sensor {
  private readonly car: Car
  private readonly rayCount = 7
  private readonly rayLength: number
  private readonly raySpread = Math.PI / 1.5
  private readonly rays: PointList
  private readonly readings: Intersection[]

  constructor(car: Car) {
    this.car = car

    this.rayLength = this.car.getSize().height * 3

    this.rays = []
    this.readings = []
  }

  update(roadBorders: RoadBorders, traffic: Traffic) {
    this.castRays()
    this.readings.splice(0, this.readings.length)

    for (let i = 0; i < this.rayCount; i++) {
      this.readings.push(this.getReading(this.rays[i], roadBorders, traffic))
    }
  }

  getRayCount() {
    return this.rayCount
  }

  getReadings() {
    return this.readings
  }

  private getReading(
    ray: PointList[number],
    roadBorders: RoadBorders,
    traffic: Traffic
  ) {
    const touches: Intersection[] = []

    for (const roadBorder of roadBorders) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorder[0],
        roadBorder[1]
      )

      if (touch) {
        touches.push(touch)
      }
    }

    for (const trafficCar of traffic) {
      const trafficCarPolygon = trafficCar.getPolygon()

      for (let i = 0; i < trafficCarPolygon.length; i++) {
        const value = getIntersection(
          ray[0],
          ray[1],
          trafficCarPolygon[i],
          trafficCarPolygon[(i + 1) % trafficCarPolygon.length]
        )
        if (value) {
          touches.push(value)
        }
      }
    }

    if (touches.length) {
      const offsets = touches.map((t) => t!.offset)
      const minOffset = Math.min(...offsets)

      return touches.find((t) => t!.offset === minOffset)!
    }

    return null
  }

  private castRays() {
    this.rays.splice(0, this.rayLength)

    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        linearInterpolation(
          this.raySpread / 2,
          -this.raySpread / 2,
          // @ts-ignore, because we still need this check in case we change the rayCount
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.getAngle()

      const start: IPoint = { x: this.car.getX(), y: this.car.getY() }
      const end: IPoint = {
        x: this.car.getX() - Math.sin(rayAngle) * this.rayLength,
        y: this.car.getY() - Math.cos(rayAngle) * this.rayLength
      }

      this.rays.push([start, end])
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.rayCount; i++) {
      const end = this.readings[i] || this.rays[i][1]

      ctx.beginPath()
      ctx.lineWidth = 3
      ctx.strokeStyle = "yellow"
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      if (this.readings[i]) {
        ctx.fillStyle = "black"
        ctx.beginPath()
        ctx.arc(end.x, end.y, 5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fill()
      }

      ctx.beginPath()
      ctx.lineWidth = 3
      ctx.strokeStyle = "black"
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }
  }
}
