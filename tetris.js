const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');

//zoom in / scale
context.scale(20, 20);




//T shape tetris piece in a form of matrix
//[0,0,0] included to make shape into square for better rotation of shape
const matrix = [
  [0,0,0],
  [1,1,1],
  [0,1,0]
];

const colors = [
  null,
  'red',
  'blue',
  'yellow',
  'violet',
  'green',
  'purple',
  'pink'
];

let tetrisPieces = (type) => {
  if (type === 'T') {
    return [
      [0,0,0],
      [1,1,1],
      [0,1,0]
    ];
  } else if (type === 'O') {
    return [
      [2,2],
      [2,2]
    ];
  } else if (type === 'L') {
    return [
      [0,3,0],
      [0,3,0],
      [0,3,3]
    ];
  } else if (type === 'J') {
    return [
      [0,4,0],
      [0,4,0],
      [4,4,0]
    ];
  } else if (type === 'I') {
    return [
      [0,5,0,0],
      [0,5,0,0],
      [0,5,0,0],
      [0,5,0,0]
    ];
  } else if (type === 'S') {
    return [
      [0,6,6],
      [6,6,0],
      [0,0,0]
    ];
  } else if (type === 'Z') {
    return [
      [7,7,0],
      [0,7,7],
      [0,0,0]
    ];
  }
};

//matrix for stuck pieces
let createMatrix = (width, height) => {
  const matrix = [];
  // while h is not zero we decrease by one
  while (height--) {
    matrix.push(new Array(width).fill(0));
  }
  return matrix;
};



const arena = createMatrix(12, 20);
console.table(arena);



let draw = () => {
  // this will clear the canvas each time so only one tetris piece shows up
  context.fillStyle = 'black';
  context.fillRect(0,0,canvas.width,canvas.height);
  drawTetrisPiece(player.matrix, player.position);
  //draw arena so that stuck pieces display
  //this function simply takes a matrix and an offset
  //then returns red if value in matrix is one and nothing if 0
  drawTetrisPiece(arena, {x: 0, y: 0});
};

let drawTetrisPiece = (matrix, offset) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(
          x + offset.x,
          y + offset.y,
          1, 1);
      }
    });
  });
};



let winningRowSweep = () => {
  let rowCounter = 1;
  outer: for (y = arena.length - 1; y > 0; --y) {
    for (x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    //if we didnt find any open spots in row
    //then fill out the full row with 0s
    //then put that row (unshift) to the top of arena
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += rowCounter * 10;
    rowCounter += 1;
  }
};


//stick player tetris piece into arena at correct position
let merge = (arena, player) => {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.position.y][x + player.position.x] = value;
      }
    });
  });
};

//if there is a collision return true, else return false
let collide = (arena, player) => {
  const [mtrx, ofst] = [player.matrix, player.position];
  for (y = 0; y < mtrx.length; ++y) {
    for (x = 0; x < mtrx[y].length; ++x) {
      if (mtrx[y][x] !== 0 &&
        (arena[y + ofst.y] && arena[y + ofst.y][x + ofst.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
};

let playerDrop = () => {
  player.position.y++;
  if (collide(arena, player)) {
    //if collision, move player back up one
    player.position.y--;
    //then copy (merge) tetris piece onto arena
    merge(arena, player);
    //then finally restart the player from the top again
    playerReset();
    winningRowSweep();
    updateScore();
  }
  dropCounter = 0;
};

let playerMove = (direction) => {
  player.position.x += direction;
  if (collide(arena, player)) {
    player.position.x -= direction;
  }
};

//to rotate a matrix there are two steps
// 1 is to transpose --> turn each row into column
// then you have to reverse each row
// example:
// 1, 2, 3
// 4, 5, 6
// 7, 8, 9
// transpose =
// 1, 4, 7
// 2, 5, 8
// 3, 6, 9
// then reverse =
// 7, 4, 1
// 8, 5, 2
// 9, 6, 3
let rotate = (matrix, direction) => {
  for (y = 0; y < matrix.length; ++y) {
    for (x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x]
      ] = [
        matrix[y][x],
        matrix[x][y]
      ];
    }
  }

  if (direction > 0) {
    matrix.reverse();
  }
};


let playerRotate = (direction) => {
  const position = player.position.x;
  let offset = 1;
  rotate(player.matrix, direction);
  while (collide(arena, player)) {
    player.position.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(plater.matrix, -direction);
      player.position.x = position;
      return;
    }
  }
};

let dropCounter = 0;
let dropInterval = 1000;
// time expressed in milliseconds

let lastTime = 0;
let update = (time = 0) => {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
};

// console.log(arena); console.table(arena);

let randomTetrisPiece = () => {
  const letterPieces = 'ILJOTSZ';
  player.matrix = tetrisPieces(letterPieces[Math.floor(letterPieces.length * Math.random())])
};

let playerReset = () => {
  randomTetrisPiece();
  player.position.y = 0;
  player.position.x = (Math.floor(arena[0].length / 2)) -
                      (Math.floor(player.matrix[0].length / 2));
  if (collide(arena, player)) {
    //if player hits top
    //remove everything from arena because its game over
    alert(`Game over! your total score is ${player.score}`);
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
};


let updateScore = () => {
  document.querySelector('#score').innerText = "Score = " + player.score;
};

const player = {
  position: {x: 0, y: 0},
  matrix: null,
  score: 0
}

//keyboard movement of player
document.addEventListener('keydown', event => {
  // console.log(event); outputs data on the event that happened which is you clicking (even gives you which key you pressed)
  if (event.keyCode === 37) {
    playerMove(-1);
  } else if (event.keyCode === 39) {
    playerMove(1);
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 38) {
    playerRotate(1);
  }
});

playerReset();
updateScore();
update();
