const simScreen = document.getElementById("sim-screen")
const ctx = simScreen.getContext("2d");

const fpsCounter = document.getElementById("fps-counter")
const visibleMapSelector = document.getElementById("visible-map-selector")

// Material Stuff
const materialMap = document.getElementById("material-map")
const materialToolSize = document.getElementById("material-tool-size")

let gridWidth = 75
let gridHeight = 45

let gridSize = 10
let decorSize = 4
let lineWidth = 1

// Debug Settings
gridWidth = 10
gridHeight = 10
gridSize = 50
decorSize = 24

let colorBufferSize

let mX = 0
let mY = 0
let mgX = 0
let mgY = 0

let map = "simulation"

let brushSize = 1

let needGridUpdate
let needDecorUpdate

let materialBuffer

let simulationDisplayBuffer
let materialDisplayBuffer
let sprinklerDisplayBuffer

let decorationBuffer

function getPixelPoint(x, y)
{
    return (y*gridWidth+x)*3
}

function updateSize()
{
    colorBufferSize = gridWidth * gridHeight * 3
    simulationDisplayBuffer = new Uint8Array(colorBufferSize)
    materialDisplayBuffer = new Uint8Array(colorBufferSize)

    materialBuffer = new Uint8Array(gridWidth * gridHeight)

    // Draw Test
    const c = Math.hypot(gridWidth, gridHeight)
    let i = 0
    for (let y = 0; y < gridHeight; y++)
    {  
        for (let x = 0; x < gridWidth; x++)
        {
            const disAlpha = Math.hypot(x, y)/c
            simulationDisplayBuffer[i++] = (1-disAlpha)*255
            simulationDisplayBuffer[i++] = 255
            simulationDisplayBuffer[i++] = (1-disAlpha)*255
        }
    }
}

updateSize()

function drawGrid(buffer)
{
    let i = 0;
    for (let y = 0; y < gridHeight; y++)
        {  
            const ay = lineWidth + y*gridSize + (y)*lineWidth
            for (let x = 0; x < gridWidth; x++)
            {
                const ax = lineWidth + x*gridSize + (x)*lineWidth

                // Main Grid
                ctx.fillStyle = `rgb(${buffer[i+0]},${buffer[i+1]},${buffer[i+2]})`
                ctx.fillRect(ax, ay, gridSize, gridSize)
                i += 3
            }
        }
}

function drawDecor(buffer)
{
    let i = 0;
    for (let y = 0; y < gridHeight; y++)
    {  
        const ay = lineWidth + y*gridSize + (y)*lineWidth
        const ady = ay+(gridSize-decorSize)/2
        for (let x = 0; x < gridWidth; x++)
        {
            const ax = lineWidth + x*gridSize + (x)*lineWidth
            const adx = ax+(gridSize-decorSize)/2

            // Decor Grid
            ctx.fillStyle = `rgba(${buffer[i+0]},${buffer[i+1]},${buffer[i+2]}, ${buffer[i+3]})`
            ctx.fillRect(adx, ady, decorSize, decorSize)
            i += 4
        }
    }
}

function applyBrush(buffer, x, y, size, bs)
{
    for (let ax = Math.max(x-bs.size+1, 0); ax < x+bs.size && ax < size[0]; ax++)
    {
        for (let ay = Math.max(y-bs.size+1, 0); ay < y+bs.size  && ay < size[1]; ay++)
        {
            let pxPoint = (size[0]*ay + ax)*bs.spacing
            for (let i = 0; i < bs.data.length; i++)
            {
                buffer[pxPoint++] = bs.data[i]
            }
        }
    }
}

const materialColors = [
    [0, 255, 0],     // 0: grass
    [120, 120, 120], // 1: concrete
    [30, 30, 30],    // 2: Wall
]
function updateMaterialBuffer()
{
    let i = 0;
    let j = 0;
    for (let y = 0; y < gridHeight; y++)
    {
        for (let x = 0; x < gridWidth; x++)
        {
            const mat = materialBuffer[i++];

            materialDisplayBuffer[j++] = materialColors[mat][0]
            materialDisplayBuffer[j++] = materialColors[mat][1]
            materialDisplayBuffer[j++] = materialColors[mat][2]
        }
    }
}

updateMaterialBuffer()

function refreshScreen()
{
    const startTick = Date.now()
    const SCREEN_WIDTH = lineWidth*(gridWidth+1) + gridSize*gridWidth
    const SCREEN_HEIGHT = lineWidth*(gridHeight+1) + gridSize*gridHeight

    simScreen.width = SCREEN_WIDTH
    simScreen.height = SCREEN_HEIGHT+1

    simScreen.style.width = `${SCREEN_WIDTH}px`
    simScreen.style.height = `${SCREEN_HEIGHT+1}px`

    let buffer
    let decBuffer = new Uint8Array(gridHeight*gridWidth*4)

    // temp: 
    needGridUpdate = true
    needDecorUpdate = true

    switch(map)
    {
        case "simulation":
            buffer = simulationDisplayBuffer
            let mousePoint = (mgX + mgY*gridWidth)*4
            // decBuffer[mousePoint+3] = 255
            // decBuffer[mousePoint+2] = 0
            // decBuffer[mousePoint+1] = 0
            // decBuffer[mousePoint+0] = 0
            break;
        case "material":
            buffer = materialDisplayBuffer
            applyBrush(decBuffer, mgX, mgY, [gridWidth, gridHeight], {
                "size": brushSize,
                "spacing": 4,
                "data": [0, 0, 0, 255]
            })
            break;

        default:
            buffer = simulationDisplayBuffer
    }

    // Lines
    ctx.fillStyle = "black"
    for (let i = 0; i <= gridWidth; i++)
    {
        const d = i*(lineWidth+gridSize)
        ctx.fillRect(d, 0, lineWidth, SCREEN_HEIGHT)
        ctx.fillRect(0, d, SCREEN_WIDTH, lineWidth)
    }

    if (needGridUpdate)
        drawGrid(buffer)

    if (needGridUpdate || needDecorUpdate)
        drawDecor(decBuffer)

    needGridUpdate = false
    needDecorUpdate = false

    let i = 0;
    let j = 0;

    fpsCounter.innerHTML = Date.now()-startTick

    requestAnimationFrame(refreshScreen)
}

function mapUpdate()
{
    materialMap.style.visibility = map == "material" ? "visible":"hidden"
}

mapUpdate()

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
    }
}
materialToolSize.onchange = () => {brushSize = parseInt(materialToolSize.value)}
visibleMapSelector.onchange = () => {map = visibleMapSelector.value; mapUpdate();}