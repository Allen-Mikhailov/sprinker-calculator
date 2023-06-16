const simScreen = document.getElementById("sim-screen")
const fpsCounter = document.getElementById("fps-counter")
const visibleMapSelector = document.getElementById("visible-map-selector")

let gridWidth = 75
let gridHeight = 60

let gridSize = 10
let lineWidth = 1

let mX = 0
let mY = 0
let mgX = 0
let mgY = 0

let map = "Grass"

function refreshScreen()
{
    const startTick = Date.now()
    const SCREEN_WIDTH = lineWidth*(gridWidth+1) + gridSize*gridWidth
    const SCREEN_HEIGHT = lineWidth*(gridHeight+1) + gridSize*gridHeight

    simScreen.width = SCREEN_WIDTH
    simScreen.height = SCREEN_HEIGHT+1

    simScreen.style.width = `${SCREEN_WIDTH}px`
    simScreen.style.height = `${SCREEN_HEIGHT+1}px`

    const ctx = simScreen.getContext("2d");

    // Lines
    for (let i = 0; i <= gridWidth; i++)
    {
        const d = i*(lineWidth+gridSize)

        ctx.fillRect(d, 0, lineWidth, SCREEN_HEIGHT)
        ctx.fillRect(0, d, SCREEN_WIDTH, lineWidth)
    }

    const c = Math.hypot(gridWidth, gridHeight)

    function applyToGrid(funct)
    {
        for (let x = 0; x < gridWidth; x++)
        {  
            let ax = lineWidth + x*gridSize + (x)*lineWidth
            for (let y = 0; y < gridHeight; y++)
            {
                let ay = lineWidth + y*gridSize + (y)*lineWidth

                funct(x, y, ax, ay)
            }
        }
    }

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
    // console.log(mgX, mgY)
    applyToGrid((x, y, ax, ay) => {
        const disAlpha = Math.hypot(x, y)/c
        let color = `rgb(${(1-disAlpha)*255}, ${255}, ${(1-disAlpha)*255})`
        if (x == mgX && y == mgY)
        {
            color = "black"
        }

        ctx.fillStyle = color
        ctx.fillRect(ax, ay, gridSize, gridSize)
    })
    fpsCounter.innerHTML = Date.now()-startTick


    requestAnimationFrame(refreshScreen)
}

// visibleMapSelector.onchange = refreshScreen

refreshScreen()

function clamp(value, min, max)
{
    return Math.max(Math.min(value, max), min)
}

document.body.onmousemove = (e) => {
    // console.log("Move")
    let rect = simScreen.getBoundingClientRect()

    mX = (e.clientX-rect.left)/rect.width
    mY = (e.clientY-rect.top)/rect.height

    let gx = clamp(Math.floor(mX*(gridWidth)), 0, gridWidth-1)
    let gy = clamp(Math.floor(mY*(gridHeight)), 0, gridHeight-1)

    if (mgX != gx || mgY != gy)
    {
        mgX = gx; mgY = gy;
        // console.log(mgX, mgY)
        // refreshScreen()
    } else {
        if (map == "Sprinkler") {
            // refreshScreen()
        }
    }

    // if 
}