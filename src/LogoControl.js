// LogoControl.js
export class LogoControl {
  /**
   * @param {Object} options
   * @param {string} options.image - путь к изображению логотипа
   * @param {number|string} [options.width=100] - ширина логотипа (px или %)
   * @param {number|string} [options.opacity=1] - прозрачность логотипа
   * @param {string} [options.alt='Logo'] - alt-текст
   * @param {string} [options.link] - ссылка при клике (необязательно)
   */
  constructor(options = {}) {
    this.image = options.image || "./icons/logo.png";
    this.width = options.width || 100;
    this.opacity = options.opacity || 1;
    this.alt = options.alt || "Logo";
    this.link = options.link || null;
  }

  onAdd(map) {
    this._map = map;

    // создаём контейнер контрола
    this._container = document.createElement("div");
    this._container.className = "maplibregl-ctrl custom-logo-control";
    this._container.style.display = "flex";
    this._container.style.alignItems = "center";
    this._container.style.justifyContent = "center";
    this._container.style.padding = "4px";
    this._container.style.background = "transparent";
    this._container.style.userSelect = "none";

    // создаём элемент <img>
    const img = document.createElement("img");
    img.src = this.image;
    img.alt = this.alt;
    img.style.width =
      typeof this.width === "number" ? `${this.width}px` : this.width;
    img.style.opacity = this.opacity;
    img.style.pointerEvents = this.link ? "auto" : "none";
    img.style.cursor = this.link ? "pointer" : "default";

    // оборачиваем в <a>, если задана ссылка
    if (this.link) {
      const a = document.createElement("a");
      a.href = this.link;
      a.target = "_blank";
      a.appendChild(img);
      this._container.appendChild(a);
    } else {
      this._container.appendChild(img);
    }

    return this._container;
  }

  onRemove() {
    this._container.remove();
    this._map = undefined;
  }
}
