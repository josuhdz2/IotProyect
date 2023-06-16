const socket=io();//llamada del modulo de socket.io
var video=document.getElementById("video");//relacionn con el espacio en html para video
const peer = new Peer(//declaracion y construccion del modulo peer
    undefined,
    {
        host:'/',
        port:443,
        path:'/peerjs'
    }
);
peer.on('open', (idUser)=>//escucha del evento de carga de peer
{
    console.log('carga de peer');
    socket.emit('join-room', {sala:salaURL, usuario:idUser});//emision del evento de conexion socket
});
navigator.mediaDevices.getUserMedia({audio:false, video:true})//peticion de la multimedia del dispositivo
.then((userMedia)=>
{
    socket.on('conectar', (idUsuario)=>//escucha del evento de conexion socket
    {
        llamar(idUsuario, userMedia);//llamada de la funcion llamar
    });
})
.catch((err)=>//control de errores
{
    console.log("error al cargar medios "+err);
});
function llamar(id, media)//declaracion de la funcion llamar
{
    console.log('receptor conectado '+id);
    const call=peer.call(id, media);//emicion del evento de llamada de peer
    call.on('stream', (audio)=>//escucha del evento de envio de multimedia
    {
        addVideo(audio);//llamada de la funcion addVideo
    });
}
function addVideo(stream)//declaracion de la funcion addVideo
{
    video.srcObject=stream;//asignacion de la multimedia al espacio de video en html
    video.addEventListener('loadedmetadata', ()=>//escucha de la carga de multimedia en html
    {
        video.play();//reproduccion del video
    });
}
