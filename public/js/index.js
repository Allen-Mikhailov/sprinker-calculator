const screen = document.getElementById("screen")

let gridWidth = 150
let gridHeight = 100

let gridSize = 5
let lineWidth = 1


function refreshScreen()
{
    const SCREEN_WIDTH = lineWidth*(gridWidth+1) + gridSize*gridWidth
    const SCREEN_HEIGHT = lineWidth*(gridHeight+1) + gridSize*gridHeight

    screen.width = SCREEN_WIDTH
    screen.height = SCREEN_HEIGHT+1

    screen.style.width = `${SCREEN_WIDTH}px`
    screen.style.height = `${SCREEN_HEIGHT+1}px`

    const ctx = screen.getContext("2d");

    // Lines
    for (let i = 0; i <= gridWidth; i++)
    {
        const d = i*(lineWidth+gridSize)

        console.log(d)

        ctx.fillRect(d, 0, lineWidth, SCREEN_HEIGHT)
        ctx.fillRect(0, d, SCREEN_WIDTH, lineWidth)
    }

    const c = Math.hypot(gridWidth, gridHeight)

    for (let x = 0; x < gridWidth; x++)
    {
        for (let y = 0; y < gridHeight; y++)
        {
            let ax = lineWidth + x*gridSize + (x)*lineWidth
            let ay = lineWidth + y*gridSize + (y)*lineWidth
            const disAlpha = Math.hypot(x, y)/c

            ctx.fillStyle = `rgb(${(1-disAlpha)*255}, ${255}, ${(1-disAlpha)*255})`
            ctx.fillRect(ax, ay, gridSize, gridSize)
        }
    }
}

refreshScreen()