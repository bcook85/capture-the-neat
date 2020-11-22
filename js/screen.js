class Screen {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = false;
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
	toggleFullscreen() {
		if (!document.fullscreenElement) {
			this.canvas.requestFullscreen();
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	};
};