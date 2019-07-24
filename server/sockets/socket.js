const { io } = require('../server');

const { Usuarios } = require('../clases/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');
const usuarios = new Usuarios();

io.on('connection', (client) => {

    //console.log('Usuario conectado');
    client.on('entrarChat', (data, callback) => {

        // console.log(data);

        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre es necesario'
            });
        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se unio`));

        return callback(usuarios.getPersonasPorSala(data.sala));

    });

    client.on('crearMensaje', (data, callback) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
        callback(mensaje);
    });

    //console.log('Usuario conectado');
    client.on('disconnect', () => {

        let PersonaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(PersonaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${PersonaBorrada.nombre} salio`));
        client.broadcast.to(PersonaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(PersonaBorrada.sala));
    });

    //mensajes privados
    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

    });


});