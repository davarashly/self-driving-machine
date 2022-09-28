import { CarTypeEnum } from "@/common/enums"

export class Controls {
  private forward: boolean
  private reverse: boolean
  private left: boolean
  private right: boolean

  constructor(carType: CarTypeEnum) {
    this.forward = false
    this.reverse = false
    this.left = false
    this.right = false

    switch (carType) {
      case CarTypeEnum.BOT:
        this.forward = true
        break
      case CarTypeEnum.PLAYER:
        this.addKeyListeners()
        break
      case CarTypeEnum.AI_PLAYER:
        break
    }
  }

  addKeyListeners() {
    const handler = (evt: KeyboardEvent) => {
      const value = evt.type === "keydown"

      switch (evt.key) {
        case "ArrowUp":
          this.forward = value
          break
        case "ArrowDown":
          this.reverse = value
          break
        case "ArrowLeft":
          this.left = value
          break
        case "ArrowRight":
          this.right = value
          break
      }
    }

    document.addEventListener("keydown", handler, false)
    document.addEventListener("keyup", handler, false)
  }

  getDirections() {
    return {
      forward: this.forward || undefined,
      reverse: this.reverse || undefined,
      left: this.left || undefined,
      right: this.right || undefined
    }
  }
}
