require("dotenv").config();

const {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} = require("./helpers/inquire");
const Busquedas = require("./models/busquedas");

console.clear();

//console.log(process.env.MAPBOX_KEY);

const main = async () => {
  const busquedas = new Busquedas();
  let opt = "";

  do {
    //Imprimir el menu
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        //Mostrar mensaje
        const termino = await leerInput("Ciudad: ");

        //Buscar los lugares
        const lugares = await busquedas.ciudad(termino);

        //Seleccionar el lugar
        const idSel = await listarLugares(lugares);
        if (idSel === "0") {
          continue;
        }
        //console.log({ idSel });
        const lugarSel = lugares.find((l) => l.id === idSel);
        //console.log(lugarSel);

        //Guardar en la BD
        busquedas.agregarHistorial(lugarSel.nombre);

        //Datos del clima
        const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.long);
        //console.log(clima);
        //Mostrar resultados
        console.clear();
        console.log("\nInformación de la ciudad.\n".green);
        console.log("Ciudad:", lugarSel.nombre);
        console.log("Lat:", lugarSel.lat);
        console.log("Lng:", lugarSel.long);
        console.log("Temperatura:", clima.temp);
        console.log("Mínima:", clima.min);
        console.log("Máxima:", clima.max);
        console.log("Descripción del clima:", clima.desc.yellow);
        break;

      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;
    }

    if (opt != 0) {
      await pausa();
    }
  } while (opt != 0);
  await pausa();
};

main();
