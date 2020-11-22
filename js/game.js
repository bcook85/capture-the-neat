/******************************************************************************
UI
******************************************************************************/

// Tab UI
function selectTab(tab) {
	let tabs = document.getElementsByClassName("tab");
	for (let i = 0; i < tabs.length; i++) {
		tabs[i].style.display = "none";
	}
	document.getElementById(tab).style.display = "block";
}

// Game UI
let gameScreen = document.getElementById("GameScreen");
let speedSelect = document.getElementById("SpeedSelect");
speedSelect.onchange = function() {
	gameSpeed = parseInt(speedSelect.options[speedSelect.selectedIndex].value);
}
let optionsMenu = document.getElementById("OptionsMenu");
let roundsPerGenerationInput =
	document.getElementById("RoundsPerGenerationInput");
let roundTimeInput = document.getElementById("RoundTimeInput");
let botsPerTeamInput = document.getElementById("BotsPerTeamInput");
let startButton = document.getElementById("StartButton");
function resetGameOptions() {
	roundsPerGenerationInput.value = "25";
	roundTimeInput.value = "30";
	botsPerTeamInput.value = "5";
}

// Display UI
let generationDisplay = document.getElementById("GenerationDisplay");
let groupDisplay = document.getElementById("GroupDisplay");
let timerDisplay = document.getElementById("TimerDisplay");
let redCapturesDisplay = document.getElementById("RedCapturesDisplay");
let redKillsDisplay = document.getElementById("RedKillsDisplay");
let blueCapturesDisplay = document.getElementById("BlueCapturesDisplay");
let blueKillsDisplay = document.getElementById("BlueKillsDisplay");

// Red Team UI
let redBrainDimensionsInput =
	document.getElementById("RedBrainDimensionsInput");
let redMutationRateInput = document.getElementById("RedMutationRateInput");
let redMutationAmountInput = document.getElementById("RedMutationAmountInput");
let redPickUpEnemyFlagInput =
	document.getElementById("RedPickUpEnemyFlagInput");
let redCaptureEnemyFlagInput =
	document.getElementById("RedCaptureEnemyFlagInput");
let redHitEnemyInput = document.getElementById("RedHitEnemyInput");
let redHitAllyInput = document.getElementById("RedHitAllyInput");
let redExploreInput = document.getElementById("RedExploreInput");
function resetRedOptions() {
	redBrainDimensionsInput.value = "12";
	redMutationRateInput.value = "0.005";
	redMutationAmountInput.value = "0.001";
	redPickUpEnemyFlagInput.value = "50";
	redCaptureEnemyFlagInput.value = "150";
	redHitEnemyInput.value = "15";
	redHitAllyInput.value = "-5";
	redExploreInput.value = "0.25";
}

// Blue Team UI
let blueBrainDimensionsInput =
	document.getElementById("BlueBrainDimensionsInput");
let blueMutationRateInput = document.getElementById("BlueMutationRateInput");
let blueMutationAmountInput =
	document.getElementById("BlueMutationAmountInput");
let bluePickUpEnemyFlagInput =
	document.getElementById("BluePickUpEnemyFlagInput");
let blueCaptureEnemyFlagInput =
	document.getElementById("BlueCaptureEnemyFlagInput");
let blueHitEnemyInput = document.getElementById("BlueHitEnemyInput");
let blueHitAllyInput = document.getElementById("BlueHitAllyInput");
let blueExploreInput = document.getElementById("BlueExploreInput");
function resetBlueOptions() {
	blueBrainDimensionsInput.value = "12";
	blueMutationRateInput.value = "0.005";
	blueMutationAmountInput.value = "0.001";
	bluePickUpEnemyFlagInput.value = "50";
	blueCaptureEnemyFlagInput.value = "150";
	blueHitEnemyInput.value = "15";
	blueHitAllyInput.value = "-5";
	blueExploreInput.value = "0.25";
}

// Map UI
function resetMapOptions() {
	//stuff
}

// Game UI
let canvas = document.getElementById("screen");

function startSimulation() {
	// Game
	maxRoundTime = parseInt(roundTimeInput.value) * 60;//60 frames per second
	
	// Map
	initializeMap();

	// Create Bots
	initializeBots();

	// Initialize Screen
	optionsMenu.className = 'hide';
	gameScreen.className = "";
	screen = new Screen(
		canvas
		,map.width * map.tileSize
		,map.height * map.tileSize
	);

	// Start Update Loop
	gameLoop.start();
};

/******************************************************************************
Initialization
******************************************************************************/

// Game/Engine
let screen = 0;
let imageContainer = new ImageContainer();
let loadLoop = new Loop(loadUpate);
let gameLoop = new Loop(gameUpdate);
let roundTime = 0;
let maxRoundTime = 0;
let gameSpeed = 1;

// Images
let redBotImage = imageContainer.load("images/red_bot.png", 32, 32);
let blueBotImage = imageContainer.load("images/blue_bot.png", 32, 32);
let redFlagImage = imageContainer.load("images/red_flag.png", 32, 32);
let blueFlagImage = imageContainer.load("images/blue_flag.png", 32, 32);
let wallImage = imageContainer.load("images/wall.png", 32, 32);
let floorImage = imageContainer.load("images/floor.png", 32, 32);
let redHomeImage = imageContainer.load("images/red_home.png", 32, 32);
let blueHomeImage = imageContainer.load("images/blue_home.png", 32, 32);
let mapImage = document.createElement("canvas");

// Map
let map = new Map();

function initializeMap() {
	// Create single map image
	mapImage.width = map.width * map.tileSize;
	mapImage.height = map.height * map.tileSize;
	let ctx = mapImage.getContext("2d");
	let imageToDraw = wallImage;
	for (let x = 0; x < map.width; x++) {
		for (let y = 0; y < map.height; y++) {
			if (map.grid[x][y] == 1) {
				imageToDraw = wallImage;
			} else {
				imageToDraw = floorImage;
			}
			ctx.drawImage(
				imageContainer.images[imageToDraw]
				,0
				,0
				,imageContainer.images[imageToDraw].width
				,imageContainer.images[imageToDraw].height
				,x * map.tileSize
				,y * map.tileSize
				,map.tileSize
				,map.tileSize
			);
		}
	}
}

// Teams & Bots
let botCount = 0;
let brainCount = 0;
let currentGroup = 0;
let currentGeneration = 1;
let redTeam = undefined;
let blueTeam = undefined;

function initializeBots() {
	// Red Points
	let redPoints = {
		"pickUpEnemyFlag": parseInt(redPickUpEnemyFlagInput.value)
		,"captureEnemyFlag": parseInt(redCaptureEnemyFlagInput.value)
		,"hitEnemy": parseInt(redHitEnemyInput.value)
		,"hitAlly": parseInt(redHitAllyInput.value)
		,"explore": parseFloat(redExploreInput.value)
	};
	// Blue Points
	let bluePoints = {
		"pickUpEnemyFlag": parseInt(bluePickUpEnemyFlagInput.value)
		,"captureEnemyFlag": parseInt(blueCaptureEnemyFlagInput.value)
		,"hitEnemy": parseInt(blueHitEnemyInput.value)
		,"hitAlly": parseInt(blueHitAllyInput.value)
		,"explore": parseFloat(blueExploreInput.value)
	};

	redTeam = new Team(
		map.redX + 0.5
		,map.redY + 0.5
		,redPoints
		,redBotImage
		,redFlagImage
		,redHomeImage
	);

	blueTeam = new Team(
		map.blueX + 0.5
		,map.blueY + 0.5
		,bluePoints
		,blueBotImage
		,blueFlagImage
		,blueHomeImage
	);

	// Red Neat
	let redDimensions = [32];
	let redHiddenLayers = redBrainDimensionsInput.value.trim().split(",");
	for (let i = 0; i < redHiddenLayers.length; i++) {
		redDimensions.push(parseInt(redHiddenLayers[i]));
	}
	redDimensions.push(4);

	// Blue Neat
	let blueDimensions = [32];
	let blueHiddenLayers = blueBrainDimensionsInput.value.trim().split(",");
	for (let i = 0; i < blueHiddenLayers.length; i++) {
		blueDimensions.push(parseInt(blueHiddenLayers[i]));
	}
	blueDimensions.push(4);

	// Create Bots
	botCount = parseInt(botsPerTeamInput.value);
	brainCount = parseInt(roundsPerGenerationInput.value);
	for (let i = 0; i < botCount; i++) {
		redTeam.addBot(new Neat(
			brainCount
			,redDimensions
			,parseFloat(redMutationRateInput.value)
			,parseFloat(redMutationAmountInput.value)
		));

		blueTeam.addBot(new Neat(
			brainCount
			,blueDimensions
			,parseFloat(blueMutationRateInput.value)
			,parseFloat(blueMutationAmountInput.value)
		));
	}
}

/******************************************************************************
Load Content
******************************************************************************/

function loadUpate() {
	if (imageContainer.isLoaded()) {
		loadLoop.stop();
		startButton.className = 'startButton';
	}
}
loadLoop.start();

/******************************************************************************
Game Update Loop
******************************************************************************/

function drawMap() {
	screen.drawImage(
		mapImage
		,0
		,0
		,mapImage.width
		,mapImage.height
		,0
		,0
		,screen.width
		,screen.height
	);
}

function drawBots(team) {
	for (let i = 0; i < team.bots.length; i++) {
		if (team.bots[i].alive) {
			// Shot
			if (roundTime <= team.bots[i].lastAttack + 2) {//show for 2 frames
				screen.ctx.strokeStyle = "green";
				screen.ctx.lineWidth = 5;
				let x = team.bots[i].x + (Math.cos(team.bots[i].dir) * team.bots[i].lastAttackDistance);
				let y = team.bots[i].y + (Math.sin(team.bots[i].dir) * team.bots[i].lastAttackDistance);
				screen.ctx.beginPath();
				screen.ctx.moveTo(Math.floor(team.bots[i].x * map.tileSize), Math.floor(team.bots[i].y * map.tileSize));
				screen.ctx.lineTo(Math.floor(x * map.tileSize), Math.floor(y * map.tileSize));
				screen.ctx.stroke();
			}

			// Bot Image
			screen.ctx.save();
			screen.ctx.translate(
				Math.floor(team.bots[i].x * map.tileSize)
				,Math.floor(team.bots[i].y * map.tileSize)
			);
			screen.ctx.rotate(team.bots[i].dir + (Math.PI * 0.5));
			screen.ctx.translate(
				Math.floor(-team.bots[i].x * map.tileSize)
				,Math.floor(-team.bots[i].y * map.tileSize)
			);
			screen.drawImage(
				imageContainer.images[team.botImage]
				,0
				,0
				,imageContainer.images[team.botImage].width
				,imageContainer.images[team.botImage].height
				,Math.floor((team.bots[i].x * map.tileSize) -
					(imageContainer.images[team.botImage].width * 0.5))
				,Math.floor((team.bots[i].y * map.tileSize) -
					(imageContainer.images[team.botImage].height * 0.5))
				,imageContainer.images[team.botImage].width
				,imageContainer.images[team.botImage].height
			);
			screen.ctx.restore();

			// Bot ID
			screen.ctx.font = "20px monospace";
			screen.ctx.textAlign = "center";
			screen.ctx.fillStyle = "white";
			screen.ctx.fillText(team.bots[i].id + 1, Math.floor(team.bots[i].x * map.tileSize), Math.floor((team.bots[i].y * map.tileSize) + 6));
		}
	}
}

function drawFlag(team) {
	screen.drawImage(
		imageContainer.images[team.flagImage]
		,0
		,0
		,imageContainer.images[team.flagImage].width
		,imageContainer.images[team.flagImage].height
		,Math.floor((team.flag.x * map.tileSize) -
			(imageContainer.images[team.flagImage].width * 0.5))
		,Math.floor((team.flag.y * map.tileSize) -
			(imageContainer.images[team.flagImage].height * 0.5))
		,imageContainer.images[team.flagImage].width
		,imageContainer.images[team.flagImage].height
	);
}

function drawHome(team) {
	screen.drawImage(
		imageContainer.images[team.homeImage]
		,0
		,0
		,imageContainer.images[team.homeImage].width
		,imageContainer.images[team.homeImage].height
		,Math.floor((team.homeX * map.tileSize) -
			(imageContainer.images[team.homeImage].width * 0.5))
		,Math.floor((team.homeY * map.tileSize) -
			(imageContainer.images[team.homeImage].height * 0.5))
		,imageContainer.images[team.homeImage].width
		,imageContainer.images[team.homeImage].height
	);
}

function drawUI() {
	// FPS
	screen.drawText(
		`${gameLoop.fps}fps`
		,0
		,screen.height
		,"12px monospace"
		,"left"
		,"red"
	);
	generationDisplay.innerHTML = currentGeneration;
	groupDisplay.innerHTML = `${currentGroup + 1}/${brainCount}`;
	timerDisplay.innerHTML = `${Math.floor(roundTime / 60)}/${Math.floor(maxRoundTime / 60)}`;
	redCapturesDisplay.innerHTML = redTeam.captures;
	redKillsDisplay.innerHTML = redTeam.kills;
	blueCapturesDisplay.innerHTML = blueTeam.captures;
	blueKillsDisplay.innerHTML = blueTeam.kills;
}

function updateTeam(team, enemyTeam) {
	for (let i = 0; i < team.bots.length; i++) {
		if (team.bots[i].alive) {
			team.updateBot(team.bots[i], enemyTeam, map, roundTime);
		}
	}
}

function updateFlag(team, enemyTeam) {
	if (team.flag.carriedBy != -1 && enemyTeam.bots[team.flag.carriedBy].alive) {
		team.flag.x = enemyTeam.bots[team.flag.carriedBy].x;
		team.flag.y = enemyTeam.bots[team.flag.carriedBy].y;
	}
}

function nextWave() {
	currentGroup += 1;
	if (currentGroup >= brainCount) {
		currentGroup = 0;
		currentGeneration += 1;
		for (let i = 0; i < botCount; i++) {
			redTeam.bots[i].neat.nextGeneration();
			blueTeam.bots[i].neat.nextGeneration();
		}
	}
	redTeam.resetFlag();
	redTeam.resetBots();
	blueTeam.resetFlag();
	blueTeam.resetBots();
	redTeam.group = currentGroup;
	blueTeam.group = currentGroup;
}

function gameUpdate() {
	for (let i = 0; i < gameSpeed; i++) {
		roundTime += 1;
		//Update
		updateTeam(redTeam, blueTeam);
		updateTeam(blueTeam, redTeam);
		updateFlag(redTeam, blueTeam);
		updateFlag(blueTeam, redTeam);

		if (roundTime >= maxRoundTime) {
			roundTime = 0;
			nextWave();
		}
	}

	//Draw
	drawMap();
	drawHome(redTeam);
	drawHome(blueTeam);
	drawBots(redTeam);
	drawBots(blueTeam);
	drawFlag(redTeam);
	drawFlag(blueTeam);
	drawUI();
}