const express = require('express');
const config = require('config');
const morgan = require('morgan');
const debug = require('debug')('app:inicio');
// const dbDebug = require('debug')('app:db');
// const loger = require('./loger');
const Joi = require('@hapi/joi');
const app = express();

app.use(express.json()); 
app.use(express.urlencoded({extended:true})); 
app.use(express.static('public')); 


//configuracion de entorno
console.log('Aplicacion' + config.get('nombre'));
console.log('DB server' + config.get('configDB.host'));

// app.use(loger);

//uso de middleware de terceros - morgan
//mostrar peticones y el tiempo de respuesta
if (app.get('env') === 'development') {
	app.use(morgan('tiny'));
	debug('morgan habilitado...');
} 


//trabajo con la db
debug('trabajando con la db');


app.get('/', (req, res) => {
	res.send('hola desde expres');
});


const usuarios = [
	{id: 1, nombre:'roberth', apellido:'morales'},
	{id: 2, nombre:'jesus', apellido:'morales'},
	{id: 3, nombre:'maria', apellido:'morales'}
	
]

app.get('/api/usuarios', (req, res) => {
	res.send(usuarios);
});


//GET
app.get('/api/usuarios/:id', (req, res) => {
	let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
	if(!usuario) res.status(404).send("usuario no encontrado");
	res.send(usuario);
});


//POST
app.post('/api/usuarios', (req, res) => {
	const schema = Joi.object({
    nombre: Joi.string().min(3).required()
});

const {error, value} = schema.validate({ nombre: req.body.nombre });
	if (!error) {
		const usuario = {
		id: usuarios.length + 1,
		nombre: value.nombre
	};
	usuarios.push(usuario);
	res.send(usuario);
	} else {
		res.status(400).send(error.message);
	}


// PUT;
app.put('/api/usuarios/:id', (req, res) => {
	let usuario = existeUsuario(req.params.id)
	if(!usuario) {
		res.status(404).send("Usuario no encontrado");
		return;
	}

	const {error, value} = validarUsuario(req.body.nombre);
		if (error) {
			const mensaje = error.details[0].message;
			res.status(400).send(mensaje);
			return;
		};
			usuario.nombre = value.nombre;
			res.send(usuario);	
});	
})

//DELETE
app.delete('/api/usuarios/:id', (req, res) => {
	let usuario = existeUsuario(req.params.id)
	if(!usuario) {
	res.status(404).send("Usuario no encontrado");
	return;
	}

	const index = usuarios.indexOf(usuario);
	usuarios.splice(index, 1);

	res.send(usuarios);
});

//FUNCIONES
function existeUsuario (id) {
	return(usuarios.find(u => u.id === parseInt(id)));
	
}

function validarUsuario(nom){
	const schema = Joi.object({
    	nombre: Joi.string().min(3).required()
	});
	return (schema.validate({ nombre: nom })); 
}

//PUERTO
const port = process.env.PORT | 4000;
app.listen(port, () => {
	console.log(`escuchando en el puerto ${port}...`);
})
