const express=require('express');//llamada del modulo de express
const mongoose=require('mongoose');//llamada del modulo de mongoose
const session=require('express-session');//llamada del modulo de express-session
const mongoSession=require('connect-mongodb-session')(session);//llmada y cinfiguracin del modulo connect-mongodb-session
const webpush=require('web-push');//llamada de webPush para envio de notificaciones
const crypto=require('crypto-js');
const cors=require('cors');
require('dotenv').config();
const path=require('path');//llamada del modulo path
const app=express();//asignacion del servidor de express
const server=require('http').Server(app);//extraccion del protocolo http del servidor
const serverIo=require('socket.io')(server);//asignacion del protocolo http a socket.io para uso compartido
const {ExpressPeerServer}=require('peer');//extraccion del servidor peer
const peerServer=ExpressPeerServer(server, {debug:true});//asignacion de puerto
//console.log(webpush.generateVAPIDKeys());
app.use('/peerjs', peerServer);//ruta de acceso al peer server
const port=process.env.PORT || 3000;//solicitud de puerto disponible o uso del puerto predefinido
const url=process.env.database;//URL de acceso a la base de datos
const keys={//obtencion de llaves desde variables de entorno
    private:process.env.private_key,
    public:process.env.public_key
};
webpush.setVapidDetails(//conffiguracion de llaves
    'mailto:josuekpop2002@gmail.com',
    keys.public,
    keys.private
);
let pushClient;
const verify=(req, res, next)=>//metodo de verificacion de existencia de session
{
    if(req.session.pid)
    {
        next();
    }
    else
    {
        res.redirect('/');
    }
}
mongoose.connect(url)//medoto de conexion a la base de datos
.then(()=>
{
    console.log("Database online...");
})
.catch((err)=>
{
    console.log("Error to connect database..."+err);
});
const usuarioSchema=new mongoose.Schema({//configuracion del modelo y eschema de usuario para la base de datos
    email:{type:String, required:true},
    password:{type:String, requires:true},
    pushClient:{type:Object}
});
const UserModel=mongoose.model('usuario', usuarioSchema);//declaracion de la coleccion en la base de datos para acceso desde el servidor
var sessiondb=new mongoSession({//configuracion del guardado de sesiones en base de datos
    uri:url,
    collection:'sessions'
});
sessiondb.on('error', (err)=>//metodo de control de errores
{
    console.log("Error with mongoSession");
});
app.set('view engine', 'ejs');//configuracion de motor de vistas y plantillas
app.use(express.static("public"));//declaracion de recursos publicos
app.use(express.urlencoded({extended:true}));//declaracion de encriptacion de url para peticiones web
app.use(session(//declaracion y configuracion del uso de sesiones
    {
        secret:"secretoparalainiciaciondesesiones",
        resave:false,
        saveUninitialized:false,
        store:sessiondb
    }
));
app.use(cors());
app.get('/', (req, res)=>//ruta inicial
{
    if(req.session.pid)
    {
        res.redirect('/miCuenta');
    }
    else
    {
        req.session.destroy();
        res.render('inicio');
    }
});
app.get('/login', (req, res)=>//ruta de renderizacion de plantilla
{
    res.render('login');
});
app.post('/login', (req, res)=>//ruta de acceso e inicio de sesion
{
    UserModel.findOne({email:req.body.email})//consulta a base de datos
    .then((usu)=>
    {
        if(usu)
        {
            if(crypto.AES.decrypt(usu.password, 'secretkeytodecryptpasswordandinformation').toString(crypto.enc.Utf8)==req.body.password)
            {
                req.session.pid=usu.id;//declaracion de sesion iniciada
                res.redirect('/miCuenta');
            }
            else
            {
                res.render('error', {mensaje:"Los datos ingresados son incorrectos."});
            }
        }
        else
        {
            res.render('error', {mensaje:"Los datos ingresados son incorrectos."});
        }
    })
    .catch((err)=>
    {
        res.render('error', {mensaje:"Ha ocurrido un error en la base de datos. Lo sentimos"});
    });
});
app.post('/api/login', (req, res)=>
{
    UserModel.findOne({email:req.body.email})//consulta a base de datos
    .then((usu)=>
    {
        if(usu)
        {
            if(crypto.AES.decrypt(usu.password, 'secretkeytodecryptpasswordandinformation').toString(crypto.enc.Utf8)==req.body.password)
            {
                res.json({response:"success", id:usu.id});
            }
            else
            {
                res.json({response:"failed"})
            }
        }
        else
        {
            res.json({response:"failed"})
        }
    })
    .catch((err)=>
    {
        res.render('error', {mensaje:"Ha ocurrido un error en la base de datos. Lo sentimos"});
    });
})
/*app.get('/signUp', (req, res)=>//ruta de renderizacion
{
    res.render('signUp');
});
app.post('/signUp', (req, res)=>//ruta de registro de usuarios
{
    UserModel.findOne({email:req.body.email})//consulta a la base de datos
    .then((usu)=>
    {
        if(!usu)
        {
            var newUser=new UserModel({//creacion de nuevo documento
                email:req.body.email,
                password:crypto.AES.encrypt(req.body.password, 'secretkeytodecryptpasswordandinformation').toString()
            });
            newUser.save()
            .then((newUsu)=>
            {
                req.session.pid=newUsu.id;//declaracion de sesion iniciada
                res.redirect('/miCuenta');
            })
            .catch((err)=>
            {
                res.render('error', {mensaje:"Ha ocurrido un error al registrar al usuario, intentelo mas tarde"});
            });
        }
        else
        {
            res.render('error', {mensaje:"El correo ingresado ya esta asociado a una cuenta existente."});
        }
    })
    .catch((err)=>
    {
        res.render('error', {mensaje:"Ha ocurrido un error con la base de datos, intentelo mas tarde"});
    });
});*/
app.get('/logout', (req, res)=>//ruta de destruccion de sesion
{
    req.session.destroy();//desctuccion de la sesion
    res.redirect('/');
});
app.get('/miCuenta', verify, (req, res)=>//ruta de renderizacion
{
    res.render('miCuenta', {id:req.session.pid, a1:"active", a2:"", a3:"", public:keys.public});
});
app.get('/receptor/:id', verify, (req, res)=>//ruta de renderizacion
{
    res.render('receptor', {id:req.params.id, a1:"", a2:"", a3:"active"});
});
app.get('/guia', verify, (req, res)=>//ruta de renderizacion
{
    res.render('guia', {id:req.session.pid, a1:"", a2:"active", a3:""});
});
app.get('/emisor/:id', (req, res)=>//ruta de control de acceso
{
    UserModel.findById(req.params.id)//consulta a la base de datos
    .then((cuenta)=>
    {
        if(cuenta)
        {
            res.render('emisor', {id:req.params.id});
        }
        else
        {
            res.render('error', {mensaje:"Codigo de seguridad no aceptado. Por favor ingrese un codigo de seguridad valido"});
        }
    })
    .catch((err)=>//control de errores
    {
        res.render('error', {mensaje:"Codigo de seguridad no aceptado. Por favor ingrese un codigo de seguridad valido"});
    }); 
});
app.get('/notificacion/:id', async(req, res)=>//ruta de lanzamiento de notificaciones
{
    UserModel.findById(req.params.id)//consulta a la base de datos para cliente peer
    .then((usu)=>
    {
        const data=JSON.stringify({//declaracion de formato de notificacion
            title:'Visitante en la puerta',
            message:'Ingresa a la aplicacion para atender la llamada'
        });
        console.log(usu.pushClient);
        webpush.sendNotification(usu.pushClient, data)//envio de notificacion
        .catch((err)=>//ruta de control de errores
        {
            console.log("error en notificacion "+err);
        });
        res.status(200).json({
            respuesta:"success"
        });
    })
    .catch((err)=>//ruta de control de errores
    {
        res.status(200).json({
            respuesta:"fail",
            error:err
        });
    });
});
app.get('/config', (req, res)=>//ruta de renderizacion
{
    res.render('config');
});
app.post('/config', (req, res)=>//ruta de redireccionamiento
{
    res.redirect('/emisor/'+req.body.secureCode);
});
app.post('/webpushclient/:id', (req, res)=>//ruta de subscripcion del service worker
{
    UserModel.findByIdAndUpdate(req.params.id, {$set:{//modificacion de la base de datos
        pushClient:JSON.parse(Object.getOwnPropertyNames(req.body))//guardado de subscripcion
    }})
    .then(()=>//control de errores
    {
        res.status(201).json();
        console.log("Success");
    })
    .catch((err)=>//control de errores
    {
        console.log(err);
    });
});
serverIo.on("connection", (socket)=>//configuracion de socket.io
{
    socket.on('join-room', (ids)=>
    {
        console.log(ids);
        socket.join(ids.sala);//agregacion o creacion de sala
        socket.to(ids.sala).emit('conectar', ids.usuario);
    });
    socket.on('secure_code', (secureCodes)=>
    {
        console.log('evento escuchado')
        serverIo.sockets.emit('secure_code', secureCodes)
    });
    socket.on('connectionSuccess', (res)=>
    {
        serverIo.sockets.emit('connectionSuccess', res);
    })
});
server.listen(port, ()=>//metodo de escucha del servidor
{
    console.log("Server online on port "+port);
});