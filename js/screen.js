class Screen {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = false;
		// Automatically re-size game canvas
		window.addEventListener("resize", () => { this.autoFullscreen(); }, false);
		window.addEventListener("orientationchange", () => { this.autoFullscreen(); }, false);
		this.autoFullscreen();
	};
	drawImage(
			image
			,clipX
			,clipY
			,clipWidth
			,clipHeight
			,drawX
			,drawY
			,drawWidth
			,drawHeight
		) {
		this.ctx.drawImage(
			image
			,clipX
			,clipY
			,clipWidth
			,clipHeight
			,drawX
			,drawY
			,drawWidth
			,drawHeight
		);
	};
	drawText(text, x, y, font, alignment, color) {
		this.ctx.font = font;
		this.ctx.textAlign = alignment;
		this.ctx.fillStyle = color;
		this.ctx.fillText(text, x, y);
	};
	clearScreen(color) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, this.width, this.height);
	};
	autoFullscreen() {
		let newWidth = Math.floor(this.canvas.parentElement.clientWidth * 0.99);
		let newHeight = Math.floor(window.innerHeight * 0.99);
		let aspectRatio = this.canvas.width / this.canvas.height;
		if (newWidth / newHeight > aspectRatio)	{//wide
			newWidth = Math.floor(newHeight * aspectRatio);
			this.canvas.style.height = newHeight + "px";
			this.canvas.style.width = newWidth + "px";
		}
		else {//tall
			newHeight = Math.floor(newWidth / aspectRatio);
			this.canvas.style.width = newWidth + "px";
			this.canvas.style.height = newHeight + "px";
		}
	};
};