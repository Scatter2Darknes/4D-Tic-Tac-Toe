// 4D Tic-Tac-Toe: 3×3×3×3 fully visible
const N = 3; // per-dimension size
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const spaceEl  = document.getElementById('space');

// State: board[w][z][y][x] = 'X' | 'O' | null
let board, current, gameOver, winningLine;

init();
resetBtn.addEventListener('click', init);

function init(){
  board = [...Array(N)].map(() =>
    [...Array(N)].map(() =>
      [...Array(N)].map(() =>
        Array(N).fill(null)
      )
    )
  );
  current = 'X';
  gameOver = false;
  winningLine = null;

  renderSpace();           // build 81 buttons
  updateAllCells();        // sync UI
  setStatus(`${current}’s turn`, current);
}

function applyTheme(player) {
  document.body.classList.toggle('theme-x', player === 'X');
  document.body.classList.toggle('theme-o', player === 'O');
  
}


function setStatus(text, player){
  statusEl.textContent = text;
  statusEl.classList.toggle('x', player === 'X');
  statusEl.classList.toggle('o', player === 'O');
  if (player) applyTheme(player); 
}

// Build DOM: 3 rows (w) × 3 columns (z), each board is 3×3 (x,y)
function renderSpace(){
  spaceEl.innerHTML = '';
  for (let w = 0; w < N; w++){
    const wRow = document.createElement('div');
    wRow.className = 'w-row';
    for (let z = 0; z < N; z++){
      const boardEl = document.createElement('div');
      boardEl.className = 'board';
      boardEl.dataset.label = `w=${w}, z=${z}`;
      for (let y = 0; y < N; y++){
        for (let x = 0; x < N; x++){
          const btn = document.createElement('button');
          btn.className = 'cell';
          btn.dataset.x = x; btn.dataset.y = y; btn.dataset.z = z; btn.dataset.w = w;
          btn.ariaLabel = `Cell x${x} y${y} z${z} w${w}`;
          btn.addEventListener('click', onCellClick, { passive: true });
          boardEl.appendChild(btn);
        }
      }
      wRow.appendChild(boardEl);
    }
    spaceEl.appendChild(wRow);
  }
}

function onCellClick(e){
  if (gameOver) return;
  const btn = e.currentTarget;
  const x = +btn.dataset.x, y = +btn.dataset.y, z = +btn.dataset.z, w = +btn.dataset.w;

  if (board[w][z][y][x]) return; // occupied

  board[w][z][y][x] = current;

  const result = findWinner(board);
  if (result){
    gameOver = true;
    winningLine = result.line;  // [{x,y,z,w},... length 3]
    setStatus(`${result.winner} wins!`,null);
    applyTheme(null);
  } else if (isFull(board)) {
    gameOver = true;
    setStatus('Draw!',null);
    applyTheme(null);
  } else {
    current = current === 'X' ? 'O' : 'X';
    setStatus(`${current}’s turn`, current);
  }
  updateAllCells();
}

function updateAllCells(){
  // clear previous highlights
  document.querySelectorAll('.cell.win').forEach(el => el.classList.remove('win'));

  document.querySelectorAll('.cell').forEach(btn => {
    const x = +btn.dataset.x, y = +btn.dataset.y, z = +btn.dataset.z, w = +btn.dataset.w;
    const v = board[w][z][y][x];
    btn.textContent = v ?? '';
    btn.classList.toggle('x', v === 'X');
    btn.classList.toggle('o', v === 'O');
    btn.disabled = !!v || gameOver;
  });

  // highlight winning line
  if (winningLine){
    for (const {x,y,z,w} of winningLine){
      const sel = `.cell[data-x="${x}"][data-y="${y}"][data-z="${z}"][data-w="${w}"]`;
      const cell = document.querySelector(sel);
      if (cell) cell.classList.add('win');
    }
  }
}

// ===== Win detection (generic for N=3) =====
// Checks all 4D directions of length N starting at every non-empty cell.
function findWinner(b){
  const dirs = directions4D(); // 40 canonical directions
  for (let w=0; w<N; w++)
    for (let z=0; z<N; z++)
      for (let y=0; y<N; y++)
        for (let x=0; x<N; x++){
          const start = b[w][z][y][x];
          if (!start) continue;
          for (const [dx,dy,dz,dw] of dirs){
            const ex = x + dx*(N-1), ey = y + dy*(N-1),
                  ez = z + dz*(N-1), ew = w + dw*(N-1);
            if (!inBounds(ex,ey,ez,ew)) continue;
            let ok = true;
            const line = [];
            for (let k=0; k<N; k++){
              const xi = x + dx*k, yi = y + dy*k, zi = z + dz*k, wi = w + dw*k;
              if (b[wi][zi][yi][xi] !== start){ ok = false; break; }
              line.push({x:xi,y:yi,z:zi,w:wi});
            }
            if (ok) return { winner: start, line };
          }
        }
  return null;
}

function directions4D(){
  const out = [];
  for (let dx=-1; dx<=1; dx++)
  for (let dy=-1; dy<=1; dy++)
  for (let dz=-1; dz<=1; dz++)
  for (let dw=-1; dw<=1; dw++){
    if (dx===0 && dy===0 && dz===0 && dw===0) continue;
    const first = [dx,dy,dz,dw].find(v => v!==0);
    if (first > 0) out.push([dx,dy,dz,dw]); // canonicalize to avoid duplicates
  }
  return out; // 40 directions in 4D
}

function inBounds(x,y,z,w){
  return x>=0 && x<N && y>=0 && y<N && z>=0 && z<N && w>=0 && w<N;
}

function isFull(b){
  for (let w=0; w<N; w++)
    for (let z=0; z<N; z++)
      for (let y=0; y<N; y++)
        for (let x=0; x<N; x++)
          if (!b[w][z][y][x]) return false;
  return true;
}
