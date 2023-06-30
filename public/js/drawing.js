
function drawLines(ctx)
{
    ctx.fillStyle = "black"
    for (let i = 0; i <= gridWidth; i++)
    {
        const d = i*(lineWidth+gridSize)
        ctx.fillRect(d, 0, lineWidth, SCREEN_HEIGHT)
        ctx.fillRect(0, d, SCREEN_WIDTH, lineWidth)
    }
}

function drawWalls(ctx)
{
    const d = (lineWidth+gridSize)

    // Vertical Walls
    console.log(verticalWalls)
    for (let i = 0; i < verticalWalls.length; i+=3)
    {
        const startX = verticalWalls[i]
        const startY = verticalWalls[i+1]
        const endY   = verticalWalls[i+2]

        ctx.fillStyle = "red"
        ctx.fillRect(startX*d, 0, startY*d, (endY-startY+1)*d)
    }
}

function drawScreen(ctx, buffer)
{
    // drawLines(ctx)

    let i = 0;
    for (let y = 0; y < gridHeight; y++)
    {  
        const ay = y*gridSize + (y)*lineWidth
        for (let x = 0; x < gridWidth; x++)
        {
            const ax = x*gridSize + (x)*lineWidth

            // Main Grid
            ctx.fillStyle = `rgb(${buffer[i+0]},${buffer[i+1]},${buffer[i+2]})`
            ctx.fillRect(ax, ay, gridSize+lineWidth, gridSize+lineWidth)
            i += 3
        }
    }
    drawLines(ctx)
}

function drawDecor(ctx, buffer)
{
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

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

function drawSprinkler(ctx, sprinkler)
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

function applyBrush(buffer, x, y, size, bs)
{
    for (let ax = max(x-bs.size+1, 0); ax < x+bs.size && ax < size[0]; ax++)
    {
        for (let ay = max(y-bs.size+1, 0); ay < y+bs.size  && ay < size[1]; ay++)
        {
            let pxPoint = (size[0]*ay + ax)*bs.spacing
            for (let i = 0; i < bs.data.length; i++)
            {
                buffer[pxPoint++] = bs.data[i]
            }
        }
    }
}