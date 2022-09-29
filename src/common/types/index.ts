import { IPoint } from "@/common/interfaces"
import { Car } from "@/models"

export type PointList = [IPoint, IPoint][]

export type Intersection = (IPoint & { offset: number }) | null
export type Polygon = IPoint[]
export type RoadBorders = PointList

export type Traffic = Car[]

export type Direction = "forward" | "reverse" | "left" | "right"
