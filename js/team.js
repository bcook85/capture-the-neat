class Team {
	constructor(x, y, pointValues, botImage, flagImage, homeImage) {
		this.homeX = x;
		this.homeY = y;
		this.captures = 0;
		this.kills = 0;
		this.botImage = botImage;
		this.flagImage = flagImage;
		this.homeImage = homeImage;
		this.botCount = 0;
		this.bots = [];
		this.group = 0;
		this.pointValues = pointValues;
		this.flag = {
			"x": this.homeX
			,"y": this.homeY
			,"atHome": 1
			,"carriedBy": -1
			,"size": 0.5
		};
		this.visionTypes = {
			"empty": 0.0
			,"ally": 0.125
			,"allyCarrier": 0.25
			,"myFlag": 0.375
			,"myHome": 0.5
			,"enemy": 0.625
			,"enemyCarrier": 0.75
			,"enemyFlag": 0.875
			,"wall": 1.0
		};
		this.rayCount = 15;
		this.rayStepSize = 0.1;
		this.maxViewDistance = 3;
		this.totalSteps = this.maxViewDistance / this.rayStepSize;
		this.fov = [];
		for (let i = 0; i < this.rayCount; i++) {
			this.fov.push((Math.PI * -0.5) + (Math.PI / (this.rayCount - 1) * i));
		}
	};
	addBot(nn) {
		let newBot = {
			"id": this.botCount
			,"alive": true
			,"hp": 3

			,"size": 0.5

			,"x": this.homeX
			,"y": this.homeY
			,"dir": Math.random() * Math.PI * 2
			,"hasFlag": 0

			,"turnSpeed": 0.5
			,"moveSpeed": 0.1//should go on team, same for all
			,"strafeSpeed": 0.05

			,"lastAttack": 0
			,"lastAttackDistance": 0

			,"visitedNodes": []

			,"nn": nn

			,"flagsCaptured": 0
			,"flagsReturned": 0
			,"kills": 0
		};
		this.bots.push(newBot);
		this.botCount += 1;
	};
	resetFlag() {
		this.flag.atHome = 1;
		this.flag.x = this.homeX;
		this.flag.y = this.homeY;
		this.flag.carriedBy = -1;
	};
	enemyTakeFlag(botID) {
		this.flag.carriedBy = botID;
		this.flag.atHome = 0;
	};
	enemyDropFlag() {
		this.flag.atHome = 0;
		this.flag.carriedBy = -1;
	};
	resetBots() {
		for (let i = 0; i < this.bots.length; i++) {
			this.bots[i].x = this.homeX;
			this.bots[i].y = this.homeY;
			this.bots[i].dir = Math.random() * Math.PI * 2;
			this.bots[i].alive = true;
			this.bots[i].hp = 3;
			this.bots[i].hasFlag = 0;
			this.bots[i].lastAttack = 0;
			this.bots[i].lastAttackDistance = 0;
			this.bots[i].visitedNodes = [];
			this.bots[i].flagsCaptured = 0;
			this.bots[i].flagsReturned = 0;
			this.bots[i].kills = 0;
		}
	};
	botTakeDamage(botID, enemyTeam) {
		this.bots[botID].hp -= 1;
		if (this.bots[botID].hp <= 0) {
			this.bots[botID].alive = false;
			if (this.bots[botID].hasFlag == 1) {
				enemyTeam.enemyDropFlag();
				this.bots[botID].hasFlag == 0;
			}
			return true;
		}
		return false;
	};
	updateBot(bot, enemyTeam, map, gameTime) {
		// Gather NN inputs
		let inputs = this.botVision(bot, enemyTeam, map);
		inputs.push(this.flag.atHome);
		inputs.push(bot.hasFlag);
		// Process inputs
		let outputs = bot.nn.processInput(this.group, inputs);
		// Bot movement
		this.botMove(
			bot
			,map
			,outputs[0] - 0.25
			,outputs[1] - 0.5
			,outputs[2] - 0.5
		);
		// Bot attack
		if (outputs[3] > 0.5) {
			this.botAttack(bot, map, enemyTeam, gameTime);
		}
		// Interact with Flags
		this.botFlagInteraction(bot, enemyTeam);
		// Exploration
		let gridX = Math.floor(bot.x);
		let gridY = Math.floor(bot.y);
		let found = false;
		for (let i = 0; i < bot.visitedNodes.length; i++) {
			if (bot.visitedNodes[i][0] == gridX && bot.visitedNodes[i][1] == gridY) {
				found = true;
				break;
			}
		}
		if (!found) {
			bot.visitedNodes.push([gridX,gridY]);
			bot.nn.brains[this.group].score += this.pointValues.explore;
		}
	};
	botVision(bot, enemyTeam, map) {
		let botInputs = [];
		for (let i = 0; i < this.rayCount; i++) {
			// Set input values
			botInputs.push({
				"dist": this.maxViewDistance
				,"type": this.visionTypes.empty
			});
			// Begin checking each ray for collision
			let collided = false;
			let sx = bot.x;
			let sy = bot.y;
			for (let s = 1; s <= this.totalSteps; s++) {
				// Step
				sx += (Math.cos(bot.dir + this.fov[i]) * this.rayStepSize);
				sy += (Math.sin(bot.dir + this.fov[i]) * this.rayStepSize);
				// Walls
				if (map.isWall(sx, sy)) {
					collided = true;
				}
				if (collided) {
					botInputs[i].dist = this.rayStepSize * s;
					botInputs[i].type = this.visionTypes.wall;
				}
				// My Flag
				if (this.flag.atHome == 0) { // only when not at home
					let dx = sx - this.flag.x;
					let dy = sy - this.flag.y;
					let dist = Math.sqrt((dx * dx) + (dy * dy));
					if (dist <= this.flag.size && dist < botInputs[i].dist) {
						botInputs[i].dist = this.rayStepSize * s;
						botInputs[i].type = this.visionTypes.myFlag;
						collided = true;
					}
				}
				// My Home
				if (bot.hasFlag == 1) { // only when I have the enemy flag
					let dx = sx - this.homeX;
					let dy = sy - this.homeY;
					let dist = Math.sqrt((dx * dx) + (dy * dy));
					if (dist <= this.flag.size && dist < botInputs[i].dist) {
						botInputs[i].dist = this.rayStepSize * s;
						botInputs[i].type = this.visionTypes.myHome;
						collided = true;
					}
				}
				// My Teammates
				for (let j = 0; j < this.bots.length; j++) {
					if (bot.id != this.bots[j].id && this.bots[j].alive) {
						let dx = sx - this.bots[j].x;
						let dy = sy - this.bots[j].y;
						let dist = Math.sqrt((dx * dx) + (dy * dy));
						if (dist <= this.bots[j].size && dist < botInputs[i].dist) {
							botInputs[i].dist = this.rayStepSize * s;
							if (this.bots[j].hasFlag == 1) {
								botInputs[i].type = this.visionTypes.allyCarrier;
							} else {
								botInputs[i].type = this.visionTypes.ally;
							}
							collided = true;
						}
					}
				}
				// Enemy Flag
				if (enemyTeam.flag.carriedBy == -1) { // only if not carried
					let dx = sx - enemyTeam.flag.x;
					let dy = sy - enemyTeam.flag.y;
					let dist = Math.sqrt((dx * dx) + (dy * dy));
					if (dist <= enemyTeam.flag.size && dist < botInputs[i].dist) {
						botInputs[i].dist = this.rayStepSize * s;
						botInputs[i].type = this.visionTypes.myFlag;
						collided = true;
					}
				}
				// Enemy bots
				for (let j = 0; j < enemyTeam.bots.length; j++) {
					if (enemyTeam.bots[j].alive) {
						let dx = sx - enemyTeam.bots[j].x;
						let dy = sy - enemyTeam.bots[j].y;
						let dist = Math.sqrt((dx * dx) + (dy * dy));
						if (dist <= enemyTeam.bots[j].size && dist < botInputs[i].dist) {
							botInputs[i].dist = this.rayStepSize * s;
							if (enemyTeam.bots[j].hasFlag == 1) {
								botInputs[i].type = this.visionTypes.enemyCarrier;
							} else {
								botInputs[i].type = this.visionTypes.enemy;
							}
							collided = true;
						}
					}
				}
				if (collided) {
					s = this.totalSteps;
				}
			}
		}
		let inputs = [];
		for (let i = 0; i < botInputs.length; i++) {
			inputs.push(botInputs[i].type);
			inputs.push(botInputs[i].dist / this.maxViewDistance);
		}
		return inputs;
	};
	botMove(bot, map, move, turn, strafe) {
		//Turn
		bot.dir += bot.turnSpeed * turn;
		bot.dir = (bot.dir + (Math.PI * 2)) % (Math.PI * 2);
		//Move
		bot.x += Math.cos(bot.dir) * bot.moveSpeed * move;
		if (map.isWall(bot.x, bot.y)) {
			bot.x -= Math.cos(bot.dir) * bot.moveSpeed * move;
		}
		bot.y += Math.sin(bot.dir) * bot.moveSpeed * move;
		if (map.isWall(bot.x, bot.y)) {
			bot.y -= Math.sin(bot.dir) * bot.moveSpeed * move;
		}
		//Strafe
		bot.x += Math.cos(bot.dir + (Math.PI * 0.5)) * bot.strafeSpeed * strafe;
		bot.y += Math.sin(bot.dir + (Math.PI * 0.5)) * bot.strafeSpeed * strafe;
		if (map.isWall(bot.x, bot.y)) {
			bot.x -= Math.cos(bot.dir + (Math.PI * 0.5)) * bot.strafeSpeed * strafe;
			bot.y -= Math.sin(bot.dir + (Math.PI * 0.5)) * bot.strafeSpeed * strafe;
		}
	};
	botAttack(bot, map, enemyTeam, gameTime) {
		if (gameTime >= bot.lastAttack + 60) {
			bot.lastAttack = gameTime;
			bot.lastAttackDistance = this.maxViewDistance;
			let sx = bot.x;
			let sy = bot.y;
			for (let s = 1; s <= this.totalSteps; s++) {
				// Step
				sx += (Math.cos(bot.dir) * this.rayStepSize);
				sy += (Math.sin(bot.dir) * this.rayStepSize);
				// Walls
				if (map.isWall(sx, sy)) {
					bot.lastAttackDistance = s * this.rayStepSize;
					return;
				}
				// My Teammates
				for (let j = 0; j < this.bots.length; j++) {
					if (bot.id != this.bots[j].id && this.bots[j].alive) {
						let dx = sx - this.bots[j].x;
						let dy = sy - this.bots[j].y;
						let dist = Math.sqrt((dx * dx) + (dy * dy));
						if (dist <= this.bots[j].size) {
							this.botTakeDamage(bot.id, enemyTeam);
							bot.lastAttackDistance = s * this.rayStepSize;
							bot.nn.brains[this.group].score += this.pointValues.hitAlly;
							return;
						}
					}
				}
				// Enemies
				for (let j = 0; j < enemyTeam.bots.length; j++) {
					if (bot.id != enemyTeam.bots[j].id && enemyTeam.bots[j].alive) {
						let dx = sx - enemyTeam.bots[j].x;
						let dy = sy - enemyTeam.bots[j].y;
						let dist = Math.sqrt((dx * dx) + (dy * dy));
						if (dist <= enemyTeam.bots[j].size) {
							let deadEnemy = enemyTeam.botTakeDamage(enemyTeam.bots[j].id, this);
							bot.nn.brains[this.group].score += this.pointValues.hitEnemy;
							if (deadEnemy) {
								bot.kills += 1;
								this.kills += 1;
								bot.nn.brains[this.group].score += this.pointValues.hitEnemy;//double points for a kill shot
							}
							bot.lastAttackDistance = s * this.rayStepSize;
							return;
						}
					}
				}
			}
		}
	};
	botFlagInteraction(bot, enemyTeam) {
		// Pick up Enemy Flag
		if (bot.hasFlag == 0 && enemyTeam.flag.carriedBy == -1) {
			let dx = enemyTeam.flag.x - bot.x;
			let dy = enemyTeam.flag.y - bot.y;
			if (Math.sqrt((dx * dx) + (dy * dy)) <= bot.size + enemyTeam.flag.size) {
				enemyTeam.enemyTakeFlag(bot.id);
				bot.hasFlag = 1;
				bot.nn.brains[this.group].score += this.pointValues.pickUpEnemyFlag;
			}
		}
		// Capture Enemy Flag
		if (bot.hasFlag == 1 && this.flag.atHome == 1) {
			let dx = this.homeX - bot.x;
			let dy = this.homeY - bot.y;
			if (Math.sqrt((dx * dx) + (dy * dy)) <= bot.size + this.flag.size) {
				enemyTeam.resetFlag();
				bot.hasFlag = 0;
				this.captures += 1;
				bot.flagsCaptured += 1;
				bot.nn.brains[this.group].score += this.pointValues.captureEnemyFlag;
			}
		}
		// Return Team Flag
		if (this.flag.atHome == 0 && this.flag.carriedBy == -1) {
			let dx = this.flag.x - bot.x;
			let dy = this.flag.y - bot.y;
			if (Math.sqrt((dx * dx) + (dy * dy)) <= bot.size + this.flag.size) {
				this.resetFlag();
				bot.flagsReturned += 1;
				bot.nn.brains[this.group].score += this.pointValues.pickUpEnemyFlag;//same value, I guess
			}
		}
	};
};