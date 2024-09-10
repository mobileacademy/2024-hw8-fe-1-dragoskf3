const difficulties = {
  easy: { size: 8, bombProbability: 0.1 },
  medium: { size: 12, bombProbability: 0.15 },
  hard: { size: 16, bombProbability: 0.2 },
};

let board = [];
let boardSize = 8;
let bombProbability = 0.1;
let maxProbability = 0.2;
document.getElementById("difficulty").addEventListener("change", function () {
  const selectedDifficulty = this.value;
  boardSize = difficulties[selectedDifficulty].size;
  bombProbability = difficulties[selectedDifficulty].bombProbability;
  document.getElementById("bombProbability").value = bombProbability;
});

document
  .getElementById("bombProbability")
  .addEventListener("input", function () {
    bombProbability = Math.min(parseFloat(this.value), maxProbability);
    this.value = bombProbability;
  });

document
  .getElementById("maxProbability")
  .addEventListener("input", function () {
    maxProbability = parseFloat(this.value);
    if (bombProbability > maxProbability) {
      bombProbability = maxProbability;
      document.getElementById("bombProbability").value = bombProbability;
    }
  });

document.getElementById("start-game").addEventListener("click", function () {
  document.getElementById("game-board").style.display = "grid";
  document.getElementById("game-over").style.display = "none";
  document.getElementById("game-win").style.display = "none";
  generateBoard();
});

function generateBoard() {
  board = [];
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`;
  gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 30px)`;

  for (let i = 0; i < boardSize; i++) {
    const row = [];
    for (let j = 0; j < boardSize; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener("click", () => {
        revealCell(i, j);
        checkWin();
      });
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(i, j);
        checkWin();
      });
      gameBoard.appendChild(cell);
      row.push({
        isBomb: Math.random() < bombProbability,
        isRevealed: false,
        isFlagged: false,
      });
    }
    board.push(row);
  }
}

function revealCell(row, col) {
  const cell = board[row][col];
  if (cell.isRevealed || cell.isFlagged) return;
  cell.isRevealed = true;

  const cellElement = document.querySelector(
    `.cell[data-row='${row}'][data-col='${col}']`
  );
  if (cell.isBomb) {
    cellElement.classList.add("bomb");
    cellElement.textContent = "💣";
    document.getElementById("game-board").style.display = "none";
    document.getElementById("game-over").style.display = "flex";
  } else {
    cellElement.classList.add("revealed");
    const adjacentBombs = countAdjacentBombs(row, col);
    if (adjacentBombs > 0) {
      cellElement.textContent = adjacentBombs;
    } else {
      revealAdjacentCells(row, col);
    }
  }
}

function revealAdjacentCells(row, col) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (
        newRow >= 0 &&
        newRow < boardSize &&
        newCol >= 0 &&
        newCol < boardSize &&
        !(i === 0 && j === 0)
      ) {
        const adjacentCell = board[newRow][newCol];
        if (!adjacentCell.isRevealed && !adjacentCell.isFlagged) {
          revealCell(newRow, newCol);
        }
      }
    }
  }
}

function toggleFlag(row, col) {
  const cell = board[row][col];
  if (cell.isRevealed) return;
  const cellElement = document.querySelector(
    `.cell[data-row='${row}'][data-col='${col}']`
  );
  cell.isFlagged = !cell.isFlagged;
  cellElement.textContent = cell.isFlagged ? "🚩" : "";
}

function countAdjacentBombs(row, col) {
  let bombCount = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (
        newRow >= 0 &&
        newRow < boardSize &&
        newCol >= 0 &&
        newCol < boardSize
      ) {
        if (board[newRow][newCol].isBomb) {
          bombCount++;
        }
      }
    }
  }
  return bombCount;
}

function checkWin() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = board[i][j];
      if (!cell.isBomb && !cell.isRevealed) {
        return;
      }
    }
  }
  document.getElementById("game-win").style.display = "flex";
  document.getElementById("game-board").style.display = "none";
}
