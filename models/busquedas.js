const fs = require("fs");

const axios = require("axios");

class Busquedas {
  historial = [];
  dbpath = "./db/database.json";

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado() {
    //Capitalizar cada Palabra

    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));
      return palabras.join(" ");
    });
  }

  get paramsMapbox() {
    return {
      language: "es",
      access_token: process.env.MAPBOX_KEY,
    };
  }

  get paramsOpenWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  async ciudad(lugar = "") {
    try {
      //petición http
      const instace = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instace.get();

      //const resp = await axios.get("https://api.mapbox.com/geocoding/v5/mapbox.places/mONTREAL.json?language=es&access_token=pk.eyJ1IjoiamFybWNvZGUiLCJhIjoiY2t4Mjd2d256MTdrejJwcDk5eTQwZHZ4cyJ9.8behGKEAe71bhM5aY4Dp0w");
      //console.log(resp.data.features);
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        long: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      return [];
    }

    return []; //retornar lugares
  }

  async climaLugar(lat, lon) {
    try {
      //Instance de axios
      const instanceClima = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsOpenWeather, lat, lon },
      });
      //resp.data
      const respClima = await instanceClima.get();
      const { weather, main } = respClima.data;

      //return respClima.data.main;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(error);
    }
  }

  agregarHistorial(lugar = "") {
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }

    this.historial = this.historial.splice(0, 5);

    this.historial.unshift(lugar.toLocaleLowerCase());

    //Grabar en DB
    this.guardarDB();
  }

  //Grabar en DB
  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbpath, JSON.stringify(payload));
  }

  leerDB() {
    //debe existir
    if (!fs.existsSync(this.dbpath)) {
      return;
    }
    //const info ... readfilesync ... path .... {encoding: utf-8}
    const info = fs.readFileSync(this.dbpath, { encoding: "utf-8" });
    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}

module.exports = Busquedas;
