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

const materialColors = [
    [0, 255, 0],     // 0: grass
    [120, 120, 120], // 1: concrete
    [30, 30, 30],    // 2: Wall
]

let blurPattern = [
    // Top, Left, Down, Right
    0,   0,
    1,   0, 
    -1,  0,
    0,   1,
    0,  -1,

    // Corners
    1,   1,
    -1,  1,
    1,  -1,
    -1, -1,
]
