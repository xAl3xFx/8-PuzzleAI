const reconstructPath = (start, cameFrom, current, operations) => {
    console.log(`Win with ${operations} operations`);
    console.dir(cameFrom[current]);

    let moves = 0;
    const path = [];

    const countMoves = (state) => {
        path.unshift(state);
        if(state === start) return;
        moves++;
        if(cameFrom[state] !== undefined)
            countMoves(cameFrom[state]);
    };
    countMoves(current);

    return {path, moves, operations};
};

const constructGridFromHash = (gridHash) => {
    let rowIndex = -1;
    const grid = gridHash.split("").map((el, colIndex) => {
        return {id: parseInt(el), x: colIndex % 3, y: colIndex % 3 === 0 ? ++rowIndex : rowIndex};
    });
    return grid;
};

const inverseTiles = (grid, tile1, tile2) => {
    const gridCopy = JSON.parse(JSON.stringify(grid));
    gridCopy.forEach(el => {
        if(el.id === tile1.id){
            el.id = tile2.id;
            return el;
        }else if(el.id === tile2.id){
            el.id = tile1.id;
            return el;
        }else{
            return el;
        }
    });
    return gridCopy;
};

const getNeighbours = (gridHash) => {
    const grid = constructGridFromHash(gridHash);
    const emptyTile = grid.find(el => el.id === 0);
    const {x, y} = emptyTile;

    const neighbours = [];

    //Left neighbour
    if(emptyTile.x - 1 >= 0) {
        const neighbour = grid.find(el => el.x === x - 1 && el.y === y && el.id !== 0);
        const neighbourGrid = inverseTiles(grid, emptyTile, neighbour);
        neighbours.push(generateHashForGrid(neighbourGrid));
    }

    //Bottom neighbour
    if(emptyTile.y + 1 < 3){
        const neighbour = grid.find(el => el.x === x && el.y === y + 1 && el.id !== 0);
        const neighbourGrid = inverseTiles(grid, emptyTile, neighbour);
        neighbours.push(generateHashForGrid(neighbourGrid));
    }

    //Right neighbour
    if(emptyTile.x + 1 < 3){
        const neighbour = grid.find(el => el.x === x + 1 && el.y === y && el.id !== 0);
        const neighbourGrid = inverseTiles(grid, emptyTile, neighbour);
        neighbours.push(generateHashForGrid(neighbourGrid));
    }

    //Upper neighbour
    if(emptyTile.y - 1 >= 0){
        const neighbour = grid.find(el => el.x === x && el.y === y - 1 && el.id !== 0);
        const neighbourGrid = inverseTiles(grid, emptyTile, neighbour);
        neighbours.push(generateHashForGrid(neighbourGrid));
    }

    return neighbours;
};

const countInversions = (array) => {
    let invCount = 0;
    const len = array.length;
    for (let i = 0; i < len - 1; i++)
        for (let j = i + 1; j < len; j++)
        if (array[i] > array[j])
            invCount++;
    return invCount;
};

const generateGrid = () => {
    //Generate random tiles order
    let tiles = [];
    while(tiles.length < 9){
        const tileIndex = Math.floor(Math.random() * 9);
        if(!tiles.includes(tileIndex))
            tiles.push(tileIndex);
    }


    if(countInversions(tiles) % 2 === 1) generateGrid();


    //Fill the grid with the tiles
    let rowIndex = -1;
    const grid = tiles.map((el, colIndex) => {
        return {id: el, x: colIndex % 3, y: colIndex % 3 === 0 ? ++rowIndex : rowIndex};
    });

    return grid;
};

const countMissPlacedTiles = (gridHash) => gridHash.split("").reduce((acc,elem, index) => parseInt(elem) !== index ? acc + 1 : acc, 0);

const manhattan = (gridHash) => {
    const grid = constructGridFromHash(gridHash)
    const manhattanDistance = (start, end) => Math.abs(start.x - end.x) + Math.abs(start.y - end.y);

    const result = Object.values(grid).reduce((acc, elem) => {
        if(elem.id === 0)
            return acc;
        const end = {x : (elem.id) % 3, y : Math.ceil((elem.id - elem.id % 3) / 3)};
        const start = {x : elem.x, y : elem.y};
        const distance = manhattanDistance(start, end);
        return acc + distance;
    }, 0);

    return result;
};

const generateHashForGrid = (grid) => {
    return grid.reduce((acc, tile) => acc + tile.id, "");
};

const bestFirstSearch = (start, heuristic) => {
    const h = heuristic === "manhattan" ? manhattan : countMissPlacedTiles;
    let operations = 0;
    const startHash = generateHashForGrid(start);
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    // This is usually implemented as a min-heap or priority queue rather than a hash-set.
    let openSet = [startHash];

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
    // to n currently known.
    const cameFrom = {};

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how short a path from start to finish can be if it goes through n.
    // const fScore = generateScoreTables(); //map with default value of Infinity
    const fScore = {};
    fScore[startHash] = 0;

    const visited = [];

    while (openSet.length > 0){
        // This operation can occur in O(1) time if openSet is a min-heap or a priority queue
        const current = openSet.filter(el => !visited.includes(el)).reduce((acc, gridHash) => fScore[gridHash] <= fScore[acc] ? gridHash : acc, openSet[0]);
        if(!visited.includes(current)) visited.push(current);

        if(current === "012345678")
            return reconstructPath(startHash, cameFrom, current, operations);

        operations++;
        if(operations % 1000 === 0) console.log(`${operations} operations reached.`)

        openSet = openSet.filter(el => el !== current);

        for(let neighbour of getNeighbours(current)){
            if(fScore[neighbour] === undefined) fScore[neighbour] = fScore[current];
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            const distance = 1; //The cost of each move si 1
            fScore[neighbour] = h(neighbour);

            if (!openSet.find(el => el === neighbour) && !visited.includes(neighbour)) {
                openSet.push(neighbour);
                cameFrom[neighbour] = current;
            }
        }
    }

    //OpenSet is empty and path was not found
    //Since this game always has solution, this return
    //statement is not supposed to be reached.
    return false;
};

const AStar = (start, heuristic) => {
    const h = heuristic === "manhattan" ? manhattan : countMissPlacedTiles;
    let operations = 0;
    const startHash = generateHashForGrid(start);
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    // This is usually implemented as a min-heap or priority queue rather than a hash-set.
    let openSet = [startHash];

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
    // to n currently known.
    const cameFrom = {};

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    // const gScore = generateScoreTables();//map with default value of Infinity
    const gScore = {};
    gScore[startHash] = 0;

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how short a path from start to finish can be if it goes through n.
    // const fScore = generateScoreTables(); //map with default value of Infinity
    const fScore = {};
    fScore[startHash] = 0;

    const visited = [];

    while (openSet.length > 0){
        // This operation can occur in O(1) time if openSet is a min-heap or a priority queue
        const current = openSet.filter(el => !visited.includes(el)).reduce((acc, gridHash) => fScore[gridHash] <= fScore[acc] ? gridHash : acc, openSet[0]);
        if(!visited.includes(current)) visited.push(current);

        if(current === "012345678")
            return reconstructPath(startHash, cameFrom, current, operations);

        operations++;
        if(operations % 1000 === 0) console.log(`${operations} operations reached.`)

        openSet = openSet.filter(el => el !== current);

        for(let neighbour of getNeighbours(current)){
            if(fScore[neighbour] === undefined) fScore[neighbour] = fScore[current];
            if(gScore[neighbour] === undefined) gScore[neighbour] = gScore[current];
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            const distance = 1; //The cost of each move si 1
            const tentativeGScore = gScore[current] + distance;
                gScore[neighbour] = tentativeGScore;
                fScore[neighbour] = gScore[neighbour] + h(neighbour);

                if (!openSet.find(el => el === neighbour) && !visited.includes(neighbour)) {
                    openSet.push(neighbour);
                    cameFrom[neighbour] = current;

                }
        }
    }

    //OpenSet is empty and path was not found
    //Since this game always has solution, this return
    //statement is not supposed to be reached.
    return false;
};

// const grid = generateGrid();

const grid0 = [
    { id: 1, x: 0, y: 0 },
    { id: 2, x: 1, y: 0 },
    { id: 0, x: 2, y: 0 },
    { id: 3, x: 0, y: 1 },
    { id: 4, x: 1, y: 1 },
    { id: 5, x: 2, y: 1 },
    { id: 6, x: 0, y: 2 },
    { id: 7, x: 1, y: 2 },
    { id: 8, x: 2, y: 2 }
];

const grid1 = [
    { id: 0, x: 0, y: 0 },
    { id: 3, x: 1, y: 0 },
    { id: 4, x: 2, y: 0 },
    { id: 1, x: 0, y: 1 },
    { id: 6, x: 1, y: 1 },
    { id: 5, x: 2, y: 1 },
    { id: 8, x: 0, y: 2 },
    { id: 7, x: 1, y: 2 },
    { id: 2, x: 2, y: 2 }
];

const grid2 = [
    { id: 0, x: 0, y: 0 },
    { id: 7, x: 1, y: 0 },
    { id: 3, x: 2, y: 0 },
    { id: 5, x: 0, y: 1 },
    { id: 8, x: 1, y: 1 },
    { id: 1, x: 2, y: 1 },
    { id: 2, x: 0, y: 2 },
    { id: 6, x: 1, y: 2 },
    { id: 4, x: 2, y: 2 }
];

const grid3 = [
    { id: 0, x: 0, y: 0 },
    { id: 3, x: 1, y: 0 },
    { id: 5, x: 2, y: 0 },
    { id: 1, x: 0, y: 1 },
    { id: 7, x: 1, y: 1 },
    { id: 8, x: 2, y: 1 },
    { id: 2, x: 0, y: 2 },
    { id: 6, x: 1, y: 2 },
    { id: 4, x: 2, y: 2 }
];