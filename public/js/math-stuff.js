const sin = Math.sin
const cos = Math.cos
const abs = Math.abs
const atan2 = Math.atan2
const min = Math.min
const max = Math.max
const hypot = Math.hypot
const PI2 = Math.PI*2

const floor = Math.floor

function clamp(value, mi, ma)
{return max(min(value, ma), mi);}

function convertToABC(x, y, a)
{return [-sin(a), cos(a), sin(a)*x - cos(a)*y];}

function angleDif(a0, a1)
{return mod(a0-a1 + Math.PI, PI2) -  Math.PI;}

mod = (a, n) => {return a - Math.floor(a/n) * n}

function lineIntersect(a1,b1,c1,a2,b2,c2)
{
    const x = (b1*c2-b2*c1)/(a1*b2-a2*b1)
    const y = (a2*c1-a1*c2)/(a1*b2-a2*b1)
    return [x, y]
}

function posAngle(angle)
{
    return (angle+PI2)%PI2
}

function withinAngle(p0x, p0y, p1x, p1y, angle, dif)
{
    const d = abs(atan2(p1y-p0y, p1x-p0x)-angle)
    return d<=dif || PI2 - d <=dif
}

function sprinklerToPoint(x, y, sprinkler)
{
    return withinAngle(sprinkler.x, sprinkler.y, x, y, sprinkler.angle, sprinklerTypes[sprinkler.type].angle) 
        && Math.hypot((sprinkler.x-walls[i]), sprinkler.y - y) <= sprinklerTypes[sprinkler.type].distance
}

function getTileAngle(tx, ty, sx, sy)
{
    const TL = posAngle(atan2(ty-sy, tx-sx))
    const TR = posAngle(atan2(ty-sy, tx+1-sx))
    const BL = posAngle(atan2(ty+1-sy, tx-sx))
    const BR = posAngle(atan2(ty+1-sy, tx+1-sx))

    return [min(TL,TR,BL,BR), max(TL,TR,BL,BR)]
}

function squareIntersect(a, b, c, x, y)
{
    const [ta,tb,tc] = convertToABC(x,y,0)
    const [ba,bb,bc] = convertToABC(x,y+1,0)
    const [la,lb,lc] = convertToABC(x,y,Math.PI/2)
    const [ra,rb,rc] = convertToABC(x+1,y,Math.PI/2)

    const [tx, ty] = lineIntersect(a,b,c,ta,tb,tc)
    const [bx, by] = lineIntersect(a,b,c,ba,bb,bc)
    const [lx, ly] = lineIntersect(a,b,c,la,lb,lc)
    const [rx, ry] = lineIntersect(a,b,c,ra,rb,rc)

    return (
        (!isNaN(tx) && !isNaN(ty) && tx >= x && tx <= x+1) ||
        (!isNaN(bx) && !isNaN(by) && bx >= x && bx <= x+1) ||
        (!isNaN(lx) && !isNaN(ly) && ly >= y && ly <= y+1) ||
        (!isNaN(rx) && !isNaN(ry) && ry >= y && ry <= y+1)
    )
}

function getPixelPoint(x, y)
{
    return (y*gridWidth+x)*3
}