let cols = 10; // Número de columnas del tablero
let rows = 20; // Número de filas del tablero
let score = 0; // Puntaje inicial
let grid = []; // Matriz del tablero
let currentPiece; // Pieza actual
let savedPiece = null; // Pieza guardada
let tetrominoes = []; // Lista de Tetrominos
let colors = []; 
let pieceHeld = false; // Indicador de si se ha holdeado una pieza



function setup() {
  createCanvas(510, 600);
  frameRate(60); // Velocidad del juego
  initGrid();
  initColors();
  initTetrominoes();
  spawnPiece();

  //Letrero Hold
  textSize(24);
  textAlign(CENTER, CENTER);
  text('Hold', 420, 20);
}

function draw() {
  // Fondo y otras funciones
  drawGrid();
  drawPiece();

  // Mostrar el puntaje
  // fill(0);
  textSize(24);
  textAlign(LEFT, TOP);
  text('Puntaje: ' + score, 370, 210);
  drawHeldPiece();

  // Controlar el flujo del juego
  if (frameCount % 10 == 0) {
    if (isGameOver()) {
      noLoop(); // Detener el juego
      fill(255, 0, 0);
      textSize(32);
      textAlign(CENTER, CENTER);
      text('Game Over', (cols*30) / 2, (rows*30) / 2);
    } else {
      movePiece(0, 1); // Mover hacia abajo
    }
  }
}



function initGrid() {
  // Crear matriz del tablero
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = 0;
    }
  }
}

function initTetrominoes() {
  // Definir piezas (formas)
  tetrominoes = [
    [[0, 1, 0], [1, 1, 1]], // Tetromino "T"
    [[1, 1], [1, 1]],       // Tetromino "O"
    [[0, 1, 1], [1, 1, 0]], // Tetromino "S"
    [[1, 1, 0], [0, 1, 1]], // Tetromino "Z"
    [[1, 1, 1, 1]],         // Tetromino "I" 
    [[1, 0, 0], [1, 1, 1]], // Tetromino "L"
    [[0, 0, 1], [1, 1, 1]]  // Tetromino "J"
  ];
}
function initColors() {
  colors = [
    '#FF0D72', // Color para T
    '#0D73FF', // Color para O
    '#F5FF0D', // Color para S
    '#0DFF57', // Color para Z
    '#F50D0D', // Color para I
    '#FF7A0D', // Color para L
    '#0DFF9D'  // Color para J
  ];
}

function spawnPiece() {
  // Seleccionar un tetromino aleatorio
  let index = floor(random(tetrominoes.length));
  
  currentPiece = {
    shape: tetrominoes[index],
    x: floor(cols / 2) - floor(tetrominoes[index][0].length / 2), // Centrar horizontalmente
    y: 0,
    color: colors[index]
  };

  pieceHeld = false; // Permite holdear una nueva pieza después de generar una nueva
}



function drawGrid() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] == 0) {
        fill(30);  // Gris oscuro si no hay pieza
      } else {
        stroke(0,0,0,76);
        strokeWeight(5);
        fill(grid[y][x]);  // Usar el color almacenado en la celda
      }

      rect(x * 30, y * 30, 30, 30);
      strokeWeight(1);
      stroke(5);

    }
  }
}


function drawPiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x] === 1) {
        fill(currentPiece.color);
        stroke(50);
        rect((currentPiece.x + x) * 30, (currentPiece.y + y) * 30, 30, 30);
      }
    }
  }
}

function drawHeldPiece() {
  fill(255);
  rect(340,40,165,150);
  // Si hay una pieza guardada, dibujarla en la parte superior
  if (savedPiece) {
    for (let y = 0; y < savedPiece.shape.length; y++) {
      for (let x = 0; x < savedPiece.shape[y].length; x++) {
        if (savedPiece.shape[y][x] === 1) {
          fill(savedPiece.color);
          stroke(50);
          rect((x + 12) * 30, (y + 2) * 30, 30, 30); // Dibujar pieza en la parte superior
        }
      }
    }
  }
}

function movePiece(dx, dy) {
  if (!isColliding(dx, dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
  } else if (dy == 1) {
    // Si la pieza no puede bajar más, fíjala
    fixPiece();
  }
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) movePiece(-1, 0);
  if (keyCode == RIGHT_ARROW) movePiece(1, 0);
  if (keyCode == DOWN_ARROW) movePiece(0, 1);
  if (keyCode == UP_ARROW) rotatePiece("hor"); // Rotar pieza sentido horario
  if (key == ('z'||'Z')) rotatePiece("ant"); // Rotar pieza sentido antihorario
  if (keyCode == 32) dropPiece();// Espaciadora para bajar
  if (key == 'c' || key == 'C') holdPiece(); // Función para holdear la pieza
}

function holdPiece() {
  if (!pieceHeld) {
    if (savedPiece === null) {
      // Si no hay pieza guardada, guarda la pieza actual
      savedPiece = currentPiece;
      spawnPiece(); // Genera una nueva pieza
    } else {
      // Si ya hay una pieza guardada, intercambia las piezas
      let temp = currentPiece;
      currentPiece = savedPiece;
      currentPiece.y=0;
      savedPiece = temp;
    }
    pieceHeld = true; // Marca que la pieza ha sido holdeada
  }
}

function isColliding(dx, dy) {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x] === 1) {
        let newX = currentPiece.x + x + dx;
        let newY = currentPiece.y + y + dy;

        // Verificar bordes
        if (newX < 0 || newX >= cols || newY >= rows) {
          return true;
        }

        // Verificar colisión con piezas fijadas
        if (newY >= 0 && grid[newY][newX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}


function fixPiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x] == 1) {
        let boardX = currentPiece.x + x;
        let boardY = currentPiece.y + y;

        // Asegurarse de no salir del rango
        if (boardY >= 0) {
          // Fijar la celda en el tablero con el color correspondiente
          grid[boardY][boardX] = (currentPiece.color);
        }
      }
    }
  }
  // Generar una nueva pieza
  spawnPiece();
  // Revisar líneas completas
  checkLines();
}


function rotatePiece(dir) {
  let n = currentPiece.shape.length;
  let m = currentPiece.shape[0].length;
  let newShape = Array(m)
    .fill(0)
    .map(() => Array(n).fill(0));

  if(dir =="hor"){   // Transponer y rotar 90° en sentido horario
    for (let y = 0; y < n; y++) { 
      for (let x = 0; x < m; x++) {
        newShape[x][n - y - 1] = currentPiece.shape[y][x];
      }
    }
  }
  if(dir =="ant"){ // Transponer y rotar 90° en sentido antihorario
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < m; x++) {
        newShape[m - x - 1][y] = currentPiece.shape[y][x];
      }
    }
  }

  // Guardar la forma original para revertir si hay colisión
  let oldShape = currentPiece.shape;
  currentPiece.shape = newShape;

  // Verificar colisiones y ajustar
  if (isColliding(0, 0)) {
    // Intentar ajustes horizontales
    for (let offset = -1; offset <= 1; offset++) {
      if (!isColliding(offset, 0)) {
        currentPiece.x += offset;
        return;
      }
    }

    // Revertir si no se puede ajustar
    currentPiece.shape = oldShape;
  }
}

function dropPiece() {
  while (!isColliding(0, 1)) {
    movePiece(0, 1);  // Mover la pieza hacia abajo hasta que no pueda más
  }
  fixPiece();  // Fijar la pieza cuando ya no pueda bajar más
}


function checkLines() {
  for (let y = rows - 1; y >= 0; y--) {
    if (grid[y].every(cell => cell !== 0)) {
      // Eliminar línea completa
      grid.splice(y, 1);
      // Insertar una nueva fila vacía en la parte superior
      grid.unshift(new Array(cols).fill(0));
      y++; // Revisar de nuevo la misma fila

      // Incrementar el puntaje por cada línea completada
      score += 100; // Puedes ajustar este valor según el puntaje que desees por línea completada
    }
  }
}


function isGameOver() {
  return grid[0].some(cell => cell !== 0);
}


