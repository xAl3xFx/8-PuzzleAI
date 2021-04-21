const reconstructPath = (cameFrom, current, operations) => {
    const totalPath = [current];
    //TODO : Implement this

    console.log(`Win with ${operations} moves`);
    // while current in cameFrom.Keys:
    // current := cameFrom[current]
    // total_path.prepend(current)
    return [];
};

const getNeighbours = (node, grid) => {
    const neighbours = [];
    const x = node.x;
    const y = node.y;

    //Upper neighbour
    if(y - 1 >= 0){
        const neighbour = grid.find(el => el.x === x && el.y === y - 1 && el.id !== 0);
        if(neighbour)
            neighbours.push(neighbour);
    }

    //Bottom neighbour
    if(y + 1 < 3){
        const neighbour = grid.find(el => el.x === x && el.y === y + 1 && el.id !== 0);
        if(neighbour)
            neighbours.push(neighbour);
    }

    //Left neighbour
    if(x - 1 >= 0){
        const neighbour = grid.find(el => el.x === x - 1 && el.y === y && el.id !== 0);
        if(neighbour)
            neighbours.push(neighbour);
    }

    //Right neighbour
    if(x + 1 < 3){
        const neighbour = grid.find(el => el.x === x + 1 && el.y === y && el.id !== 0);
        if(neighbour)
            neighbours.push(neighbour);
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

const generateScoreTables = () => (new Array(9).fill(0)).reduce((acc, _, index) => {acc[index] = Infinity; return acc}, {});

const checkAllTilesInPlace = (gridState) => Object.keys(gridState).reduce((acc, el) => acc && parseInt(el) === gridState[el].id, true);

const manhattanDistance = (start, end) => Math.abs(start.x - end.x) + Math.abs(start.y - end.y);

const tilePersonalDistance = tile => {
    const end = {x : (tile.id) % 3, y : Math.ceil((tile.id - tile.id % 3) / 3)};
    const start = {x : tile.x, y : tile.y};
    return manhattanDistance(start, end);
};

const AStar = (start, h, grid) => {
    let operations = 0;
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    // This is usually implemented as a min-heap or priority queue rather than a hash-set.
    let openSet = [start];

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
    // to n currently known.
    const cameFrom = {};

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    //TODO : Generate this map for each node!
    const gScore = generateScoreTables();//map with default value of Infinity
    gScore[start.id] = 0;

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how short a path from start to finish can be if it goes through n.
    const fScore = generateScoreTables(); //map with default value of Infinity
    fScore[start.id] = h(start);

    let prev = start;
    while (openSet.length > 0){
        // This operation can occur in O(1) time if openSet is a min-heap or a priority queue
        //TODO : Swap tiles maybe
        const current = openSet.reduce((acc,elem) => fScore[elem.id] < fScore[acc.id] ? elem : acc, openSet[0]);
        const currentId = current.id;
        current.id = prev.id;
        prev.id = currentId;
        prev = current;

        //We 'win' when all the tiles are in their places.
        if(checkAllTilesInPlace(grid))
            return reconstructPath(cameFrom, current, operations);
        operations++;
        console.log(grid);

        openSet = openSet.filter(el => el !== current);
        for(let neighbour of getNeighbours(current, grid)){
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            const distance = 1; //The cost of each move si 1
            const tentativeGScore = gScore[current.id] + distance;
            if (tentativeGScore < gScore[neighbour.id]){
                cameFrom[neighbour.id] = current;
                gScore[neighbour.id] = tentativeGScore;

                console.log("Current:", current)
                console.log("Neighbours: ", neighbour)
                const switchedNeighbour = {...neighbour};
                switchedNeighbour.x = current.x;
                switchedNeighbour.y = current.y;
                fScore[neighbour.id] = gScore[neighbour.id] + h(switchedNeighbour);
                console.log("Heuristic of neighbour: ", h(switchedNeighbour))

                if (!openSet.find(el => el.id === neighbour.id))
                    openSet.push(neighbour);
            }
        }
    }

    //OpenSet is empty and path was not found
    //Since this game always has solution, this return
    //statement is not supposed to be reached.
    return false;
};

// const grid = generateGrid();
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

const currentGrid = grid3;

const start = currentGrid.find(el => el.id === 0);

AStar(start, tilePersonalDistance, currentGrid);
