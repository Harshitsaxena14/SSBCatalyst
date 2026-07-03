export class CountdownTimer {
  constructor({ seconds, onTick, onComplete }) {
    this.total = Math.max(0, Number(seconds) || 0);
    this.remaining = this.total;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.intervalId = null;
  }

  start() {
    if (this.intervalId) {
      return;
    }

    this.emitTick();

    this.intervalId = window.setInterval(() => {
      this.remaining = Math.max(0, this.remaining - 1);
      this.emitTick();

      if (this.remaining <= 0) {
        this.stop();
        if (typeof this.onComplete === 'function') {
          this.onComplete();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(seconds = this.total) {
    this.stop();
    this.total = Math.max(0, Number(seconds) || 0);
    this.remaining = this.total;
    this.emitTick();
  }

  setRemaining(seconds) {
    this.remaining = Math.max(0, Number(seconds) || 0);
    this.emitTick();
  }

  emitTick() {
    if (typeof this.onTick === 'function') {
      this.onTick(this.remaining, this.total);
    }
  }
}
