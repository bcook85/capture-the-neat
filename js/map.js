class Map {
	constructor() {
		this.tileSize = 32;
		this.width = 13;
		this.height = 9;
		this.grid = [];
		this.redX = 1;
		this.redY = 4;
		this.blueX = 11;
		this.blueY = 4;
		for (let x = 0; x < this.width; x++) {
			let col = [];
			for (let y = 0; y < this.height; y++) {
				col.push(0);
			}
			this.grid.push(col);
		}
		// The "Default Map"
		this.grid[4][0] = 1;
		this.grid[4][3] = 1;
		this.grid[4][4] = 1;
		this.grid[4][5] = 1;
		this.grid[4][8] = 1;

		this.grid[8][0] = 1;
		this.grid[8][3] = 1;
		this.grid[8][4] = 1;
		this.grid[8][5] = 1;
		this.grid[8][8] = 1;

		this.grid[6][1] = 1;
		this.grid[6][2] = 1;
		this.grid[6][6] = 1;
		this.grid[6][7] = 1;

		this.grid[1][2] = 1;
		this.grid[1][6] = 1;

		this.grid[11][2] = 1;
		this.grid[11][6] = 1;
	};
	isWall(x, y) {
		let nx = Math.floor(x);
		let ny = Math.floor(y);
		if (nx >= 0 && ny >= 0 && nx < this.width && ny < this.height) {
			return this.grid[nx][ny] === 1;
		}
		return true;// return true if out of bounds
	};
	getTile(x, y) {
		let nx = Math.floor(x);
		let ny = Math.floor(y);
		if (nx >= 0 && ny >= 0 && nx < this.width && ny < this.height) {
			return this.grid[nx][ny];
		}
		return 1;// return 'wall' if out of bounds
	};
};