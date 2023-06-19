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