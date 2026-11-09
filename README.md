# Shadow Kombat 3D

## Ejecutar localmente

Necesitas Node.js 18 o posterior. Desde la carpeta del proyecto:

```sh
npm install
npm start
```

Abre <http://localhost:3000> en dos ventanas para probar el emparejamiento. Para probar desde otro dispositivo de la misma red, abre el juego usando la dirección IP local del equipo que ejecuta el servidor.

El proyecto está organizado así: `public/` contiene `index.html` y los recursos del juego, `server/` contiene el servidor HTTP/WebSocket y `test/` contiene las pruebas automatizadas.

## Publicar el modo en línea

Despliega este proyecto en un proveedor que permita aplicaciones Node.js y conexiones WebSocket, ejecutando `npm start`. El servidor escucha en el puerto indicado por `PORT` y en todas las interfaces. Usa HTTPS en producción; el juego cambiará automáticamente a WebSocket seguro (`wss://`).

El botón **MULTIJUGADOR EN LÍNEA** pone al jugador en una cola global y lo empareja con la siguiente persona disponible. El servidor no requiere cuentas ni almacena perfiles. Las partidas casuales intercambian controles en tiempo real; no hay cuentas, ranking ni protección contra trampas. Una conexión estable y un servidor geográficamente cercano mejoran la respuesta.

Para jugar con alguien en una sala privada, crea una sala y comparte el código de seis caracteres, o ingresa el código de otra persona y selecciona **UNIRSE**. Las salas privadas solo emparejan a jugadores que ingresaron el mismo código.

## Pruebas

```sh
npm test
```
