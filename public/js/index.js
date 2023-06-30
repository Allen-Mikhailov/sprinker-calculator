// Canvases
const simulationDisplay = document.getElementById("simulation-display")
const materialDisplay = document.getElementById("material-display")
const topographyDisplay = document.getElementById("topography-display")

const brushDisplay = document.getElementById("brush-display")
const sprinklerDisplay = document.getElementById("sprinkler-display")

const canvasSpacer = document.getElementById("canvas-spacer")
const visibleMapSelector = document.getElementById("visible-map-selector")

// Simulation Stuff
const simulationTool = document.getElementById("simulation-tool")
const simulationRunButton = document.getElementById("simulation-run-button")
const simulationBlurButton = document.getElementById("simulation-blur-button")
const simulationSolveButton = document.getElementById("simulation-solve-button")

const toggleSprinklersButton = document.getElementById("toggle-sprinklers-button")
const toggleLinesButton = document.getElementById("toggle-lines-button")

// Material Stuff
const materialMap = document.getElementById("material-map")
const materialToolSize = document.getElementById("material-tool-size")
const materialToolSelect = document.getElementById("material-tool")
const materialToolAutogen = document.getElementById("material-tool-autogen")

// Sprinkler
const sprinklerTool = document.getElementById("sprinkler-tool")
const sprinklerToolSelect = document.getElementById("sprinkler-tool-select")

// Topography 
const topographyTool = document.getElementById("topography-tool")
const topographyToolAutogen = document.getElementById("topography-tool-autogen")

const hoverCords = document.getElementById("hover-cords")

const canvases = [
    simulationDisplay,
    materialDisplay,
    brushDisplay,
    sprinklerDisplay,
    topographyDisplay,
    canvasSpacer
]

const guiKeys = {
    "simulation-display": simulationDisplay,
    "material-display": materialDisplay,
    "topography-display": topographyDisplay,

    // "brush-display": brushDisplay,

    "simulation-tool": simulationTool,
    "material-map": materialMap,
    "sprinkler-tool": sprinklerTool,
    "topography-tool": topographyTool,
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
        "sprinkler-tool": true,
    },
    "topography": {
        "topography-display": true,
        "topography-tool": true,
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
    updateTopographyDisplay()
    updateBrushDisplay()
    updateSprinklerDisplay()
}

function updateGridSize()
{

    colorBufferSize = gridWidth * gridHeight * 3
    simulationDisplayBuffer = new Uint8Array(colorBufferSize)
    materialDisplayBuffer = new Uint8Array(colorBufferSize)
    topographyDisplayBuffer = new Uint8Array(colorBufferSize)

    decorBuffer = new Uint8Array(gridHeight*gridWidth*4)

    materialBuffer = new Uint8Array(gridWidth * gridHeight)
    simulationBuffer = new Float64Array(gridWidth * gridHeight)
    topographyBuffer = new Float64Array(gridWidth * gridHeight)

    // // Draw Test
    const c = hypot(gridWidth, gridHeight)
    let i = 0
    for (let y = 0; y < gridHeight; y++)
    {  
        for (let x = 0; x < gridWidth; x++)
        {
            const disAlpha = hypot(x, y)/c
            topographyBuffer[i] = disAlpha*5
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
    const newHWalls = new Uint8Array( ( gridHeight + 1 ) * ( gridWidth ) )
    const newVWalls = new Uint8Array( ( gridHeight ) * ( gridWidth + 1 ) )
    for (let y = 0; y < gridHeight; y++)
    {
        for (let x = 0; x < gridWidth; x++)
        {
            const mat = materialBuffer[i];

            materialDisplayBuffer[j++] = materialColors[mat][0]
            materialDisplayBuffer[j++] = materialColors[mat][1]
            materialDisplayBuffer[j++] = materialColors[mat][2]

            if (mat == 2)
            {
                const wallVI = y*(gridWidth+1)+x
                const wallHI = y*(gridWidth)+x

                // Checking Left Wall
                if (x > 0 && materialBuffer[i-1] != 2  && newVWalls[wallVI] == 0)
                    newVWalls[wallVI] = 1

                // Checking Right Wall
                if (x < gridWidth-1 && materialBuffer[i+1] != 2  && newVWalls[wallVI+1] == 0)
                    newVWalls[wallVI+1] = 1

                // Checking Top Wall
                if (y > 0 && materialBuffer[i-gridWidth] != 2 && newHWalls[wallHI] == 0)
                    newHWalls[wallHI] = 1

                // Checking Bottom Wall
                if (y < gridHeight-1 && materialBuffer[i+gridWidth] != 2 && newHWalls[wallHI+gridWidth] == 0)
                    newHWalls[wallHI+gridWidth] = 1
            }
            i++;
        }
    }

    const combinedHWalls = []
    for (let y = 0; y < gridHeight+1; y++)
    {
        const yc = y*gridWidth
        let x = 0;
        while (x < gridWidth)
        {
            if (newHWalls[yc+x] == 1)
            {
                let sx = x
                while (x+1 < gridWidth && newHWalls[yc+x+1] == 1)
                    x++;
                // console.log(x, y)
                combinedHWalls.push(sx)
                combinedHWalls.push(x)
                combinedHWalls.push(y)
            }
            x++;
        }
    }

    const combinedVWalls = []
    for (let x = 0; x < gridWidth+1; x++)
    {
        let y = 0;
        while (y < gridHeight)
        {
            if (newVWalls[y*(gridWidth+1)+x] == 1)
            {
                let sy = y
                while (y+1 < gridHeight && newVWalls[(y+1)*(gridWidth+1)+x] == 1)
                    y++;
                combinedVWalls.push(x)
                combinedVWalls.push(sy)
                combinedVWalls.push(y)
            }
            y++;
        }
    }


    horizontalWalls = combinedHWalls
    verticalWalls   = combinedVWalls
    
    const ctx = materialDisplay.getContext("2d")
    drawScreen(ctx, materialDisplayBuffer)
    drawWalls(ctx)
}

function updateTopographyDisplay()
{
    let i = 0;
    let j = 0;

    let min = 0
    for (let k = 0; k < gridHeight*gridWidth; k++)
        min = max(min, topographyBuffer[k])

    for (let y = 0; y < gridHeight; y++)
    {
        for (let x = 0; x < gridWidth; x++)
        {
            const height = topographyBuffer[i++]/min * 255;

            topographyDisplayBuffer[j++] = height
            topographyDisplayBuffer[j++] = height
            topographyDisplayBuffer[j++] = height
        }
    }

    const ctx = topographyDisplay.getContext("2d")
    drawScreen(ctx, topographyDisplayBuffer)
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
        hoverCords.innerHTML = `${mgX}, ${mgY}`
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

materialToolAutogen.onclick = () => {
    let i = 0;

    noise.seed(Math.random());

    for (let y = 0; y < gridHeight; y++)
    {
        for (let x = 0; x < gridWidth; x++)
        {
            const value = noise.simplex2(x / 25, y / 25);
            if (value < .5)
                materialBuffer[i++] = 0
            else if (value < .6)
                materialBuffer[i++] = 1
            else
                materialBuffer[i++] = 2
        }
    }
    updateMaterialDisplay()
}

topographyToolAutogen.onclick = () => {
    let i = 0;

    noise.seed(Math.random());

    for (let y = 0; y < gridHeight; y++)
    {
        for (let x = 0; x < gridWidth; x++)
        {
            const value = 1+noise.simplex2(x / 25, y / 25);
            if (value < .5)
                topographyBuffer[i++] = value
            else if (value < .6)
                topographyBuffer[i++] = value
            else
                topographyBuffer[i++] = value
        }
    }
    updateTopographyDisplay()
}

simulationRunButton.onclick = () => {

    simulateSprinklers(sprinklers, simulationBuffer)
    updateSimDisplay(simulationBuffer)
}

simulationBlurButton.onclick = () => {
    for (let i = 0; i < 4; i++)
    {
        blur(new Float64Array(simulationBuffer), simulationBuffer)
    }
    updateSimDisplay(simulationBuffer)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function checkAngle(angle)
{
    angle = posAngle(angle)

    if (angle > Math.PI)
        return -Math.PI*2+angle
    return angle
}

async function solve()
{
    const generations = 200
    const genSize = 10

    const angleChange = .1
    const positionChange = .3

    let generation = []

    // function 

    // Creating Initial Generation
    for (let i = 0; i < genSize; i++)
    {
        const gen = []
        sprinklers.map((sprinkler) => {
            gen.push({
                "x":Math.random()*gridWidth,
                "y":Math.random()*gridHeight,
                "type": sprinkler.type,
                "angle": Math.random()*2*Math.PI
            })
        })

        generation.push(gen)
    }

    const buffer = new Float64Array(gridWidth*gridHeight)
    for (let i = 0; i < generations; i++)
    {
        const scores = []
        for (let j = 0; j < genSize; j++)
        {
            simulateSprinklers(generation[j], buffer)
            scores.push(evaluateSim(buffer))
        }

        duoSort(scores, generation)
        scores.reverse()
        generation.reverse()
        // console.log(scores)

        const newGeneration = []
        for (let j = 0; j < genSize/2; j++)
        {
            // newGeneration.push(generation[j])
            let newSet = []
            for (let k = 0; k < generation[j].length; k++)
            {
                newSet.push({
                    "x": generation[j][k].x + random()*positionChange,
                    "y": generation[j][k].y + random()*positionChange,
                    "angle": checkAngle(generation[j][k].angle + random()*angleChange),
                    "type": generation[j][k].type
                })
            }
            newGeneration.push(newSet)

            newSet = []
            for (let k = 0; k < generation[j].length; k++)
            {
                newSet.push({
                    "x": generation[j][k].x + random()*positionChange,
                    "y": generation[j][k].y + random()*positionChange,
                    "angle": checkAngle(generation[j][k].angle + random()*angleChange),
                    "type": generation[j][k].type
                })
            }
            newGeneration.push(newSet)
        }

        await sleep(1)

        sprinklers = generation[0]

        updateSprinklerDisplay()
        simulateSprinklers(sprinklers, simulationBuffer)
        updateSimDisplay(simulationBuffer)

        generation = newGeneration

        console.log(""+(i+1)/generations*100+"% " + scores[0])
    }
}

simulationSolveButton.onclick = solve

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