const reconstructPath = (cameFrom, current, operations) => {
    const totalPath = [current];
    //TODO : Implement this

    console.log(`Win with ${operations} moves`);
    // while current in cameFrom.Keys:
    // current := cameFrom[current]
    // total_path.prepend(current)
    return [];
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

    //Upper neighbour
    if(emptyTile.y - 1 >= 0){
        const neighbour = grid.find(el => el.x === x && el.y === y - 1 && el.id !== 0);
        const neighbourGrid = inverseTiles(grid, emptyTile, neighbour);
        neighbours.push(generateHashForGrid(neighbourGrid));
    }

    //Bottom neighbour
    if(emptyTile.y + 1 < 3){
        const neighbour = grid.find(el => el.x === x && el.y === y + 1 && el.id !== 0);
        const neighbourGrid = inverseTiles(grid, emptyTile, neighbour);
        neighbours.push(generateHashForGrid(neighbourGrid));
    }

    //Left neighbour
    if(emptyTile.x - 1 >= 0){
        const neighbour = grid.find(el => el.x === x - 1 && el.y === y && el.id !== 0);
        const neighbourGrid = inverseTiles(grid, emptyTile, neighbour);
        neighbours.push(generateHashForGrid(neighbourGrid));
    }

    //Right neighbour
    if(emptyTile.x + 1 < 3){
        const neighbour = grid.find(el => el.x === x + 1 && el.y === y && el.id !== 0);
        const neighbourGrid = inverseTiles(grid, emptyTile, neighbour);
        neighbours.push(generateHashForGrid(neighbourGrid));
    }

    return neighbours;
};

const generateGrid = () => {
    //Generate random tiles order
    const tiles = [];
    while(tiles.length < 9){
        const tileIndex = Math.floor(Math.random() * 10);
        if(!tiles.includes(tileIndex))
            tiles.push(tileIndex);
    }

    //Fill the grid with the tiles
    let rowIndex = -1;
    const grid = tiles.map((el, colIndex) => {
        return {id: el, x: colIndex % 3, y: colIndex % 3 === 0 ? ++rowIndex : rowIndex};
    });

    return grid;
};

// const generateScoreTables = (grid) => (new Array(9).fill(0)).reduce((acc, _, index) => {acc[index] = Infinity; return acc}, {});

const checkAllTilesInPlace = (gridState) => Object.keys(gridState).reduce((acc, el) => acc && parseInt(el) === gridState[el].id, true);

const countMissPlacedTiles = (gridHash) => gridHash.split("").reduce((acc,elem, index) => parseInt(elem) !== index ? acc + 1 : acc, 0);

const heuristic = (gridHash) => {
    const grid = constructGridFromHash(gridHash);
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

const AStar = (start, h) => {
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
    fScore[startHash] = h(startHash);

    while (openSet.length > 0){
        // This operation can occur in O(1) time if openSet is a min-heap or a priority queue
        //TODO : Swap tiles maybe
        const current = openSet.reduce((acc, gridHash) => fScore[gridHash] < fScore[acc] ? gridHash : acc, openSet[0]);

        //We 'win' when all the tiles are in their places.
        // if(checkAllTilesInPlace(current))
        if(current === "012345678")
            return reconstructPath(cameFrom, current, operations);
        operations++;
        console.log(constructGridFromHash(current));

        openSet = openSet.filter(el => el !== current);
        for(let neighbour of getNeighbours(current)){
            if(fScore[neighbour] === undefined) fScore[neighbour] = Infinity;
            if(gScore[neighbour] === undefined) gScore[neighbour] = Infinity;
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            const distance = 1; //The cost of each move si 1
            const tentativeGScore = gScore[current] + distance;
            if (tentativeGScore < gScore[neighbour]){
                cameFrom[neighbour] = current;
                gScore[neighbour] = tentativeGScore;

                fScore[neighbour] = gScore[neighbour] + h(neighbour);

                if (!openSet.find(el => el === neighbour))
                    openSet.push(neighbour);
            }
        }
    }

    //OpenSet is empty and path was not found
    //Since this game always has solution, this return
    //statement is not supposed to be reached.
    return false;
};

const grid = generateGrid();
const grid1 = [
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

const grid2 = [
    { id: 1, x: 0, y: 0 },
    { id: 2, x: 1, y: 0 },
    { id: 5, x: 2, y: 0 },
    { id: 3, x: 0, y: 1 },
    { id: 4, x: 1, y: 1 },
    { id: 0, x: 2, y: 1 },
    { id: 6, x: 0, y: 2 },
    { id: 7, x: 1, y: 2 },
    { id: 8, x: 2, y: 2 }
];

const grid3 = [
    { id: 1, x: 0, y: 0 },
    { id: 2, x: 1, y: 0 },
    { id: 5, x: 2, y: 0 },
    { id: 3, x: 0, y: 1 },
    { id: 0, x: 1, y: 1 },
    { id: 4, x: 2, y: 1 },
    { id: 6, x: 0, y: 2 },
    { id: 7, x: 1, y: 2 },
    { id: 8, x: 2, y: 2 }
];

const grid4 = [
    { id: 1, x: 0, y: 0 },
    { id: 2, x: 1, y: 0 },
    { id: 5, x: 2, y: 0 },
    { id: 3, x: 0, y: 1 },
    { id: 7, x: 1, y: 1 },
    { id: 4, x: 2, y: 1 },
    { id: 0, x: 0, y: 2 },
    { id: 6, x: 1, y: 2 },
    { id: 8, x: 2, y: 2 }
];

const gridRandom = [
    { id: 5, x: 0, y: 0 },
    { id: 7, x: 1, y: 0 },
    { id: 4, x: 2, y: 0 },
    { id: 1, x: 0, y: 1 },
    { id: 6, x: 1, y: 1 },
    { id: 3, x: 2, y: 1 },
    { id: 0, x: 0, y: 2 },
    { id: 8, x: 1, y: 2 },
    { id: 2, x: 2, y: 2 }
];

const currentGrid = grid;

const start = currentGrid.find(el => el.id === 0);

AStar(currentGrid, heuristic);
