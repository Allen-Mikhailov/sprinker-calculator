function sprinklerCoverPoint(x, y, sprinkler)
{
    const distance = Math.hypot(sprinkler.x-x, sprinkler.y - y)
    const angleTo = posAngle(Math.atan2(y - sprinkler.y, x - sprinkler.x))
    const sprinklerAngle = sprinklerTypes[sprinkler.type].angle
    const sprinklerDistance = sprinklerTypes[sprinkler.type].distance

    const [a,b,c] = convertToABC(x,y,angleTo)

    if (!withinAngle(sprinkler.x, sprinkler.y, x, y, sprinkler.angle, sprinklerAngle))
        return false

    if (distance > sprinklerDistance)
        return false

    const len = walls.length/2
    let i = 0
    while (i<len)
    {
        if (distance > Math.hypot((walls[i*2]+.5)-sprinkler.x, (walls[i*2+1]+.5)-sprinkler.y))
        {
            const angleT = atan2(walls[i*2+1]+.5-sprinkler.y, (walls[i*2]+.5)-sprinkler.x)
            if (abs(angleDif(angleT, angleTo)) < Math.PI/2 && squareIntersect(a,b,c, walls[i*2], walls[i*2+1]))
            {
                return false
            }
        }
        i++;
    }
    
    return true
}

function validPoint(x, y)
{
    return x > -1 && x < gridWidth && y > -1 && y < gridHeight
}

function getValidblurPoints(x, y)
{
    const within = x > 0 && x < gridWidth-1 && y > 0 && y < gridHeight-1

    const validPoints = []
    for (let i = 0; i < blurPattern.length; i+=2)
    {
        if (materialBuffer[getIndex(blurPattern[i]+x, blurPattern[i+1]+y)] == 0  
            &&  (within||validPoint(blurPattern[i]+x, blurPattern[i+1]+y)))
        {
            validPoints.push(blurPattern[i]+x)
            validPoints.push(blurPattern[i+1]+y)
        }   
    }

    // console.log(validPoints)

    return validPoints
}

function blur(buffer, writeBuffer)
{
    writeBuffer.fill(0)
    for (let y = 0; y < gridHeight; y++)
    {
        for (let x = 0; x < gridWidth; x++)
        {
            // Gathering Valid Points
            const validPoints = getValidblurPoints(x, y)
            const weights = []
            let totalWeight = 0
            const current = buffer[y*gridWidth + x]

            // Calculating the weights
            const currentHeight = topographyBuffer[y*gridWidth+x]
            for (let i = 0; i < validPoints.length; i+=2)
            {
                const height = topographyBuffer[validPoints[i+1]*gridWidth + validPoints[i]]
                const weight = Math.pow(heightWeight, currentHeight-height)
                weights.push(weight)
                totalWeight += weight
            }

            // Applying the blur
            for (let i = 0; i < validPoints.length; i+=2)
            {
                writeBuffer[validPoints[i+1]*gridWidth + validPoints[i]] += weights[i/2]/totalWeight*current
            }
        }
    }
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

    let a = new Float64Array(buffer)
    let b = new Float64Array(gridWidth*gridHeight)
    for (let j = 0; j < blurTicks-1; j++)
    {
        blur(a, b)

        // Swap
        const temp = a
        a = b
        b = temp
    }

    if (blurTicks > 0 )
    {
        blur(a, buffer)
    }
}

function evaluateSim(buffer)
{
    let covered = 0
    const len = gridWidth*gridHeight
    for (let i = 0; i < len; i++)
    {
        covered += buffer[i] > 0 ? 1:0
    }
    return covered/len
}