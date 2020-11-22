class Neat {
	constructor(populationCount, dimensions, mutationChance, mutationAmount) {
		this.popCap = populationCount;
		this.dimensions = dimensions;
		this.brains = [];

		this.generation = 1;
		this.startScore = 100;
		this.mutationChance = mutationChance;
		this.mutationChanceCritical = this.mutationChance * 0.01;
		this.mutationAmount = mutationAmount;

		for (let i = 0; i < this.popCap; i++) {
			this.brains.push(this.createBrain());
		}
	};
	calculateFitness() {
		let sum = 0;
		for (let i = 0; i < this.brains.length; i++) {
			if (typeof this.brains[i].score !== "number" || this.brains[i].score < 1) {
				this.brains[i].score = 1;
			}
			sum += this.brains[i].score;
		}
		for (let i = 0; i < this.brains.length; i++) {
			this.brains[i].fitness = this.brains[i].score / sum;
		}
	};
	pickOne() {
		let index = 0;
		let r = Math.random();
		while (r > 0) {
			if (index >= this.brains.length) {
				console.error("Population.pickOne() is out of bounds!");
				return Math.floor(Math.random() * this.brains.length);
			} else {
				r = r - this.brains[index].fitness;
				index += 1;
			}
		}
		index -= 1;
		return index;
	};
	nextGeneration() {
		this.generation += 1;
		this.calculateFitness();
		let newBrains = [];
		for (let i = 0; i < this.brains.length; i++) {
			let first = this.pickOne(this.brains);
			let second = first;
			while (second == first) {
				second = this.pickOne(this.brains);
			}
			let newBrain = this.crossover(this.brains[first], this.brains[second]);
			this.mutate(newBrain);
			newBrains.push(newBrain);
		}
		this.brains = [];
		this.brains = newBrains;
	};
	crossover(brain1, brain2) {
		let newBrain = this.createBrain();
		for (let i = 0; i < newBrain.layers.length; i++) {
			//weights
			for (let y = 0; y < newBrain.layers[i].weights.rows; y++) {
				for (let x = 0; x < newBrain.layers[i].weights.cols; x++) {
					if (Math.floor(Math.random() * 2) == 1) {
						newBrain.layers[i].weights.data[y][x] = brain1.layers[i].weights.data[y][x];
					} else {
						newBrain.layers[i].weights.data[y][x] = brain2.layers[i].weights.data[y][x];
					}
				}
			}
			//bias
			for (let y = 0; y < newBrain.layers[i].bias.rows; y++) {
				for (let x = 0; x < newBrain.layers[i].bias.cols; x++) {
					if (Math.floor(Math.random() * 2) == 1) {
						newBrain.layers[i].bias.data[y][x] = brain1.layers[i].bias.data[y][x];
					} else {
						newBrain.layers[i].bias.data[y][x] = brain2.layers[i].bias.data[y][x];
					}
				}
			}
		}
		return newBrain;
	};
	mutate(brain) {
		for (let i = 0; i < brain.layers.length; i++) {
			this.mutateLayer(brain.layers[i].weights);
			this.mutateLayer(brain.layers[i].bias);
		}
	};
	mutateLayer(layer) {
		for (let y = 0; y < layer.rows; y++) {
			for (let x = 0; x < layer.cols; x++) {
				if (Math.random() < this.mutationChanceCritical) {
					layer.data[y][x] = (Math.random() * 2) - 1;//full mutation
				} else if (Math.random() <= this.mutationChance) {
					layer.data[y][x] += Math.random() * this.mutationAmount * Math.random() > 0.5 ? 1 : -1;
					if (layer.data[y][x] < -1) {
						layer.data[y][x] = -1;
					} else if (layer.data[y][x] > 1) {
						layer.data[y][x] = 1;
					}
				}
			}
		}
	};
	/***************************************
	Brain
	***************************************/
	createBrain() {
		let newBrain = {
			"layers": []
			,"score": this.startScore
			,"fitness": 0
		};
		for (let i = 1; i < this.dimensions.length; i++) {
			newBrain.layers.push({
				"weights": Neat.createMatrix(this.dimensions[i], this.dimensions[i - 1])
				,"bias": Neat.createMatrix(this.dimensions[i], 1)
			});
		}
		return newBrain;
	};
	processInput(brainID, inputArray) {
		let actionMaxtrix = Neat.matrixFromArray(inputArray);
		for (let i = 0; i < this.brains[brainID].layers.length; i++) {
			let currentLayer = Neat.matrixProduct(this.brains[brainID].layers[i].weights, actionMaxtrix);
			currentLayer = Neat.matrixAdd(currentLayer, this.brains[brainID].layers[i].bias);
			if (i < this.brains[brainID].layers.length - 1) {
				currentLayer = Neat.matrixMap(currentLayer, Neat.rectifiedLinear);
			} else {
				currentLayer = Neat.matrixMap(currentLayer, Neat.sigmoid);
			}
			actionMaxtrix = currentLayer;
		}
		return Neat.matrixToArray(actionMaxtrix);
	};
	/***************************************
	Activation Functions
	***************************************/
	static sigmoid(x) {
		return 1 / (1 + Math.exp(-x));
	};
	static capAtOne(x) {
		return x > 1 ? 1 : x;
	};
	static rectifiedLinear(x) {
		return x <= 0 ? 0 : x;
	};
	static rectifiedLinear6(x) {
		if (x < 0) {
			x = 0;
		} else if (x > 6) {
			x = 6;
		}
		return x;
	};
	/***************************************
	Matrix
	***************************************/
	static createMatrix(rows, cols) {
		let newMatrix = {
			"rows": rows
			,"cols": cols
			,"data": []
		};
		for (let y = 0; y < rows; y++) {
			let row = [];
			for (let x = 0; x < cols; x++) {
				row.push((Math.random() * 2) - 1);
			}
			newMatrix.data.push(row);
		}
		return newMatrix;
	};
	static matrixAdd(m1, m2) {
		let newMatrix = Neat.createMatrix(m1.rows, m1.cols);
		for (let y = 0; y < m1.rows; y++) {
			for (let x = 0; x < m1.cols; x++) {
				newMatrix.data[y][x] = m1.data[y][x] + m2.data[y][x];
			}
		}
		return newMatrix;
	};
	static matrixMap(matrix, fn) {
		let newMatrix = Neat.matrixCopy(matrix);
		for (let y = 0; y < newMatrix.rows; y++) {
			for (let x = 0; x < newMatrix.cols; x++) {
				newMatrix.data[y][x] = fn(newMatrix.data[y][x]);
			}
		}
		return newMatrix;
	};
	static matrixProduct(m1, m2) {
		//Assumes m1.cols === m2.rows
		let result = Neat.createMatrix(m1.rows, m2.cols);
		for (let y = 0; y < result.rows; y++) {
			for (let x = 0; x < result.cols; x++) {
				let sum = 0;
				for (let z = 0; z < m1.cols; z++) {
					sum += m1.data[y][z] * m2.data[z][x];
				}
				result.data[y][x] = sum;
			}
		}
		return result;
	};
	static matrixFromArray(arr) {
		let result = Neat.createMatrix(arr.length, 1);
		for (let i = 0; i < arr.length; i++) {
			result.data[i][0] = arr[i];
		}
		return result;
	};
	static matrixToArray(m) {
		let arr = [];
		for (let y = 0; y < m.rows; y++) {
			for (let x = 0; x < m.cols; x++) {
				arr.push(m.data[y][x]);
			}
		}
		return arr;
	};
	static matrixCopy(m) {
		let nm = Neat.createMatrix(m.rows, m.cols);
		for (let y = 0; y < m.rows; y++) {
			for (let x = 0; x < m.cols; x++) {
				nm.data[y][x] = m.data[y][x];
			}
		}
		return nm;
	};
};