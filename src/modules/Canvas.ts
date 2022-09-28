export class Canvas {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly percent?: number

  constructor(selector: string, width: number | string = 400) {
    this.canvas = document.querySelector(selector)!
    this.ctx = this.canvas.getContext("2d")!

    if (typeof width === "string") {
      let newWidth = 0

      if (/^\d{1,3}%$/.test(width)) {
        const percent = parseInt(width.replace("%", ""))

        if (percent <= 100 && percent > 0) {
          newWidth = ((window.innerWidth - 1) * percent) / 100
          this.percent = percent
        }
      }

      width = newWidth || 400
    }

    this.canvas.width = width
  }

  updateWindow() {
    this.canvas.height = window.innerHeight - 1

    if (this.percent) {
      this.canvas.width = ((window.innerWidth - 1) * this.percent) / 100
    }
  }

  getContext() {
    return this.ctx
  }

  getCanvas() {
    return this.canvas
  }
}
