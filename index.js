let currentGrid;
let paused = true;
let currentState;
let algorithm = "AStar";
let heuristic = "manhattan";

const drawBoard = (currentHash) => {
    console.log("Drawing board");
    const size = 400 / 3;
    const xDeviation = size / 2 - 15;
    const yDeviation = size / 2 + 15;
    const c = document.getElementById("myCanvas");
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 400, 400);
    let counter = 0;
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            ctx.beginPath();
            ctx.rect(j*size, i*size, size, size);
            ctx.stroke();

            const text = currentHash[counter] === "0" ? "" : currentHash[counter];
            ctx.font = "50px Arial";
            ctx.fillText(text, j * size + xDeviation, i * size + yDeviation);

            counter++;
        }
    }
};

const generateRandomGrid = () => {
    const grid = generateGrid();
    currentGrid = grid;
    currentState = generateHashForGrid(currentGrid);
    drawBoard(currentState);
};

const pause = () => {
    paused = true;
    document.getElementById("startOrPause").innerText = "Start";
};

const sleep = ms => new Promise(res => setTimeout(res, ms))

const start = async () => {
    setLoading(true);

    await sleep(0);
    paused = false;
    document.getElementById("startOrPause").innerText = "Pause";
    await solve();
};

const solve = async () => {
    //TODO: Dont run the algorithm again since we already have the path!
    const grid = constructGridFromHash(currentState);
    let result;
    if(algorithm === "AStar"){
        console.log(grid);
        result = await AStar(grid, heuristic);
        setLoading(false, result.operations, result.moves);
    }else{
        result = await bestFirstSearch(grid, heuristic);
        setLoading(false, result.operations, result.moves);
    }

    for(let i=0; i < result.path.length; i++){
        if(paused) break;
        currentState = result.path[i];
        await sleep(500);
        drawBoard(result.path[i]);
    }
};

const setLoading = (loading, operations, moves) => {
    if(loading){
        const c = document.getElementById("myCanvas");
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, 400, 400);
        ctx.fillText("Loading", 100, 100);
    }else{
        document.getElementById("loading").innerText = `Solution found! Total moves: ${moves}`;
    }
};

const loadGrid = (gridNumber) => {
    switch (gridNumber) {
        case 0: {
            currentGrid = grid0;
            currentState = generateHashForGrid(currentGrid);
            drawBoard(currentState);
            break;
        }
        case 1: {
            currentGrid = grid1;
            currentState = generateHashForGrid(currentGrid);
            drawBoard(currentState);
            break;
        }
        case 2: {
            currentGrid = grid2;
            currentState = generateHashForGrid(currentGrid);
            drawBoard(currentState);
            break;
        }
        case 3: {
            currentGrid = grid3;
            currentState = generateHashForGrid(currentGrid);
            drawBoard(currentState);
            break;
        }
    }
};

const changeAlgorithm = e => {
    algorithm = e.value;
};

const changeHeuristic = e => {
    heuristic = e.value;
};
