// import "maplibre-gl/dist/maplibre-gl.css";
import "maplibre-theme/icons.default.css";
import "maplibre-theme/classic.css";
import "./styles.css";
import * as maplibregl from "maplibre-gl";
import mlcontour from "maplibre-contour";
import FlatGeobuf from "mapbox-gl-flatgeobuf";

import { LogoControl } from "./LogoControl";
import { InfoControl } from "./InfoControl";
import { FlightAnimation } from "./FlightModule";

const map = new maplibregl.Map({
  container: "app",
  style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  zoom: 13,
  center: [56.57314, 53.55789],
  maxBounds: [
    [56.303959315, 53.523687074],
    [56.801757387, 53.654567698],
  ],
  pitch: 60,
  attributionControl: false,
});

const elevationUrl =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

const demSource = new mlcontour.DemSource({
  url: elevationUrl,
  encoding: "terrarium",
  maxzoom: 14,
  worker: true,
  cacheSize: 100,
  timeoutMs: 10000,
});
demSource.setupMaplibre(maplibregl);

map.on("load", async () => {
  // Добавим контрол управления картой
  map.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    })
  );

  // Добавляем контрол в правый верхний угол
  map.addControl(
    new InfoControl({
      title: "Как управлять картой",
      text: `
        <ul style="margin:0; padding-left:18px;">
          <li>🖱️ Перемещение — ЛКМ</li>
          <li>🔍 Масштаб — колесо или кнопки</li>
          <li>↻ Поворот — ПКМ</li>
          <li>⛰️ Наклон — Ctrl + ЛКМ</li>
        </ul>
      `,
      info: `Кольцо-24 прошло 10‑12 октября 2025 года в горной местности Ишимбайского района Республики Башкортостан. <br/>
      Это XXVII соревнование по туризму в формате рогейна: команды ориентировались на местности, самостоятельно выбирая маршрут, чтобы набрать как можно больше баллов за контрольные пункты (КП).<br>
      На карте представлены треки команд, КП. Гексагоны с интенсивнойстью посещения показывают самый "популярный" участок маршрута.`,
      collapsed: true,
    }),
    "top-left"
  );

  map.addControl(
    new LogoControl({
      image: "/ring24-25/icons/logo_big.png",
      width: 100,
      opacity: 0.9,
      link: "https://kolco24.ru/race/8/",
      alt: "Кольцо 24",
    }),
    "bottom-left"
  );

  // Добавим источник для высоты
  map.addSource("terrainSource", {
    type: "raster-dem",
    tiles: [elevationUrl],
    tileSize: 256,
    maxzoom: 14,
    encoding: "terrarium",
  });

  // Добавим источник для изолиний рельефа
  map.addSource("contour-source", {
    type: "vector",
    tiles: [
      demSource.contourProtocolUrl({
        // convert meters to feet, default=1 for meters
        multiplier: 3.28084,
        thresholds: {
          // zoom: [minor, major]
          11: [100, 500],
          12: [50, 200],
          14: [20, 100],
          15: [10, 50],
        },
        // optional, override vector tile parameters:
        contourLayer: "contours",
        elevationKey: "ele",
        levelKey: "level",
        extent: 4096,
        buffer: 1,
      }),
    ],
    maxzoom: 15,
  });

  // Добавим слой эффект hillshade (тени) на основе высотного слоя
  map.addLayer({
    id: "hillshading",
    type: "hillshade",
    source: "terrainSource",
    paint: {
      "hillshade-shadow-color": "#473B24",
    },
  });

  // Добавим слой с изолиниями
  map.addLayer({
    id: "contours-layer",
    type: "line",
    source: "contour-source",
    "source-layer": "contours",
    paint: {
      "line-color": "rgba(255,255,255, 50%)",
      // level = highest index in thresholds array the elevation is a multiple of
      "line-width": ["match", ["get", "level"], 1, 1, 0.5],
    },
  });

  
    // Добавляем источник и слой с шестигранниками
  // const elevSource = await new FlatGeobuf("fgb-elev", map, {
  //   url: "/ring24-25/data/elev.fgb",
  //   minZoom: 8,
  //   idProperty: "ID",
  // });

  // map.addLayer({
  //   id: "elev-lyr",
  //   source: "fgb-elev",
  //   type: "line",
  //   paint: {
  //     "line-color": "rgba(255,255,255, 50%)",
  //     // "line-width": ["match", ["get", "evel"], 1, 1, 0.5],
  //   },
  // });

  // Добавим высотную основу в сцену карты
  map.setTerrain({
    source: "terrainSource",
    exaggeration: 1.5, // немного усилим рельеф
  });

  // Добавляем источник и слой с шестигранниками
  const hexSource = await new FlatGeobuf("fgb-hex", map, {
    url: "/ring24-25/data/hex.fgb",
    minZoom: 8,
    idProperty: "_uid_",
  });

  map.addLayer({
    id: "hex-lyr",
    source: "fgb-hex",
    type: "fill",
    paint: {
      // 🟢 Цвет заливки в зависимости от поля 'count'
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "count"],
        0,
        "rgba(255, 255, 255, 0)",
        15,
        "rgba(255, 0, 0, 0.5)",
      ],
      // "fill-opacity": 0.7,
      "fill-outline-color": "rgba(0, 0, 0, 1)",
    },
  });

  // Добавляем источник и слой с треками
  const trakSource = await new FlatGeobuf("fgb-traks", map, {
    url: "/ring24-25/data/traks.fgb",
    minZoom: 8,
    idProperty: "FID",
  });

  map.addLayer({
    id: "traks-lyr",
    source: "fgb-traks",
    type: "line",
    // paint: {
    //   "fill-opacity": 0.5,
    //   "fill-color": "#B42222",
    // },
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(255, 0, 0, 60%)",
      "line-width": 0.5,
    },
  });

  // Регистрируем иконку для КП
  const image = await map.loadImage("/ring24-25/icons/prisma.png");
  map.addImage("cat", image.data);

  // Добавляем источник данных для КП
  map.addSource("points", {
    type: "geojson",
    data: "/ring24-25/data/kp.geojson",
  });

  // Добавляем слой КП на карту
  map.addLayer({
    id: "point-labels",
    type: "symbol",
    source: "points",
    layout: {
      "icon-image": "cat",
      "icon-size": 0.05,
      "text-field": ["get", "Number"],
      "text-variable-anchor": ["top", "bottom", "left", "right"],
      "text-radial-offset": 0.5,
      "text-justify": "auto",
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": "#000",
      "text-halo-width": 1,
    },
  });

  // Добавляем поведение при клике на карту
  map.on("click", "point-labels", (e) => {
    map.flyTo({
      center: e.features[0].geometry.coordinates,
    });
  });

  fetch('/ring24-25/data/flight-path.geojson')
  .then(response => response.json())
  .then(geojsonData => {
    // Создаём экземпляр облёта
    const flight = new FlightAnimation(map, geojsonData, {
      zoom: 14,
      pitch: 60,
      speed: 0.2,
      rotationInterval: 7
    });
    // Запускаем облёт
    flight.start();

  });
  
});
