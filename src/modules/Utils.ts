import { IPoint } from "@/common/interfaces"
import { Intersection, Polygon } from "@/common/types"

export const linearInterpolation = (A: number, B: number, t: number) =>
  A + (B - A) * t

export const getIntersection = (
  A: IPoint,
  B: IPoint,
  C: IPoint,
  D: IPoint
): Intersection => {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x)
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y)
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y)

  if (bottom) {
    const t = tTop / bottom
    const u = uTop / bottom

    if (inRange(0, 1, t) && inRange(0, 1, u)) {
      return {
        x: linearInterpolation(A.x, B.x, t),
        y: linearInterpolation(A.y, B.y, t),
        offset: t
      }
    }
  }

  return null
}

export const polygonsIntersection = (polygonA: Polygon, polygonB: Polygon) => {
  for (let i = 0; i < polygonA.length; i++) {
    for (let j = 0; j < polygonB.length; j++) {
      const touch = getIntersection(
        polygonA[i],
        polygonA[(i + 1) % polygonA.length],
        polygonB[j],
        polygonB[(j + 1) % polygonB.length]
      )

      if (touch) {
        return true
      }
    }
  }

  return false
}

export const inRange = (
  a: number,
  b: number,
  number: number,
  includingA = true,
  includingB = true
): boolean => {
  const left = includingA ? a <= number : a < number
  const right = includingB ? b >= number : b > number

  return left && right
}
