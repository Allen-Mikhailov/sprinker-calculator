const screen = document.getElementById("screen")

let gridWidth = 500
let gridHeight = 200

let gridSize = 3
let lineWidth = 1

function refreshScreen()
{
    const SCREEN_WIDTH = lineWidth*(gridWidth+1) + gridSize*gridWidth
    const SCREEN_HEIGHT = lineWidth*(gridHeight+1) + gridSize*gridHeight

    screen.width = SCREEN_WIDTH
    screen.height = SCREEN_HEIGHT
}