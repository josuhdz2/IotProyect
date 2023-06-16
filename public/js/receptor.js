const socket=io();//llamada del modulo de socket.io
//var video=document.getElementById("video");//relacion con el elemento html
//se creara una nueva forma de agregar elementos a un div con varios videos
var videos=document.getElementById('videos');
const peer = new Peer(//construccion del objeto de peer
    undefined,
    {
        host:'/',
        port:443,
        path:'/peerjs'
    }
);
peer.on('open', (idUser)=>//ecucha del evento de conexion peer
{
    console.log('carga de peer');
    socket.emit('join-room', {sala:salaURL, usuario:idUser});//emision del evento de conexion a socket
});
navigator.mediaDevices.getUserMedia({audio:true, video:false})//peticion de la multimedia
.then((userMedia)=>
{
    peer.on('call', (call)=>//escucha del evento de llamada
    {
        call.answer(userMedia);//respuesta al evento de llamada
        const pantalla=document.createElement('video');
        pantalla.setAttribute('style', 'width:100%;');
        call.on('stream', (audio)=>//escucha de la recepcion de multimedia
        {
            addVideo(audio, pantalla);//llamada de la funcion addVideo
            console.log("datos recibidos")
        });
    });
})
.catch((err)=>//control de errores
{
    console.log('Error al cargar la media del usuario '+err);
});
function addVideo(stream, screen)//declaracion de la funcion addVideo
{
    screen.srcObject=stream;//asginacion de la multimedia al espacio html
    screen.addEventListener('loadedmetadata', ()=>//escucha de la carga de multimedia
    {
        screen.play();//reproduccion del elemento.
    });
    videos.append(screen);
}