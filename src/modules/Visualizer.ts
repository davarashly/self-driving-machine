import { Level, NeuralNetwork } from "@/models"
import { getRGBA, linearInterpolation } from "@/modules/Utils"

export const drawNetwork = (
  ctx: CanvasRenderingContext2D,
  network: NeuralNetwork
) => {
  const margin = 100
  const left = margin
  const top = margin
  const width = ctx.canvas.width - margin * 2
  const height = ctx.canvas.height - margin * 2

  const networkLevels = network.getLevels()

  const levelHeight = height / networkLevels.length

  for (let i = networkLevels.length - 1; i >= 0; i--) {
    const levelTop =
      top +
      linearInterpolation(
        height - levelHeight,
        0,
        networkLevels.length === 1 ? 0.5 : i / (networkLevels.length - 1)
      )

    ctx.setLineDash([9, 4])

    drawLevel(
      ctx,
      networkLevels[i],
      left,
      levelTop,
      width,
      levelHeight,
      i === networkLevels.length - 1 ? ["🠉", "🠋", "🠈", "🠊"] : []
    )
  }
}

const drawLevel = (
  ctx: CanvasRenderingContext2D,
  level: Level,
  left: number,
  top: number,
  width: number,
  height: number,
  labels: string[]
) => {
  const right = left + width
  const bottom = top + height

  const nodeRadius = 30

  for (let i = 0; i < level.inputs.length; i++) {
    for (let j = 0; j < level.outputs.length; j++) {
      ctx.beginPath()
      ctx.moveTo(getNodeX(level.inputs, i, left, right), bottom)
      ctx.lineTo(getNodeX(level.outputs, j, left, right), top)
      ctx.lineWidth = 2

      ctx.strokeStyle = getRGBA(level.weights[i][j])
      ctx.stroke()
    }
  }

  for (let i = 0; i < level.inputs.length; i++) {
    const x = getNodeX(level.inputs, i, left, right)

    ctx.beginPath()
    ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2)
    ctx.fillStyle = "black"
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2)
    ctx.fillStyle = getRGBA(level.inputs[i])
    ctx.fill()
  }

  for (let i = 0; i < level.outputs.length; i++) {
    const x = getNodeX(level.outputs, i, left, right)

    ctx.beginPath()
    ctx.arc(x, top, nodeRadius, 0, Math.PI * 2)
    ctx.fillStyle = "black"
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2)
    ctx.fillStyle = getRGBA(level.outputs[i])
    ctx.fill()

    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2)
    ctx.strokeStyle = getRGBA(level.biases[i])
    ctx.setLineDash([6, 6])
    ctx.stroke()
    ctx.setLineDash([])

    if (labels[i]) {
      ctx.beginPath()
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "black"
      ctx.strokeStyle = "white"
      ctx.font = nodeRadius * 1.2 + "px Arial bold"
      ctx.fillText(labels[i], x, top + nodeRadius * 0.1)
      ctx.lineWidth = 1
      ctx.strokeText(labels[i], x, top + nodeRadius * 0.1)
      ctx.stroke()
    }
  }
}

const getNodeX = (nodes: any[], idx: number, left: number, right: number) =>
  linearInterpolation(
    left,
    right,
    nodes.length === 1 ? 0.5 : idx / (nodes.length - 1)
  )
