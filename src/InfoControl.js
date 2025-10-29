// InfoControl.js
export class InfoControl {
  /**
   * @param {Object} options
   * @param {string} [options.title='Информация'] - Заголовок блока
   * @param {string} [options.text] - Основной текст / подсказки
   * @param {boolean} [options.collapsed=true] - Свёрнута ли панель по умолчанию
   */
  constructor(options = {}) {
    this.title = options.title || "Информация";
    this.info = options.info || "";
    this.text =
      options.text ||
      `
        <ul style="margin:0; padding-left:18px;">
          <li>🖱️ Перемещение — ЛКМ</li>
          <li>🔍 Масштаб — колесо мыши или + / -</li>
          <li>↻ Поворот — ПКМ</li>
          <li>⛰️ Наклон — Ctrl + ЛКМ</li>
        </ul>
        `;
    this.collapsed = options.collapsed || true;
  }

  onAdd(map) {
    this._map = map;

    // Контейнер контрола
    this._container = document.createElement("div");
    this._container.className = "maplibregl-ctrl custom-info-control";
    this._container.style.position = "relative";

    // Кнопка "i"
    this._button = document.createElement("button");
    // this._button.innerText = "ℹ️";
    this._button.innerText = "i";
    this._button.title = "Информация";
    this._button.className = "info-button";
    Object.assign(this._button.style, {
      background: "rgba(0,0,0,0.6)",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      cursor: "pointer",
      fontSize: "18px",
      lineHeight: "32px",
      textAlign: "center",
      margin: "8px",
      transition: "background 0.3s",
    });

    this._button.onmouseenter = () =>
      (this._button.style.background = "rgba(0,0,0,0.8)");
    this._button.onmouseleave = () =>
      (this._button.style.background = "rgba(0,0,0,0.6)");

    // Панель с текстом
    this._panel = document.createElement("div");
    this._panel.className = "info-panel";
    Object.assign(this._panel.style, {
      background: "rgba(0, 0, 0, 0.7)",
      "text-align": "justify",
      color: "#fff",
      padding: "10px 12px",
      borderRadius: "8px",
      fontSize: "13px",
      lineHeight: "1.4",
      margin: "8px",
      maxWidth: "300px",
      backdropFilter: "blur(4px)",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      transition: "max-height 0.4s ease, opacity 0.3s ease",
      overflow: "hidden",
    });

    this._panel.innerHTML = `
    ${this.info}<br/>    
    <strong style="display:block; margin-bottom:4px;">${this.title}</strong>
        ${this.text}
      `;

    // Изначально скрыта, если collapsed=true
    if (this.collapsed) {
      this._panel.style.maxHeight = "0";
      this._panel.style.opacity = "0";
      this._panel.style.padding = "0 12px";
      this._panel.style.pointerEvents = "none";
    }

    // При клике переключаем состояние
    this._button.addEventListener("click", () => this.togglePanel());

    this._container.appendChild(this._button);
    this._container.appendChild(this._panel);

    return this._container;
  }

  togglePanel() {
    const collapsed =
      this._panel.style.maxHeight === "0px" ||
      this._panel.style.maxHeight === "0";
    if (collapsed) {
      this._panel.style.maxHeight = "320px";
      this._panel.style.opacity = "1";
      this._panel.style.padding = "10px 12px";
      this._panel.style.pointerEvents = "auto";
    } else {
      this._panel.style.maxHeight = "0";
      this._panel.style.opacity = "0";
      this._panel.style.padding = "0 12px";
      this._panel.style.pointerEvents = "none";
    }
  }

  onRemove() {
    this._container.remove();
    this._map = undefined;
  }
}
