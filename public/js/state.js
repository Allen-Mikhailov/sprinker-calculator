let gridWidth = 75
let gridHeight = 45

let gridSize = 10
let decorSize = 4
let lineWidth = 1

// Topography
let blurTicks = 1
let blurStrength = .4
let heightWeight = 2

// Debug Settings
// gridWidth = 10
// gridHeight = 10
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
let topographyBuffer

let walls

let simulationDisplayBuffer
let materialDisplayBuffer
let topographyDisplayBuffer
let decorBuffer

let sprinklers = []

let ghostSprinkler

let simToggleSprinklers = true

function _time(funct)
{
    const start = Date.now()
    funct()
    console.log(Date.now()-start)
}