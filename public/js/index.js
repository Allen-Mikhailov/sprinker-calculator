const simScreen = document.getElementById("sim-screen")
const visibleMapSelector = document.getElementById("visible-map-selector")

let gridWidth = 150
let gridHeight = 100

let gridSize = 5
let lineWidth = 1


function refreshScreen()
{
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

        console.log(d)

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

    applyToGrid((x, y, ax, ay) => {
        const disAlpha = Math.hypot(x, y)/c

        ctx.fillStyle = `rgb(${(1-disAlpha)*255}, ${255}, ${(1-disAlpha)*255})`
        ctx.fillRect(ax, ay, gridSize, gridSize)
    })
}

visibleMapSelector.onchange = refreshScreen

refreshScreen()

simScreen.onmousemove = (e) => {
    //e.clientX
}