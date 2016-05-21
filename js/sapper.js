var c,cS, ctx, ctxS;
const MAP_SIZE = 20;
const MINES_NUMBERS = 30;
const TILE_SIZE = 30;
var map = [];
var isGameOver = true;
var score = 0;
var numberOfUncoveredCellsWitoutMines = MAP_SIZE*MAP_SIZE - MINES_NUMBERS;
var numberOfFlagsPlaced = 0;
var timer = 0;

window.onload = function(){
	c = document.getElementById('gameCanvas');
	c.setAttribute("width",MAP_SIZE*TILE_SIZE);
	c.setAttribute("height",MAP_SIZE*TILE_SIZE);
	ctx = c.getContext('2d');
	cS = document.getElementById('scoreCanvas');
	cS.setAttribute("width",MAP_SIZE*TILE_SIZE);
	cS.setAttribute("height",2*TILE_SIZE);
	ctxS = cS.getContext('2d');
	drawGrid();
	ctx.fillStyle = 'green';
	ctx.font="40px Georgia";
	ctx.fillText("Click to start",MAP_SIZE*TILE_SIZE/2-120, MAP_SIZE*TILE_SIZE/2-10);
	setInterval(drawTimer,100);
	c.addEventListener("click",function(e) {
		if(!isGameOver) drawCell((e.y - c.offsetTop)/TILE_SIZE | 0,(e.x - c.offsetLeft)/TILE_SIZE | 0);
		else restartGame();
	},false);
	c.addEventListener("contextmenu",function(e) {
		if(!isGameOver) drawFlag((e.y - c.offsetTop)/TILE_SIZE | 0,(e.x - c.offsetLeft)/TILE_SIZE | 0);
	},false);
}

function drawGrid(){
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0, MAP_SIZE * TILE_SIZE, MAP_SIZE * TILE_SIZE);
	
	ctxS.fillStyle = 'lightGray';
	ctxS.fillRect(0,0, MAP_SIZE * TILE_SIZE, 2 * TILE_SIZE);
	
	ctx.strokeStyle = 'blue';
	for(var i = 0; i<MAP_SIZE+1; i++){
		ctx.beginPath();
		ctx.moveTo(i * TILE_SIZE, 0);
		ctx.lineTo(i * TILE_SIZE, MAP_SIZE*TILE_SIZE);
		ctx.moveTo(0, i * TILE_SIZE);
		ctx.lineTo(MAP_SIZE*TILE_SIZE, i * TILE_SIZE);
		ctx.stroke();
	}
}

function drawCell(row,col,value){
	if(value == null){
		if(map[row][col] < -1)
			map[row][col] += 100
		if(map[row][col] < 100){
			map[row][col] += 100;
			numberOfUncoveredCellsWitoutMines--;
		}
		value = map[row][col] % 100;
	}
	if(value === -3){
		ctx.beginPath();
		ctx.moveTo((col + 0.3) * TILE_SIZE, (row + 0.8) * TILE_SIZE);
		ctx.lineTo((col + 0.7) * TILE_SIZE, (row + 0.8) * TILE_SIZE);
		ctx.moveTo((col + 0.5) * TILE_SIZE, (row + 0.8) * TILE_SIZE);
		ctx.lineTo((col + 0.5) * TILE_SIZE, (row + 0.2) * TILE_SIZE);
		ctx.lineTo((col + 0.85) * TILE_SIZE, (row + 0.35) * TILE_SIZE);
		ctx.lineTo((col + 0.5) * TILE_SIZE, (row + 0.5) * TILE_SIZE);
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.stroke();
	} else if(value === -2){
		drawRect(row,col,'lightGray');
	} else if(value === 99){
		drawRect(row,col,'white');
		drawCircle(ctx, (col+0.5)*TILE_SIZE,(row+0.5) * TILE_SIZE, TILE_SIZE/5, 'black');
		gameOver(false);
	} else if(value === -0){
		drawRect(row,col,'white');
		for(var deltaRow=-1;deltaRow<2;deltaRow++){
			for(var deltaCol=-1;deltaCol<2;deltaCol++){
				if(coordInRange(row+deltaRow)&&coordInRange(col+deltaCol)&&map[row+deltaRow][col+deltaCol]<100){
					drawCell(row+deltaRow, col+deltaCol);
				}
			}
		}
	} else if(value > 0 && value < 9){
		drawRect(row,col,'white');
		ctx.font="24px Georgia";
		var colors = {1: 'black', 2:'green', 3:'red',4:'blue', 5:'violet',6:'black',7:'black',8:'black'};
		ctx.fillStyle = colors[value];
		ctx.bold = true;
		ctx.fillText(value,(col + 0.4)*TILE_SIZE, (row+0.6) * TILE_SIZE);
	}
	checkWinConditions();
}

function drawFlag(row,col){
	if(map[row][col]<99){
		if(map[row][col]<-1){
			map[row][col]+=100;
			numberOfFlagsPlaced--;
			drawCell(row,col,-2);
		}else{
			map[row][col]-=100;
			numberOfFlagsPlaced++;
			drawCell(row,col,-3);
		}
	}
}

function drawRect(row,col,color){
	const PADDING = 3;
	ctx.fillStyle = color;
	ctx.fillRect(col*TILE_SIZE + PADDING,row * TILE_SIZE + PADDING, TILE_SIZE - 2*PADDING, TILE_SIZE - 2*PADDING);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initMap(){
	map = [];
	numberOfUncoveredCellsWitoutMines = MAP_SIZE*MAP_SIZE - MINES_NUMBERS;
	numberOfFlagsPlaced = 0;
	for(var i = 0; i<MAP_SIZE; i++){
		var row = [];
		for(var j = 0; j<MAP_SIZE; j++){
			row.push(0);
			drawCell(i,j,-2);
		}
		map.push(row);
	}
	placeMines();
}

function placeMines(){
	var count = 0;
	while(count < MINES_NUMBERS){
		var row = getRandomInt(0,MAP_SIZE-1);
		var col = getRandomInt(0,MAP_SIZE-1);
		if(map[row][col]>=0){
			map[row][col]=-1;
			updateNearCells(row,col);
			count++;
		}
	}
}

function updateNearCells(row, col){
	for(var deltaRow=-1;deltaRow<2;deltaRow++){
		for(var deltaCol=-1;deltaCol<2;deltaCol++){
			if(coordInRange(row+deltaRow)&&coordInRange(col+deltaCol)&&map[row+deltaRow][col+deltaCol]>=0){
				map[row+deltaRow][col+deltaCol]+=1;
			}
		}
	}
}
function coordInRange(x){
	return x>=0&&x<MAP_SIZE
}

function gameOver(win){
	ctx.font="40px Georgia";
	ctx.fillStyle = 'red';
	ctx.bold = true;
	if(win){
		ctx.fillText("YOU WIN",MAP_SIZE*TILE_SIZE/2-100, MAP_SIZE*TILE_SIZE/3+20);
		ctx.font="20px Georgia";
	}else{
		ctx.fillText("Game Over",MAP_SIZE*TILE_SIZE/2-100, MAP_SIZE*TILE_SIZE/3+20);
		ctx.font="20px Georgia";
		ctx.fillText("You lose",MAP_SIZE*TILE_SIZE/2-30, MAP_SIZE*TILE_SIZE/2-5);
	}
	ctx.fillText("Click anywhere to restart",MAP_SIZE*TILE_SIZE/2-110, MAP_SIZE*TILE_SIZE/2+30);

	isGameOver = true;
}

function restartGame(){
	timer = 0;
	isGameOver = false;
	score = 0;
	drawGrid()
	initMap();
}

function checkWinConditions(){
	if(numberOfFlagsPlaced === MINES_NUMBERS && numberOfUncoveredCellsWitoutMines === 0)
		gameOver(true);
}

function drawHorizontalPart(leftOffset, position, color){
	const RADIUS = TILE_SIZE / 10;
	var offsetTop;
	switch(position){
		case 'top':
			offsetTop = RADIUS;
			break;
		case 'middle':
			offsetTop = TILE_SIZE - RADIUS;
			break;
		case 'bottom':
			offsetTop = 2 * TILE_SIZE - RADIUS * 3;
			break;
	}
	ctxS.beginPath();
	ctxS.moveTo(leftOffset + RADIUS, RADIUS + offsetTop);
	ctxS.lineTo(leftOffset + RADIUS * 2, offsetTop);
	ctxS.lineTo(leftOffset - RADIUS * 2 + TILE_SIZE, offsetTop);
	ctxS.lineTo(leftOffset - RADIUS + TILE_SIZE, RADIUS + offsetTop);
	ctxS.lineTo(leftOffset - RADIUS * 2 + TILE_SIZE, RADIUS * 2 + offsetTop);
	ctxS.lineTo(leftOffset + RADIUS * 2 , RADIUS * 2 + offsetTop);
	ctxS.closePath();
	ctxS.fillStyle = color;
	ctxS.fill();
	ctxS.stroke();
}

function drawVerticalPart(leftOffset, position, color){
	const RADIUS = TILE_SIZE / 10;
	var offsetTop;
	switch(position){
		case 'top left':
			offsetTop = RADIUS;
			break;
		case 'top right':
			offsetTop = RADIUS;
			leftOffset += TILE_SIZE - RADIUS * 2
			break;
		case 'bottom left':
			offsetTop = TILE_SIZE - RADIUS;
			break;
		case 'bottom right':
			offsetTop = TILE_SIZE - RADIUS;
			leftOffset += TILE_SIZE - RADIUS * 2
			break;
	}
	ctxS.beginPath();
	ctxS.moveTo(leftOffset				, offsetTop 			+ RADIUS * 2);
	ctxS.lineTo(leftOffset + RADIUS		, offsetTop 			+ RADIUS);
	ctxS.lineTo(leftOffset + RADIUS * 2	, offsetTop 			+ RADIUS * 2);
	ctxS.lineTo(leftOffset + RADIUS * 2	, offsetTop + TILE_SIZE - RADIUS * 2);
	ctxS.lineTo(leftOffset + RADIUS		, offsetTop + TILE_SIZE - RADIUS);
	ctxS.lineTo(leftOffset				, offsetTop + TILE_SIZE - RADIUS * 2);
	ctxS.closePath();
	ctxS.fillStyle = color;
	ctxS.fill();
	ctxS.stroke();
}

function drawNumber(number,offsetLeft, color){
	if(number != 1 && number != 4){
		drawHorizontalPart(offsetLeft,'top', color);
	}
	if(number != 0 && number != 1 && number != 7){
		drawHorizontalPart(offsetLeft,'middle', color);
	}
	if(number != 1 && number != 4 && number != 7){
		drawHorizontalPart(offsetLeft,'bottom', color);
	}
	if(number != 1 && number != 2 && number != 3 && number != 7){
		drawVerticalPart(offsetLeft,'top left', color);
	}
	if(number != 5 && number != 6){
		drawVerticalPart(offsetLeft,'top right', color);
	}
	if(number != 1 && number != 3 && number != 4 && number != 5 && number != 7 && number != 9){
		drawVerticalPart(offsetLeft,'bottom left', color);
	}
	if(number != 2){
		drawVerticalPart(offsetLeft,'bottom right', color);
	}
}

function drawTimer(){
	if(!isGameOver){
		ctxS.fillStyle = 'lightGray';
		ctxS.fillRect(0,0, MAP_SIZE * TILE_SIZE, 2 * TILE_SIZE);
		
		timer+=1;
		const OFFSET = Math.max((MAP_SIZE / 2 - 4) * TILE_SIZE | 0,TILE_SIZE * 5 / 2);
		var minutes = timer / 600 | 0;
		var seconds = (timer % 600) / 10 | 0;
		drawNumber(minutes / 10 | 0, OFFSET, 'green');
		drawNumber(minutes % 10, OFFSET + TILE_SIZE * 3 / 2, 'green');
		drawColon(OFFSET + TILE_SIZE * 5 / 2, 'green');
		drawNumber(seconds / 10 | 0, OFFSET + TILE_SIZE * 7 / 2, 'green');
		drawNumber(seconds % 10, OFFSET + TILE_SIZE * 5, 'green');
		drawColon(OFFSET + TILE_SIZE * 6, 'green');
		drawNumber(timer % 10, OFFSET + TILE_SIZE * 7, 'green');


		drawNumber(numberOfFlagsPlaced / 10 |0, 0, 'red');
		drawNumber(numberOfFlagsPlaced % 10, TILE_SIZE * 3 / 2, 'red');
	}
}

function drawCircle(context, posX,posY,radius,color){
	context.beginPath()
	context.arc(posX, posY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = color;
	context.fill();
	context.stroke();
}

function drawColon(offsetLeft, color){
	drawCircle(ctxS, offsetLeft + TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 5, color);
	drawCircle(ctxS, offsetLeft + TILE_SIZE / 2, TILE_SIZE * 3 / 2, TILE_SIZE / 5, color);
	
}