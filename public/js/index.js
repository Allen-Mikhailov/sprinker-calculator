// Canvases
const simulationDisplay = document.getElementById("simulation-display")
const materialDisplay = document.getElementById("material-display")

const brushDisplay = document.getElementById("brush-display")
const sprinklerDisplay = document.getElementById("sprinkler-display")

const canvasSpacer = document.getElementById("canvas-spacer")
const visibleMapSelector = document.getElementById("visible-map-selector")

// Simulation Stuff
const simulationTool = document.getElementById("simulation-tool")
const simulationRunButton = document.getElementById("simulation-run-button")


const toggleSprinklersButton = document.getElementById("toggle-sprinklers-button")
const toggleLinesButton = document.getElementById("toggle-lines-button")

// Material Stuff
const materialMap = document.getElementById("material-map")
const materialToolSize = document.getElementById("material-tool-size")
const materialToolSelect = document.getElementById("material-tool")

// Sprinkler
const sprinklerTool = document.getElementById("sprinkler-tool")
const sprinklerToolSelect = document.getElementById("sprinkler-tool-select")

const canvases = [
    simulationDisplay,
    materialDisplay,
    brushDisplay,
    sprinklerDisplay,
    canvasSpacer
]

const guiKeys = {
    "simulation-display": simulationDisplay,
    "material-display": materialDisplay,

    // "brush-display": brushDisplay,

    "simulation-tool": simulationTool,
    "material-map": materialMap,
    "sprinkler-tool": sprinklerTool
}

const guiActives = {
    "simulation": {
        "simulation-display": true,
        "simulation-tool": true,
    },
    "material": {
        "material-display": true,
        "material-map": true,
        // "brush-display": true,
    },
    "sprinklers": {
        "material-display": true,
        "sprinkler-tool": true
    }
}

function updateSize()
{
    SCREEN_WIDTH = lineWidth*(gridWidth+1) + gridSize*gridWidth
    SCREEN_HEIGHT = lineWidth*(gridHeight+1) + gridSize*gridHeight

    canvases.map((canvas) => {
        canvas.width = SCREEN_WIDTH
        canvas.height = SCREEN_HEIGHT+1

        canvas.style.width = `${SCREEN_WIDTH}px`
        canvas.style.height = `${SCREEN_HEIGHT+1}px`
    })

    gridConversion = SCREEN_WIDTH/gridWidth

    updateSimDisplay(simulationBuffer)
    updateMaterialDisplay()
    updateBrushDisplay()
    updateSprinklerDisplay()
}

function updateGridSize()
{

    colorBufferSize = gridWidth * gridHeight * 3
    simulationDisplayBuffer = new Uint8Array(colorBufferSize)
    materialDisplayBuffer = new Uint8Array(colorBufferSize)

    decorBuffer = new Uint8Array(gridHeight*gridWidth*4)

    materialBuffer = new Uint8Array(gridWidth * gridHeight)
    simulationBuffer = new Float64Array(gridWidth * gridHeight)

    // // Draw Test
    const c = hypot(gridWidth, gridHeight)
    let i = 0
    for (let y = 0; y < gridHeight; y++)
    {  
        for (let x = 0; x < gridWidth; x++)
        {
            const disAlpha = hypot(x, y)/c
            simulationBuffer[i++] = disAlpha
        }
    }

    updateSize()
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

    const ctx = simulationDisplay.getContext("2d")
    drawScreen(ctx, simulationDisplayBuffer)
}

function updateMaterialDisplay()
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
    const ctx = materialDisplay.getContext("2d")
    drawScreen(ctx, materialDisplayBuffer)
}

function updateBrushDisplay()
{
    decorBuffer.fill(0)

    switch (map)
    {
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
        default:
            let mousePoint = (mgX + mgY*gridWidth)*4
            decorBuffer[mousePoint+3] = 255
            break;
    }
    const ctx = brushDisplay.getContext("2d")
    drawDecor(ctx, decorBuffer)
}

function updateSprinklerDisplay()
{
    const ctx = sprinklerDisplay.getContext("2d")

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

    sprinklers.map((sprinkler) => {
        drawSprinkler(ctx, sprinkler)
    })

    // Ghost Sprinkler
    if (ghostSprinkler && map=="sprinklers")
    {
        ghostSprinkler.angle = atan2(mY-ghostSprinkler.y, mX-ghostSprinkler.x)
        drawSprinkler(ctx, ghostSprinkler)
    }
}

function mapUpdate()
{
    Object.keys(guiKeys).map((key) => {
        guiKeys[key].style.display = guiActives[map][key] ? "inline-block":"none"
    })

    updateBrushDisplay()
}

document.body.onmousemove = (e) => {
    let rect = canvasSpacer.getBoundingClientRect()

    mX = (e.clientX-rect.left)/rect.width * gridWidth
    mY = (e.clientY-rect.top)/rect.height * gridHeight

    // console.log(mX, mY)

    mWithinBounds = mX >= 0 && mX <= gridWidth && mY >= 0 && mY <= gridHeight

    let gx = clamp(floor(mX), 0, gridWidth-1)
    let gy = clamp(floor(mY), 0, gridHeight-1)

    if (mgX != gx || mgY != gy)
    {
        mgX = gx; mgY = gy;
        updateBrushDisplay()
    }

    if (ghostSprinkler)
    {
        updateSprinklerDisplay()
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
            updateMaterialDisplay()
            break
        case "sprinklers":
            if (ghostSprinkler)
            {
                sprinklers.push(ghostSprinkler)
                ghostSprinkler = null
                updateSprinklerDisplay()
            } else {
                ghostSprinkler = {
                    "type": sprinklerToolSelect.value,
                    "x": mX,
                    "y": mY,
                }
                updateSprinklerDisplay()
            }
    }
}

simulationRunButton.onclick = () => {
    simulateSprinklers(sprinklers, simulationBuffer)
    updateSimDisplay(simulationBuffer)
}

materialToolSize.onchange = () => {brushSize = parseInt(materialToolSize.value);}
visibleMapSelector.onchange = () => {map = visibleMapSelector.value; mapUpdate();}
toggleSprinklersButton.onclick = () => {
    simToggleSprinklers = !simToggleSprinklers
    sprinklerDisplay.style.display = simToggleSprinklers ? "inline-block":"none"
}

toggleLinesButton.onclick = () => {
    lineWidth = lineWidth == 1 ? 0:1
    updateSize()
}

updateGridSize()
mapUpdate()