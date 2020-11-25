const wrapper = document.querySelector('.wrapper'),
    chessTable = document.querySelector('.chess-table'),
    chessSquares = document.querySelectorAll('.chess-square');
let we = 0;
let arrayOfChess = {},
    orderPlayer = { order: 1, flag: false },
    target,
    lastTarget = 0,
    lastOver = 0,
    lastTargetValue = 0,
    currentTarget = [],
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
const random = (max) => {
    return Math.floor(Math.random() * max);
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
                t[i].classList.remove('over');
                arrayOfChess[getLocal(t[i])] = true;
            }
        }
    }
    currentTarget = [];
}
const clearPrompts = () => {
    prompts.forEach((i) => {
        i.classList.remove('prompt');
        i.classList.remove('eat');
        i.classList.remove('can');
    })
    prompts = [];
}
const dragStart = (e) => {
    target = e.target;
    initialSquare = e.target.closest('.chess-square').dataset.location;
    if (Number(e.target.dataset.player) === orderPlayer.order) {
        showPath(e.target);
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
        lastTarget = lastOver = eatPrompt.target = e.target;
        lastTargetValue = target;
        target.remove();
    } else if (getLocal(e.target) !== getLocal(target) && arrayOfChess[getLocal(e.target)]) {
        prompts.forEach((y) => {
            if (y.dataset.location === e.target.dataset.location) {
                e.target.classList.add('over');
                e.target.innerHTML = "";
                e.target.insertAdjacentHTML("afterBegin", target.outerHTML);
                arrayOfChess[initialSquare] = true;
                arrayOfChess[getLocal(e.target)] = false;
                if (lastOver !== 0 && getLocal(lastOver) !== getLocal(e.target)) {
                    currentTarget.push(lastOver);
                }
                delPrev(currentTarget);
                lastTarget = lastOver = e.target;
                lastTargetValue = target;
                target.remove();
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
    clearPrompts();
    if (lastOver !== 0 && lastOver.closest('.chess-square')) {
        lastOver.closest('.chess-square').classList.remove('over');
    }
    if (lastTarget !== 0 || lastTarget === e.target.closest('.chess-square')) {
        if (target.dataset.character === 'pawn' && !pawnsArr.includes(target.id)) {
            pawnsArr.push(target.id);
        }
        setTimeout(bot, 1000);
        orderPlayer.flag = true;
        changeOrder();
        lastTarget = 0;
    }
}
const showPath = (el, show = true, trget = target) => {
    const ways = [],
        character = chessPathes[el.dataset.character] || '',
        player = el.dataset.player,
        tget = el.closest('.chess-square').dataset.location,
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
                if (arr[inc]) {
                    ways.push(arr[inc]);
                }
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
                if (arr[way]) {
                    ways.push(arr[way]);
                }
            }
        } else {
            let reverse = 1, pawnSides = idx;
            if (player === '2') {
                reverse = -1;
            }
            for (let i = 0; i < character.p.length; i++) {
                const way = character.p[i] * reverse + idx;
                if (arr[way]) {
                    if (trget.dataset.character === "pawn" && !arrayOfChess[arr[way]]) {
                        break;
                    }
                    ways.push(arr[way]);
                }
                if (i === 0 && trget.dataset.character === "pawn" && pawnsArr.includes(trget.id)) {
                    pawnSides = way;
                    break;
                }
                if (i === 0) {
                    pawnSides = way;
                }
                if (!arrayOfChess[arr[way]] && !character.canJump) {
                    break;
                }
            }
            if (trget.dataset.character === "pawn") {
                if (arr[pawnSides] === trget.closest('.chess-square').dataset.location) {
                    pawnSides = pawnSides - 8 * reverse;
                }
                for (let u = 0; u < character.pEat.length; u++) {
                    const way = pawnSides + character.pEat[u] * reverse;
                    if (arr[way] && !arrayOfChess[arr[way]]) {
                        arrPawn.push(arr[way]);
                    }
                }
            }
        }
    }
    if (show) {
        chessSquares.forEach((i) => {
            if (ways.indexOf(i.dataset.location) !== -1 && arrayOfChess[i.dataset.location]) {
                i.classList.add('prompt');
                prompts.push(i);
            } else if ((ways.indexOf(i.dataset.location) !== -1 && arrPawn.indexOf(i.dataset.location) === -1) && !arrayOfChess[i.dataset.location] && i.childNodes[0] && i.childNodes[0].dataset.player !== trget.dataset.player) {
                i.classList.add('eat');
                prompts.push(i);
            } else if (arrPawn.indexOf(i.dataset.location) !== -1 && trget.dataset.character === 'pawn' && !arrayOfChess[i.dataset.location] && i.childNodes[0] && i.childNodes[0].dataset.player !== trget.dataset.player) {
                i.classList.add('eat');
                prompts.push(i);
            }
        })
    } else {
        chessSquares.forEach((i) => {
            if (!arrayOfChess[i.dataset.location] && i.childNodes[0] && i.childNodes[0].dataset.player !== "2")
                if ((ways.indexOf(i.dataset.location) !== -1 && arrPawn.indexOf(i.dataset.location) === -1)) {
                    i.classList.add('can-eat');
                } else if (arrPawn.indexOf(i.dataset.location) !== -1 && trget.dataset.character === 'pawn') {
                    i.classList.add('can-eat');
                }
        })
    }

    return [...arrPawn, ...ways];
}
const bot = () => {
    let isEnd = false, botTarget;
    const secondChessPlayer = document.querySelectorAll('img[data-player="2"]');
    const arrOfSquares = [];
    const arrOfCharacters = [];
    chessSquares.forEach((i) => {
        if (i.childNodes[0] && i.childNodes[0].dataset.player === "2" && !arrOfSquares.includes(i.childNodes[0].dataset.character)) {
            arrOfSquares.push(i.childNodes[0].dataset.character);
        }
    })
    const randWay = random(arrOfSquares.length);
    const findTargetFunc = () => {
        let chessCharacter,
            possibleMoves = [],
            possibleEat = [],
            isFound = false,
            arrPrompt = [],
            arrEat = [];

        chessSquares.forEach((i) => {
            if (i.childNodes[0] && i.childNodes[0].dataset.player === "2" && i.childNodes[0].dataset.character === arrOfSquares[randWay]) {
                possibleMoves.push(i.childNodes[0]);
            }
        })

        secondChessPlayer.forEach((el) => {
            if (el.dataset.player === "2" && el.dataset.character !== "pawn") {
                const pathes = showPath(el, false);
                for (let p = 0; p < chessSquares.length; p++) {
                    if (pathes.includes(chessSquares[p].dataset.location) && chessSquares[p].classList.contains('can-eat')) {
                        possibleEat.push(el);
                        chessSquares[p].classList.remove('can-eat');
                    }
                }
            }
        })

        if (possibleMoves.length === 0 && possibleEat.length === 0) {
            isEnd = true;
            console.log('ИГРА ОКОНЧЕНА!');
            return false;
        }

        if (possibleEat.length !== 0) {
            possibleMoves = possibleEat;
        }
        botTarget = possibleMoves[random(possibleMoves.length)];
        chessCharacter = showPath(botTarget, true, botTarget);

        chessSquares.forEach((i) => {
            if (chessCharacter.includes(i.dataset.location)) {
                if (arrayOfChess[i.dataset.location]) {
                    isFound = true;
                    arrPrompt.push(i.dataset.location);
                } else if (i.classList.contains('eat')) {
                    arrEat.push(i.dataset.location);
                }
            }
        })

        if (arrPrompt.length === 0 && arrEat.length === 0) {
            if (!isEnd) {
                bot();
            }
            return false;
        }
        const currentTarget = botTarget.closest('.chess-square');
        currentTarget.classList.add('going');

        if (arrEat.length !== 0) {
            arrPrompt = arrEat;
        }
        const randIndex = random(arrPrompt.length);
        const square = document.querySelector(`.chess-square[data-location="${arrPrompt[randIndex]}"]`);
        arrayOfChess[botTarget.closest('.chess-square').dataset.location] = true;
        arrayOfChess[arrPrompt[randIndex]] = false;
        setTimeout(() => {
            square.innerHTML = "";
            square.insertAdjacentElement("afterbegin", botTarget);
            currentTarget.classList.remove('going');
            clearPrompts();
            orderPlayer.flag = true;
            changeOrder();
        }, 1000)
    }
    if (!isEnd) {
        findTargetFunc();
    }
}

document.addEventListener('dragenter', dragEnter);
document.addEventListener('dragover', dragOver);
document.addEventListener('dragstart', dragStart);
document.addEventListener('drop', dragDrop);

setSizeTable();
setColors();
setNumbers();
setPlayers();
window.addEventListener('resize', setSizeTable);
