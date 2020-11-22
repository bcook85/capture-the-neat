class Loop {
	constructor(updateLoop) {
		this.id = 0;
		this.now = performance.now();
		this.last = this.now;
		this.elapsed = 0;
		this.totalTime = 0;
		this.fps = 0;
		this.updateLoop = updateLoop;
	};
	reset() {
		this.now = performance.now();
		this.elapsed = 0;
		this.last = this.now;
		this.totalTime = 0;
	};
	start() {
		this.now = performance.now();
		this.elapsed = 0;
		this.last = this.now;
		this.id = window.requestAnimationFrame( () => this.updater() );
	};
	stop() {
		window.cancelAnimationFrame(this.id);
	};
	updater() {
		this.id = window.requestAnimationFrame( () => this.updater() );
		this.now = performance.now();
		this.elapsed = this.now - this.last;
		this.totalTime += this.elapsed;
		this.last = this.now;
		this.fps = Math.floor(1000 / this.elapsed);
		this.updateLoop();
	};
};