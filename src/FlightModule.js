export class FlightAnimation {
  constructor(map, geojsonData, options = {}) {
    this.map = map;
    this.points = geojsonData.features.map(f => f.geometry.coordinates);
    this.options = {
      zoom: 14,
      pitch: 60,
      speed: 0.8,
      rotationDuration: 5000, // ms
      rotationInterval: 7,
      ...options
    };
    this.currentIndex = 0;
    this.isAnimating = false;
  }

  start() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    // Привязываем остановку анимации к событиям
    this.map.on('mousedown', this.stop.bind(this));
    this.map.on('touchstart', this.stop.bind(this));
    this.map.on('wheel', this.stop.bind(this));

    this.flyToNext();
  }

  stop() {
    this.isAnimating = false;
    this.map.off('mousedown', this.stop.bind(this));
    this.map.off('touchstart', this.stop.bind(this));
    this.map.off('wheel', this.stop.bind(this));
  }

  flyToNext() {
    if (!this.isAnimating || this.currentIndex >= this.points.length) {
      if (this.currentIndex >= this.points.length) {
        console.log("Облёт завершён");
      }
      this.isAnimating = false;
      return;
    }

    const [lng, lat] = this.points[this.currentIndex];
    const isRotationPoint = (this.currentIndex + 1) % this.options.rotationInterval === 0;

    if (isRotationPoint) {
      this.map.flyTo({
        center: [lng, lat],
        zoom: this.options.zoom,
        pitch: this.options.pitch,
        bearing: 0,
        speed: this.options.speed
      });

      this.map.once('moveend', () => {
        this.rotateAroundPoint([lng, lat]);
      });
    } else {
      this.map.flyTo({
        center: [lng, lat],
        zoom: this.options.zoom,
        pitch: this.options.pitch,
        bearing: 0,
        speed: this.options.speed
      });

      this.currentIndex++;
      this.map.once('moveend', this.flyToNext.bind(this));
    }
  }

  rotateAroundPoint(center) {
    let startBearing = this.map.getBearing();
    const duration = this.options.rotationDuration;
    const startTime = performance.now();

    const updateRotation = (time) => {
      if (!this.isAnimating) return;

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newBearing = startBearing - progress * 360;

      this.map.easeTo({
        center: center,
        bearing: newBearing,
        duration: 50,
        easing: t => t
      });

      if (progress < 1) {
        requestAnimationFrame(updateRotation);
      } else {
        this.currentIndex++;
        this.flyToNext.bind(this)();
      }
    };

    requestAnimationFrame(updateRotation);
  }
}