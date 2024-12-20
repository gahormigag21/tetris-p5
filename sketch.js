let canvas;
let cols = 10; // Número de columnas del tablero
let rows = 20; // Número de filas del tablero
let score = 0; // Puntaje inicial
let dificultad = 50;
let paused = false;
let grid = []; // Matriz del tablero
let currentPiece; // Pieza actual
let savedPiece = null; // Pieza guardada
let tetrominoes = []; // Lista de Tetrominos
let colors = []; 
let pieceHeld = false; // Indicador de si se ha holdeado una pieza
let piecePool = []; // Pool de piezas
let tetrisMusic;
let playButton;
let isPlaying = false;
let moveDelay = 0;
let font;


function preload() {
  // Cargar la música desde la URL
  tetrisMusic = loadSound('assets/song.mp3');
  tetrisMusic.setLoop(true); // La música se repetirá automáticamente

  font = loadFont('assets/PixelifySans-VariableFont_wght.ttf'); // Carga la fuente

}

function setup() {
  canvas = createCanvas(550, 600);  

  playButton = createButton('▶ Play Music');
  playButton.position(0 , 0);
  playButton.mousePressed(togglePlayPause); // Asociar acción al clic

  volumeSlider = createSlider(0, 1, 0.3, 0.01); // (min, max, inicial, paso)
  volumeSlider.position(0, 0);
  


  frameRate(60); // Velocidad del juego
  initGrid();
  initColors();
  initTetrominoes();
  refillPool(); // Crear y revolver el pool
  spawnPiece();

  //Letrero Hold
  push();
  fill(0);
  textSize(24);
  strokeWeight(2.5);
  
  textAlign(CENTER, CENTER);
  text('Hold', 420, 20);
  pop();

}

function draw() {

  tetrisMusic.setVolume(volumeSlider.value());

  // Fondo y otras funciones
  drawGrid();
  drawPiece();
  drawNextPiece(); // Dibujar la próxima pieza

  
  
  // Mostrar el puntaje

  
  fill(255);
  rect(340,100,165,150);
  fill(0);
  textSize(24);
  textAlign(LEFT, TOP);
  text('Puntaje: ' + score, 350, 210);
  drawHeldPiece();
  if(paused){
      
    fill(255);
    textSize(50);
    textAlign(CENTER, CENTER);
    push();
    textFont(font);
    text('Pausado', (cols*30) / 2, (rows*30) / 2);
    text('||', (cols*30) / 2, (rows*35) / 2);
    pop();
    
    if (isPlaying) {

      tetrisMusic.pause();
      
    } 

  }

  // Controlar el flujo del juego
  if (frameCount % dificultad == 0) {
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
  if (moveDelay == 0) {
      if (keyIsDown(LEFT_ARROW)) {
        movePiece(-1, 0);
        moveDelay = 5;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        movePiece(1, 0);
        moveDelay = 5;
      }
      if (keyIsDown(DOWN_ARROW)) {
        movePiece(0, 1);
        moveDelay = 8;
      }

    }else{
      moveDelay--;
    }
}

function togglePlayPause() {
  if (!isPlaying) {
    // Reproducir música por primera vez o reanudarla
    tetrisMusic.play();
    playButton.html('⏸ Pause Music'); // Cambiar el texto del botón
    isPlaying = true;
  } else if (tetrisMusic.isPlaying()) {
    // Pausar la música
    tetrisMusic.pause();
    playButton.html('▶ Resume Music'); // Cambiar el texto del botón
  } else {
    // Reanudar la música
    tetrisMusic.play();
    playButton.html('⏸ Pause Music'); // Cambiar el texto del botón
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
    '#A000F0', // Color para T
    '#F0F000', // Color para O
    '#00F100', // Color para S
    '#F00000', // Color para Z
    '#00F0F0', // Color para I
    '#F0A000', // Color para L
    '#0000F0'  // Color para J
  ];
}

function refillPool() {
  piecePool = [];
  for (let i = 0; i < 2; i++) { // Agregar dos copias de cada pieza
    for (let j = 0; j < tetrominoes.length; j++) {
      piecePool.push(j);
    }
  }
  shuffleArray(piecePool); // Revolver el pool
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function spawnPiece() {
  let index;
  if (piecePool.length == 1) {
    index = piecePool.pop();  // Tomar la última pieza del pool
    refillPool(); // Rellenar el pool si está vacío
    dificultad=dificultad-5;//aumentar dificultad
    if ((dificultad)<1) {
      dificultad=3;
    }
  }else{
    index = piecePool.pop();
  }
  
  currentPiece = {
    shape: tetrominoes[index],
    xini:floor(cols / 2) - floor(tetrominoes[index][0].length / 2),
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
  push();
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x] === 1) {
        fill(currentPiece.color);
        stroke(50);
        rect((currentPiece.x + x) * 30, (currentPiece.y + y) * 30, 30, 30);
      }
    }
  }
  pop();
}

function drawHeldPiece() {
  push();
  fill(255);
  rect(340,40,165,160);
  fill(0);
  // Si hay una pieza guardada, dibujarla en la parte superior
  if (savedPiece) {
  let offsetX = 375; // Posición horizontal del contenedor
  let offsetY = 50; // Posición vertical del contenedor

    for (let y = 0; y < savedPiece.shape.length; y++) {
      for (let x = 0; x < savedPiece.shape[y].length; x++) {
        if (savedPiece.shape[y][x] === 1) {
          fill(savedPiece.color);
          stroke(50);
          rect((offsetX + x * 30), (offsetY + y * 30)+25, 30, 30);
        }
      }
    }
  
  }
  pop();
}
function drawNextPiece() {
  if (piecePool.length > 0) {
    let nextPieceIndex = piecePool[piecePool.length - 1]; // Índice de la próxima pieza
    let nextPieceShape = tetrominoes[nextPieceIndex]; // Forma de la próxima pieza
    let nextPieceColor = colors[nextPieceIndex]; // Color de la próxima pieza

    push();
    // Dibujar el contenedor de la próxima pieza
    fill(255);
    rect(340, 270, 165, 150); // Área de vista previa
    fill(0);
    textSize(24);
    textAlign(CENTER, TOP);
    text('Next', 420, 280);


    // Dibujar la próxima pieza dentro del contenedor
    let offsetX = 375; // Posición horizontal del contenedor
    let offsetY = 300; // Posición vertical del contenedor
    for (let y = 0; y < nextPieceShape.length; y++) {
      for (let x = 0; x < nextPieceShape[y].length; x++) {
        if (nextPieceShape[y][x]) {
          fill(nextPieceColor);
          rect((offsetX + x * 30), (offsetY + y * 30)+25, 30, 30);
        }
      }
    }
    pop();
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
  if (keyCode == DOWN_ARROW) movePiece(0, 1);
  if (keyCode == UP_ARROW) rotatePiece("hor"); // Rotar pieza sentido horario
  if (key == ('z'||'Z')) rotatePiece("ant"); // Rotar pieza sentido antihorario
  if (keyCode == 32) dropPiece();// Espaciadora para bajar
  if (key == 'c' || key == 'C') holdPiece(); // Función para holdear la pieza
  if (key == 'p' || key == 'P') pausar();
  if (key == 'r' || key == 'R') resetear();
}
function pausar(){ // Presiona 'P' para pausar/reanudar
  paused = !paused; // Cambiar estado de pausa
  if (paused) {
    noLoop(); // Detener el juego
    
  } else {
    loop(); // Reanuda el dibujo
    if (isPlaying) {
      tetrisMusic.play();
    }
  }
}
function resetear(){
  loop();
  initGrid();
  currentPiece=null;
  savedPiece=null;
  dificultad =50;
  score=0;
  refillPool();
  spawnPiece();

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
      currentPiece.x=currentPiece.xini;
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
  moveDelay+=1;
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
    movePiece(0, 1); // Mover la pieza hacia abajo hasta que no pueda más
  }
  noLoop(); // Pausar
  setTimeout(() => {
    loop(); // Reanudar después de medio segundo
  }, 50);
}


function checkLines() {
  let lineasHechas=0;
  for (let y = rows - 1; y >= 0; y--) {
    if (grid[y].every(cell => cell !== 0)) {
      // Eliminar línea completa
      grid.splice(y, 1);
      // Insertar una nueva fila vacía en la parte superior
      grid.unshift(new Array(cols).fill(0));
      y++; // Revisar de nuevo la misma fila

      // Incrementar el puntaje por cada línea completada
      score += 10; // Puedes ajustar este valor según el puntaje que desees por línea completada
      lineasHechas++;

    }
  }
  if (lineasHechas !== 0) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    
    if (lineasHechas == 1) text('Nice!', (cols * 30) / 2, (rows * 30) / 2);
    if (lineasHechas == 2) {
      score+=5;
      text('Double!!', (cols * 30) / 2, (rows * 30) / 2);
    }
    if (lineasHechas == 3) {
      score+=10;
      text('Triple!!!', (cols * 30) / 2, (rows * 30) / 2);
    }
    if (lineasHechas == 4) {
      score+=20;
      text('Tetris!!!!', (cols * 30) / 2, (rows * 30) / 2);
    }
  
    noLoop(); // Pausar
    setTimeout(() => {
      loop(); // Reanudar después de .5 segundos
    }, 300);
  }
  
}


function isGameOver() {
  return grid[0].some(cell => cell !== 0);
}


