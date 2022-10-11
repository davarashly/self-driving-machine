import { LevelData } from "@/common/interfaces"
import { linearInterpolation } from "@/modules"

export class Level {
  readonly inputs: LevelData["inputs"]
  readonly outputs: LevelData["outputs"]
  readonly biases: LevelData["biases"]
  readonly weights: LevelData["weights"]

  constructor(
    inputCount: number,
    outputCount: number,
    levelData: LevelData | Record<string, never> = {}
  ) {
    const toGenerate = !Object.keys(levelData).length

    this.inputs = toGenerate ? new Array(inputCount) : levelData.inputs
    this.outputs = toGenerate ? new Array(outputCount) : levelData.outputs
    this.biases = toGenerate ? new Array(outputCount) : levelData.biases
    this.weights = toGenerate ? [] : levelData.weights

    if (toGenerate) {
      for (let i = 0; i < inputCount; i++) {
        this.weights[i] = new Array(outputCount)
      }

      Level.randomize(this)
    }
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
  private levels: Level[]

  constructor(neuronCounts: number[]) {
    this.levels = []

    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]))
    }
  }

  static mutate(network: NeuralNetwork, amount = 1) {
    network.levels.forEach((level) => {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = linearInterpolation(
          level.biases[i],
          Math.random() * 2 - 1,
          amount
        )
      }

      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = linearInterpolation(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          )
        }
      }
    })
  }

  getLevels() {
    return this.levels
  }

  setLevels(levels: LevelData[]) {
    this.levels = []

    for (const level of levels) {
      this.levels.push(new Level(0, 0, level))
    }
  }

  static feedForward(givenInputs: number[], network: NeuralNetwork) {
    let outputs: number[] = []

    for (let i = 0; i < network.levels.length; i++) {
      outputs = Level.feedForward(i ? outputs : givenInputs, network.levels[i])
    }

    return outputs
  }
}
