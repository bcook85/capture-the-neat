/******************************************************************************
Images
******************************************************************************/

class ImageContainer {
	constructor() {
		this.images = [];
		this.sources = [];
		this.allLoaded = false;
	};
	load(sourceFile, width, height) {
		//Check if exists
		for (let i = 0; i < this.sources.length; i++) {
			if (this.sources[i] == sourceFile) {
				return i;
			}
		}
		this.allLoaded = false;
		//Create new canvas with desired dimensions
		let newCanvas = document.createElement("canvas");
		newCanvas.loaded = false;
		newCanvas.width = width;
		newCanvas.height = height;
		//Fill with pink
		newCanvas.getContext("2d").fillStyle = "rgb(255,0,212)";
		newCanvas.getContext("2d").fillRect(0, 0, width, height);
		//Add to images and imagesources and record new canvas's index
		this.images.push(newCanvas);
		this.sources.push(sourceFile);
		let returnID = this.images.length - 1;
		//Create new image and add the newCanvas as a property
		let newImage = new Image();
		newImage.canvas = newCanvas;
		//Load the image and onload, draw it on newCanvas
		newImage.onload = function() {
			let ctx = this.canvas.getContext("2d");
			ctx.imageSmoothingEnabled = false;
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, this.canvas.width, this.canvas.height);
			this.canvas.loaded = true;
			console.log("Image Loaded: " + this.src);
		};
		newImage.src = sourceFile;
		//Return the index of the newCanvas
		return returnID;
	};
	isLoaded() {
		for (let i = 0; i < this.images.length; i++) {
			if (!this.images[i].loaded) {
				this.allLoaded = false;
				return false;
			}
		}
		this.allLoaded = true;
		return true;
	};
};