const wrapper = document.querySelector('.wrapper'),
    chessTable = document.querySelector('.chess-table'),
    chessSquares = document.querySelectorAll('.chess-square');
let we = 0;
let arrayOfChess = {},
    orderPlayer = { order: 1, flag: false },
    target,
    lastTarget = 0,
    lastTargetValue = 0,
    currentTarget = [],
    lastOver,
    eatPrompt = {},
    initialSquare,
    prompts = [],
    pawnsArr = [];


const chessPathes = {
    rook: {
        isAuto: true,
        back: true,
        p: [-8, 1, -1, 8]
    },
    horse: {
        isAuto: false,
        canJump: true,
        back: true,
        p: [
            [2, 8],
            [-2, -8],
            [2, -8],
            [-2, 8],
            [-1, 16],
            [1, 16],
            [1, -16],
            [-1, -16]
        ]
    },
    bishop: {
        isAuto: true,
        back: true,
        p: [-9, -7, 9, 7]
    },
    pawn: {
        isAuto: false,
        canJump: false,
        back: false,
        counter: 1,
        p: [-8, -16],
        pEat: [-1, 1]
    },
    queen: {
        isAuto: true,
        back: true,
        p: [-8, 1, -1, 8, -9, -7, 9, 7]
    },
    king: {
        isAuto: false,
        back: true,
        p: [
            [1, 8],
            [1, 0],
            [-1, 0],
            [1, -8],
            [-1, -8],
            [-1, 8],
            [0, 8],
            [0, -8]
        ]
    }
}

const setSizeTable = () => {
    const height = wrapper.clientHeight;
    const width = wrapper.clientWidth;
    const optimSize = width > height ? `${height}px` : `${width}px`
    chessTable.style.width = optimSize;
    chessTable.style.height = optimSize;
}
const setColors = () => {
    let flag = 0, currentColor = 'light';
    const colorFunc = () => {
        currentColor = currentColor === 'light' ? 'dark' : 'light';
        return currentColor;
    }
    chessSquares.forEach((i) => {
        colorFunc();
        if (flag % 8 === 0) { colorFunc() }
        i.classList.add(currentColor);
        flag++
    })
}
const setNumbers = () => {
    let number = 8, index = 0;
    const words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    chessSquares.forEach((i) => {
        i.setAttribute('data-location', `${words[index]}${number}`);
        index++;
        if (index === 8) {
            number--;
        }
        if (index === 8) {
            index = 0;
        }
        if (number !== 0) {
            arrayOfChess[`${words[index]}${number}`] = true;
        }
    })
}
const setPlayers = () => {
    let idx = 0;
    const path = [
        'img/rook.svg', 'img/horse.svg', 'img/bishop.svg', 'img/queen.svg',
        'img/king.svg', 'img/bishop.svg', 'img/horse.svg', 'img/rook.svg',
        'img/pawn.svg', 'img/pawn.svg', 'img/pawn.svg', 'img/pawn.svg',
        'img/pawn.svg', 'img/pawn.svg', 'img/pawn.svg', 'img/pawn.svg'
    ]

    for (let i = 0; i < chessSquares.length; i++) {
        if (i < path.length) {
            const character = path[i].match(/\/(.+)\./.exec(path[i])[1]);
            const src = `img/${character}-black.svg`;
            chessSquares[i].insertAdjacentHTML("afterBegin", `<img src="${src}" id="img${i}" data-character=${character} data-player="2" alt="icon" />`);
            arrayOfChess[chessSquares[i].dataset.location] = false;
        } else {
            break;
        }
    }
    path.reverse();
    for (let i = chessSquares.length - 16; i < chessSquares.length; i++) {
        if (idx < path.length) {
            const character = path[idx].match(/\/(.+)\./.exec(path[idx])[1]);
            const src = `img/${character}.svg`;
            chessSquares[i].insertAdjacentHTML("afterBegin", `<img draggable="true" src='${src}' id="img${i}" data-character=${character} data-player="1" alt="icon" />`);
            arrayOfChess[chessSquares[i].dataset.location] = false;
            idx++;
        } else {
            break;
        }
    }
}
const changeOrder = () => {
    if (orderPlayer.flag) {
        orderPlayer.order = orderPlayer.order === 1 ? 2 : 1;
        orderPlayer.flag = false;
    }
}
const getLocal = (targ) => {
    return targ.closest('.chess-square') ? targ.closest('.chess-square').dataset.location : '';
}
const delPrev = (t) => {
    for (let i = 0; i < t.length; i++) {
        if (t[i].childNodes[0]) {
            if (t[i].childNodes[0].id === target.id) {
                t[i].innerHTML = "";
                arrayOfChess[getLocal(t[i])] = true;
            }
        }
    }
    currentTarget = [];
}
const dragStart = (e) => {
    target = e.target;
    initialSquare = e.target.closest('.chess-square').dataset.location;
    if (Number(e.target.dataset.player) === orderPlayer.order) {
        showPath(e);
    }
};
const dragEnter = (e) => {
    e.preventDefault();
    if (e.target.classList.contains("eat") && getLocal(e.target) !== getLocal(target)) {
        arrayOfChess[initialSquare] = true;
        arrayOfChess[getLocal(e.target)] = false;
        eatPrompt.outer = target.outerHTML;
        if (lastTarget !== 0 && getLocal(lastTarget) !== getLocal(e.target)) {
            currentTarget.push(lastTarget);
        }
        delPrev(currentTarget);
        lastOver = lastTarget = eatPrompt.target = e.target;
        lastTargetValue = target;
        target.remove();
        changeOrder();
    } else if (getLocal(e.target) !== getLocal(target) && arrayOfChess[getLocal(e.target)]) {
        prompts.forEach((y) => {
            if (y.dataset.location === e.target.dataset.location) {
                e.target.classList.add('over');
                e.target.insertAdjacentHTML("afterBegin", target.outerHTML);
                arrayOfChess[initialSquare] = true;
                arrayOfChess[getLocal(e.target)] = false;
                lastOver = e.target;
                if (lastTarget !== 0 && getLocal(lastTarget) !== getLocal(e.target)) {
                    currentTarget.push(lastTarget);
                }
                delPrev(currentTarget);
                lastTarget = e.target;
                lastTargetValue = target;
                target.remove();
                changeOrder();
            }
        })
    }
}
const dragOver = (e) => e.preventDefault();
const dragDrop = (e) => {
    if (lastTarget && lastTarget.classList.contains("eat")) {
        if (eatPrompt.target) {
            eatPrompt.target.innerHTML = eatPrompt.outer;
        }
        if (!target.closest('.chess-square')) {
            target.remove();
        }
    }
    prompts.forEach((i) => {
        i.classList.remove('prompt');
        i.classList.remove('eat');
        i.classList.remove('can');
    })
    prompts = [];

    if (lastOver && lastOver.closest('.chess-square')) {
        lastOver.closest('.chess-square').classList.remove('over');
    }
    if (target.dataset.character === 'pawn' && !pawnsArr.includes(target.id)) {
        pawnsArr.push(target.id);
    }
}
const showPath = (e) => {
    const ways = [],
        character = chessPathes[e.target.dataset.character] || '',
        player = e.target.dataset.player,
        tget = e.target.closest('.chess-square').dataset.location,
        arr = ['A8', ...Object.keys(arrayOfChess)],
        arrPawn = [],
        arrOfChess = arr.splice(arr.length - 1, 1),
        initWord = tget ? tget.match(/\D/)[0] : '',
        idx = arr.indexOf(tget),
        order = (63 - idx) % 8;
    orderPlayer.flag = true;

    if (character.isAuto) {
        for (let i = 0; i < character.p.length; i++) {
            let inc = idx;
            for (let u = 0; u < 8; u++) {
                inc += character.p[i];
                let word = arr[inc] ? arr[inc].match(/\D/)[0] : '';

                if ((initWord === 'A' && word === 'H' && ((character.p[i] > 0 && character.p[i] > order) || (character.p[i] < 0 && character.p[i] * -1 > 7 - order))) ||
                    (initWord === 'H' && word === 'A' && ((character.p[i] > 0 && character.p[i] > order) || (character.p[i] < 0 && character.p[i] * -1 > 7 - order)))) {
                    break;
                }
                ways.push(arr[inc]);
                if (!arrayOfChess[arr[inc]]) {
                    break;
                }
                if (initWord !== 'H' && word === 'H' || initWord !== 'A' && word === 'A') {
                    break;
                }
            }
        }
    } else {
        if (character.p[0].length) {
            for (let i = 0; i < character.p.length; i++) {
                let way = idx;
                for (let f = 0; f < character.p[i].length; f++) {
                    const d = arr[character.p[i][f] + idx] ? arr[character.p[i][f] + idx].match(/\d/)[0] : '';
                    const wordInit = tget ? tget.match(/\d/)[0] : '';
                    if (f === 0 && d !== wordInit) {
                        break;
                    }
                    way += character.p[i][f];
                }
                ways.push(arr[way]);
            }
        } else {
            let reverse = 1, pawnSides = idx;
            if (player === '2') {
                reverse = -1;
            }
            for (let i = 0; i < character.p.length; i++) {
                const way = character.p[i] * reverse + idx;
                if (!arrayOfChess[arr[way]] && !character.canJump) {
                    break;
                }
                ways.push(arr[way]);
                if (i === 0 && target.dataset.character === "pawn" && pawnsArr.includes(target.id)) {
                    pawnSides = way;
                    break;
                }
                if (i === 0) {
                    pawnSides = way;
                }
            }
            if (target.dataset.character === "pawn") {
                for (let u = 0; u < character.pEat.length; u++) {
                    const way = pawnSides + character.pEat[u];
                    if (arr[way]) {
                        arrPawn.push(arr[way]);
                    }
                }
            }
        }
    }

    chessSquares.forEach((i) => {
        if (ways.indexOf(i.dataset.location) !== -1 && arrayOfChess[i.dataset.location]) {
            i.classList.add('prompt');
            prompts.push(i);
        } else if ((ways.indexOf(i.dataset.location) !== -1 || arrPawn.indexOf(i.dataset.location) !== -1) &&
            !arrayOfChess[i.dataset.location] && i.childNodes[0] && i.childNodes[0].dataset.player !== target.dataset.player) {
            i.classList.add('eat');
            prompts.push(i);
        }
    })
}

document.addEventListener('dragenter', dragEnter);
document.addEventListener('dragover', dragOver);
document.addEventListener('dragstart', dragStart);
document.addEventListener('drop', dragDrop);


setSizeTable();
setColors();
setNumbers();
setPlayers();
window.addEventListener('resize', setSizeTable)
