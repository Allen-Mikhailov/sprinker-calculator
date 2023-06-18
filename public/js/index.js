const simScreen = document.getElementById("sim-screen")
const ctx = simScreen.getContext("2d");

const fpsCounter = document.getElementById("fps-counter")
const visibleMapSelector = document.getElementById("visible-map-selector")

// Simulation Stuff
const simulationTool = document.getElementById("simulation-tool")
const simulationRunButton = document.getElementById("simulation-run-button")
const simulationToggleSprinklersButton = document.getElementById("simulation-toggle-sprinklers-button")

// Material Stuff
const materialMap = document.getElementById("material-map")
const materialToolSize = document.getElementById("material-tool-size")
const materialToolSelect = document.getElementById("material-tool")

// Sprinkler
const sprinklerTool = document.getElementById("sprinkler-tool")
const sprinklerToolSelect = document.getElementById("sprinkler-tool-select")

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

const sprinklerTypes = {
    "test": {
        "angle": Math.PI/8,
        "distance": 30
    },
    "360": {
        "angle": Math.PI*2,
        "distance": 15
    }
}

function getPixelPoint(x, y)
{
    return (y*gridWidth+x)*3
}

function updateSize()
{
    SCREEN_WIDTH = lineWidth*(gridWidth+1) + gridSize*gridWidth
    SCREEN_HEIGHT = lineWidth*(gridHeight+1) + gridSize*gridHeight

    simScreen.width = SCREEN_WIDTH
    simScreen.height = SCREEN_HEIGHT+1

    simScreen.style.width = `${SCREEN_WIDTH}px`
    simScreen.style.height = `${SCREEN_HEIGHT+1}px`

    gridConversion = SCREEN_WIDTH/gridWidth


    colorBufferSize = gridWidth * gridHeight * 3
    simulationDisplayBuffer = new Uint8Array(colorBufferSize)
    materialDisplayBuffer = new Uint8Array(colorBufferSize)
    sprinklerDisplayBuffer = new Uint8Array(colorBufferSize)

    decorBuffer = new Uint8Array(gridHeight*gridWidth*4)

    materialBuffer = new Uint8Array(gridWidth * gridHeight)
    simulationBuffer = new Float64Array(gridWidth * gridHeight)

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

    sprinklerDisplayBuffer.fill(255)
}

updateSize()

function drawScreen(buffer, decBuffer)
{
    let i = 0;
    let j = 0;
    for (let y = 0; y < gridHeight; y++)
        {  
            const ay = lineWidth + y*gridSize + (y)*lineWidth
            const ady = ay+(gridSize-decorSize)/2
            for (let x = 0; x < gridWidth; x++)
            {
                const ax = lineWidth + x*gridSize + (x)*lineWidth
                const adx = ax+(gridSize-decorSize)/2

                // Main Grid
                ctx.fillStyle = `rgb(${buffer[i+0]},${buffer[i+1]},${buffer[i+2]})`
                ctx.fillRect(ax, ay, gridSize, gridSize)
                i += 3

                // Decor Grid
                ctx.fillStyle = `rgba(${decBuffer[j+0]},${decBuffer[j+1]},${decBuffer[j+2]}, ${decBuffer[j+3]})`
                ctx.fillRect(adx, ady, decorSize, decorSize)
                j += 4
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
    const newWalls = []
    for (let y = 0; y < gridHeight; y++)
    {
        for (let x = 0; x < gridWidth; x++)
        {
            const mat = materialBuffer[i++];

            materialDisplayBuffer[j++] = materialColors[mat][0]
            materialDisplayBuffer[j++] = materialColors[mat][1]
            materialDisplayBuffer[j++] = materialColors[mat][2]

            if (mat == 2)
            {
                // Is Wall
                newWalls.push(x)
                newWalls.push(y)
            }
        }
    }
    walls = newWalls
}

updateMaterialBuffer()

const PI2 = Math.PI*2

function posAngle(angle)
{
    return (angle+PI2)%PI2
}

function withinAngle(p0x, p0y, p1x, p1y, angle, dif)
{
    const d = Math.abs(Math.atan2(p1y-p0y, p1x-p0x)-angle)
    return d<=dif || PI2 - d <=dif
}

function sprinklerToPoint(x, y, sprinkler)
{
    return withinAngle(sprinkler.x, sprinkler.y, x, y, sprinkler.angle, sprinklerTypes[sprinkler.type].angle) 
        && Math.hypot((sprinkler.x-walls[i]), sprinkler.y - y) <= sprinklerTypes[sprinkler.type].distance
}

mod = (a, n) => {return a - Math.floor(a/n) * n}

function angleDif(a0, a1)
{
    return mod(a0-a1 + Math.PI, PI2) -  Math.PI
}

function getTileAngle(tx, ty, sx, sy)
{
    const TL = posAngle(Math.atan2(ty-sy, tx-sx))
    const TR = posAngle(Math.atan2(ty-sy, tx+1-sx))
    const BL = posAngle(Math.atan2(ty+1-sy, tx-sx))
    const BR = posAngle(Math.atan2(ty+1-sy, tx+1-sx))

    return [Math.min(TL,TR,BL,BR), Math.max(TL,TR,BL,BR)]
}

function sprinklerCoverPoint(x, y, sprinkler)
{
    const distance = Math.hypot(sprinkler.x-x, sprinkler.y - y)
    const angleTo = posAngle(Math.atan2(y - sprinkler.y, x - sprinkler.x))
    const sprinklerAngle = sprinklerTypes[sprinkler.type].angle
    const sprinklerDistance = sprinklerTypes[sprinkler.type].distance

    if (!withinAngle(sprinkler.x, sprinkler.y, x, y, sprinkler.angle, sprinklerAngle))
        return false

    if (distance > sprinklerDistance)
        return false

    const len = walls.length/2
    let i = 0
    while (i<len)
    {
        if (distance > Math.hypot((walls[i]+.5)-sprinkler.x, (walls[i+1]+.5)-sprinkler.y))
        {
            const angles = getTileAngle(walls[i], walls[i+1], sprinkler.x, sprinkler.y)
            const dif = angleDif(angles[0], angles[1])
            if (angleDif(angles[0], angleTo) <= dif && angleDif(angles[1], angleTo) <= dif)
                return false
        }
        i += 2
    }
    
    return true
}

function simulateSprinklers(sprinklers, buffer)
{
    buffer.fill(0)

    let i = 0
    for (let y = 0; y < gridHeight; y++)
    {
        for (let x = 0; x < gridWidth; x++)
        {
            if (materialBuffer[i] != 0)
            {
                // Isnt grass
                i++
                continue
            }


            let value = 0

            sprinklers.map((sprinkler) => {

                let validVert = 0

                validVert += sprinklerCoverPoint(x, y,     sprinkler) ? 1:0
                validVert += sprinklerCoverPoint(x, y+1,   sprinkler) ? 1:0
                validVert += sprinklerCoverPoint(x+1, y+1, sprinkler) ? 1:0
                validVert += sprinklerCoverPoint(x+1, y+1, sprinkler) ? 1:0
                
                value += validVert/4 * .25
            })

            buffer[i++] = value;
        }
    }
}

function updateSimDisplay(buffer)
{
    let i = 0;
    let j = 0;
    for (let y = 0; y < gridHeight; y++)
    {
        for (let x = 0; x < gridWidth; x++)
        {
            const mat = materialBuffer[i]
            if (mat == 0)
            {
                const value = buffer[i];

                simulationDisplayBuffer[j++] = 70;
                simulationDisplayBuffer[j++] = 70+clamp(value*(255-70), 0, 255-70);
                simulationDisplayBuffer[j++] = 70;
            } else {
                simulationDisplayBuffer[j++] = materialColors[mat][0]
                simulationDisplayBuffer[j++] = materialColors[mat][1]
                simulationDisplayBuffer[j++] = materialColors[mat][2]
            }

            i++
        }
    }
}

function drawSprinkler(sprinkler)
{
    const x = sprinkler.x*gridConversion
    const y = sprinkler.y*gridConversion

    const sprinkerD = sprinklerTypes[sprinkler.type]

    ctx.fillStyle = "black"
    ctx.beginPath();
    ctx.arc(x, y, gridConversion/2, 0, 2 * Math.PI);
    ctx.fill();

    const lAngle = sprinkler.angle + sprinkerD.angle
    const rAngle = sprinkler.angle - sprinkerD.angle

    ctx.beginPath();
    ctx.arc(x, y, sprinkerD.distance*gridConversion, rAngle, lAngle);
    ctx.stroke();

    ctx.beginPath(); 
    ctx.moveTo(x, y);
    ctx.lineTo(
        x + Math.cos(lAngle)*sprinkerD.distance*gridConversion, 
        y + Math.sin(lAngle)*sprinkerD.distance*gridConversion
        );
    ctx.stroke();

    ctx.beginPath(); 
    ctx.moveTo(x, y);
    ctx.lineTo(
        x + Math.cos(rAngle)*sprinkerD.distance*gridConversion, 
        y + Math.sin(rAngle)*sprinkerD.distance*gridConversion
        );
    ctx.stroke();
}   

function updateDecorBuffer()
{
    decorBuffer.fill(0)

    switch (map)
    {
        case "simulation":
            let mousePoint = (mgX + mgY*gridWidth)*4
            decorBuffer[mousePoint+3] = 255
            break;
        case "material":
            if (mWithinBounds)
            {
                applyBrush(decorBuffer, mgX, mgY, [gridWidth, gridHeight], {
                    "size": brushSize,
                    "spacing": 4,
                    "data": [0, 0, 0, 255]
                })
            }
            break;
    }
}

updateDecorBuffer()

function refreshScreen()
{
    const startTick = Date.now()

    let buffer = simulationDisplayBuffer

    switch(map)
    {
        case "simulation":
            buffer = simulationDisplayBuffer
            break;
        case "material":
            buffer = materialDisplayBuffer
            break;
        case "sprinklers":
            buffer = materialDisplayBuffer
            break
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

    drawScreen(buffer, decorBuffer)

    if (simToggleSprinklers)
    {
        sprinklers.map((sprinkler) => {
            drawSprinkler(sprinkler)
        })
    }

    switch(map)
    {
        case "simulation":
            break
        case "material":
            
            break;

        case "sprinklers":

            // Ghost Sprinkler
            if (ghostSprinkler)
            {
                ghostSprinkler.angle = Math.atan2(mY-ghostSprinkler.y, mX-ghostSprinkler.x)
                drawSprinkler(ghostSprinkler)
            }
            break;
    }

    fpsCounter.innerHTML = Date.now()-startTick

    requestAnimationFrame(refreshScreen)
}

function mapUpdate()
{
    materialMap.style.display = map == "material" ? "inline-block":"none"
    simulationTool.style.display = map == "simulation" ? "inline-block":"none"
    sprinklerTool.style.display = map == "sprinklers" ? "inline-block":"none"
    updateDecorBuffer()
}

mapUpdate()

refreshScreen()

function clamp(value, min, max)
{
    return Math.max(Math.min(value, max), min)
}

document.body.onmousemove = (e) => {
    let rect = simScreen.getBoundingClientRect()

    mX = (e.clientX-rect.left)/rect.width * gridWidth
    mY = (e.clientY-rect.top)/rect.height * gridHeight

    // console.log(mX, mY)

    mWithinBounds = mX >= 0 && mX <= gridWidth && mY >= 0 && mY <= gridHeight

    let gx = clamp(Math.floor(mX), 0, gridWidth-1)
    let gy = clamp(Math.floor(mY), 0, gridHeight-1)

    if (mgX != gx || mgY != gy)
    {
        mgX = gx; mgY = gy;
        updateDecorBuffer()
    }
}

document.body.onclick = () => {
    if (!mWithinBounds) return 

    switch (map)
    {
        case "material":
            applyBrush(materialBuffer, mgX, mgY, [gridWidth, gridHeight], {
                "size": brushSize,
                "data": [parseInt(materialToolSelect.value)],
                "spacing": 1
            })
            updateMaterialBuffer()
            break
        case "sprinklers":
            if (ghostSprinkler)
            {
                sprinklers.push(ghostSprinkler)
                ghostSprinkler = null
            } else {
                ghostSprinkler = {
                    "type": sprinklerToolSelect.value,
                    "x": mX,
                    "y": mY,
                }
            }
    }
}

simulationRunButton.onclick = () => {
    simulateSprinklers(sprinklers, simulationBuffer)
    updateSimDisplay(simulationBuffer)
}

materialToolSize.onchange = () => {brushSize = parseInt(materialToolSize.value);}
visibleMapSelector.onchange = () => {map = visibleMapSelector.value; mapUpdate();}
simulationToggleSprinklersButton.onclick = () => {simToggleSprinklers = !simToggleSprinklers}