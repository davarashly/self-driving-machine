import { linearInterpolation } from "@/modules"
import { IPoint } from "@/common/interfaces"
import { PointList } from "@/common/types"

export class Road {
  private readonly x: number
  private readonly width: number
  private readonly laneCount: number

  private readonly top: number
  private readonly bottom: number
  private readonly left: number
  private readonly right: number

  private readonly borders: PointList

  constructor(x: number, width: number, laneCount = 3) {
    this.x = x
    this.width = width
    this.laneCount = laneCount

    const infinity = Math.pow(2, 21)

    this.top = -infinity
    this.bottom = infinity
    this.left = this.x - this.width / 2
    this.right = this.x + this.width / 2

    const topLeft: IPoint = { x: this.left, y: this.top }
    const topRight: IPoint = { x: this.right, y: this.top }
    const bottomLeft: IPoint = { x: this.left, y: this.bottom }
    const bottomRight: IPoint = { x: this.right, y: this.bottom }

    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight]
    ]
  }

  getLaneCenter(laneIdx: number) {
    const laneWidth = this.width / this.laneCount

    laneIdx = Math.max(0, Math.min(laneIdx, this.laneCount - 1))

    return this.left + laneWidth * (0.5 + laneIdx)
  }

  getBorders() {
    return this.borders
  }

  getLaneCount() {
    return this.laneCount
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 5
    ctx.strokeStyle = "#fff"

    for (let i = 1; i <= this.laneCount - 1; i++) {
      const x = linearInterpolation(this.left, this.right, i / this.laneCount)

      ctx.setLineDash([20, 20])

      ctx.beginPath()
      ctx.moveTo(x, this.top)
      ctx.lineTo(x, this.bottom)
      ctx.stroke()
    }

    ctx.setLineDash([])

    for (const border of this.borders) {
      ctx.beginPath()
      ctx.moveTo(border[0].x, border[0].y)
      ctx.lineTo(border[1].x, border[1].y)
      ctx.stroke()
    }
  }
}
