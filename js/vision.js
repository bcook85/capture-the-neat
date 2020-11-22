const VISIONTYPES = {
	"empty": 0.0
	,"wall": 1.0
	,"ally": 0.25
	,"enemy": 0.375
	,"allyCarrier": 0.5
	,"enemyCarrier": 0.625
	,"myFlag": 0.75
	,"enemyFlag": 0.875
};

// const VISIONTYPES = {
// 	"empty": 0.0
// 	,"ally": 0.2
// 	,"allyCarrier": 0.25
// 	,"enemy": 0.4
// 	,"enemyCarrier": 0.45
// 	,"myFlag": 0.6
// 	,"enemyFlag": 0.8
// 	,"wall": 1.0
// };

// const VISIONTYPES = {
// 	"empty": 0.0
// 	,"wall": -0.25
// 	,"ally": 0.5
// 	,"enemy": -0.5
// 	,"allyCarrier": 1
// 	,"enemyCarrier": -1
// 	,"myFlag": 0.25
// 	,"enemyFlag": -0.75
// };

/*

What if you just did it like:

class Vision {
	constructor(rays) {
		...
	};
}

let visionRays = [
	[angle, length, stepSize]
	,[angle, length, stepSize]
	,[angle, length, stepSize]
];

let myVision = new Vision(visionRays);

*/

class VisionBetter {
	constructor(rays) {
		this.rays = rays;
	};
	Process(x, y, dir, grid, objects) {
		let output = [];
		for (let r = 0; r < this.rays.count; r++) {
			//grid

			//objects
		}
		return output;
	};
};


class Vision {
	constructor(fieldOfView, rayCount, maxViewDistance, stepSize) {
		this.rays = [];
		this.distance = maxViewDistance;
		this.stepSize = stepSize;
		for (let i = 0; i < rayCount; i++) {
			this.rays.push({
				"angle": (fieldOfView * -0.5) + (fieldOfView / (rayCount - 1) * i)
				,"dist": length
				,"type": 0
			});
		}
	};
	Process(grid, team, enemies, myFlag, enemyFlag, id) {
		let stepCount = this.distance / this.stepSize;
		for (let r = 0; r < this.rays.length; r++) {
			this.rays[r].dist = this.distance;
			this.rays[r].type = VISIONTYPES.empty;// empty = 0

			//Grid
			let collided = false;
			let sx = team[id].x;
			let sy = team[id].y;
			for (let s = 1; s <= stepCount; s++) {
				sx += (Math.cos(team[id].dir + this.rays[r].angle) * this.stepSize);
				sy += (Math.sin(team[id].dir + this.rays[r].angle) * this.stepSize);
				
				// Walls
				if (sx >= 0 && sy >= 0 && sx < grid.length && sy < grid[Math.floor(sx)].length) {
					if (grid[Math.floor(sx)][Math.floor(sy)] == 1) {
						collided = true;
					}
				} else {
					collided = true;
				}
				if (collided) {
					this.rays[r].dist = this.stepSize * s;
					this.rays[r].type = VISIONTYPES.wall;// wall = 1
					s = stepCount;
				}
				//My Flag
				if (myFlag.atHome == 1) {
					let dx = sx - myFlag.x;
					let dy = sy - myFlag.y;
					let dist = Math.sqrt((dx * dx) + (dy * dy));
					if (dist <= myFlag.size && dist < this.rays[r].dist) {
						this.rays[r].dist = this.stepSize * s;
						this.rays[r].type = VISIONTYPES.myFlag;
						collided = true;
					}
				}
				//Enemey Flag
				if (enemyFlag.atHome == 1) {
					let dx = sx - enemyFlag.x;
					let dy = sy - enemyFlag.y;
					let dist = Math.sqrt((dx * dx) + (dy * dy));
					if (dist <= enemyFlag.size && dist < this.rays[r].dist) {
						this.rays[r].dist = this.stepSize * s;
						this.rays[r].type = VISIONTYPES.enemyFlag;
						collided = true;
					}
				}
				//Enemies
				for (let o = 0; o < enemies.length; o++) {
					if (enemies[o].alive) {
						let dx = sx - enemies[o].x;
						let dy = sy - enemies[o].y;
						let dist = Math.sqrt((dx * dx) + (dy * dy));
						if (dist <= enemies[o].size && dist < this.rays[r].dist) {
							this.rays[r].dist = this.stepSize * s;
							if (enemies[o].hasFlag == 1) {
								this.rays[r].type = VISIONTYPES.enemyCarrier;
							} else {
								this.rays[r].type = VISIONTYPES.enemy;
							}
							collided = true;
						}
					}
				}
				//Team
				for (let o = 0; o < team.length; o++) {
					if (team[o].id != team[id].id && team[o].alive) {
						let dx = sx - team[o].x;
						let dy = sy - team[o].y;
						let dist = Math.sqrt((dx * dx) + (dy * dy));
						if (dist <= team[o].size && dist < this.rays[r].dist) {
							this.rays[r].dist = this.stepSize * s;
							if (team[o].hasFlag == 1) {
								this.rays[r].type = VISIONTYPES.allyCarrier;
							} else {
								this.rays[r].type = VISIONTYPES.ally;
							}
							collided = true;
						}
					}
				}
				if (collided) {
					s = stepCount;
				}
			}
		}
		let inputs = [];
		for (let i = 0; i < this.rays.length; i++) {
			inputs.push(this.rays[i].type);
			inputs.push(this.rays[i].dist / this.distance);
		}
		return inputs;
	}
};