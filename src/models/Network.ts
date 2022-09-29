export class Level {
  private readonly inputs: number[]
  private readonly outputs: number[]
  private readonly biases: number[]
  private readonly weights: number[][]

  constructor(inputCount: number, outputCount: number) {
    this.inputs = new Array(inputCount)
    this.outputs = new Array(outputCount)
    this.biases = new Array(outputCount)
    this.weights = []

    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount)
    }

    Level.randomize(this)
  }

  getInputs() {
    return this.inputs
  }

  getOutputs() {
    return this.outputs
  }

  getWeights() {
    return this.weights
  }

  getBiases() {
    return this.biases
  }

  private static randomize(level: Level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1
      }
    }

    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1
    }
  }

  static feedForward(givenInputs: number[], level: Level) {
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i]
    }

    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0

      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i]
      }

      level.outputs[i] = sum > level.biases[i] ? 1 : 0
    }

    return level.outputs
  }
}

export class NeuralNetwork {
  private readonly levels: Level[]

  constructor(neuronCounts: number[]) {
    this.levels = []

    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]))
    }
  }

  getLevels() {
    return this.levels
  }

  static feedForward(givenInputs: number[], network: NeuralNetwork) {
    let outputs: number[] = []

    for (let i = 0; i < network.levels.length; i++) {
      outputs = Level.feedForward(i ? outputs : givenInputs, network.levels[i])
    }

    return outputs
  }
}
