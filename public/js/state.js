let gridWidth = 75
let gridHeight = 45

let gridSize = 10
let decorSize = 4
let lineWidth = 1

// Debug Settings
// gridWidth = 10
// gridHeight = 1
// gridSize = 50
// decorSize = 24

let gridConversion

let colorBufferSize

let SCREEN_WIDTH
let SCREEN_HEIGHT

let mX = 0
let mY = 0
let mgX = 0
let mgY = 0
let mWithinBounds = false

let map = "simulation"

let brushSize = 1

let simulationBuffer
let materialBuffer

let walls

let simulationDisplayBuffer
let materialDisplayBuffer
let sprinklerDisplayBuffer
let decorBuffer

let decorationBuffer

let sprinklers = []

let ghostSprinkler

let simToggleSprinklers = true

function _time(funct)
{
    const start = Date.now()
    funct()
    console.log(Date.now()-start)
}