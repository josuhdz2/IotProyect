console.log(public);
function urlBase64ToUint8Array(base64String)//declaracion de la funcion de convercion de llaves (propia de la documentacion de web-socket)
{
    const padding='='.repeat((4 - base64String.lenght % 4) % 4);
    const base64=(base64String+padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData=window.atob(base64);
    const outputArray=new Uint8Array(rawData.length);
    for(let i=0; i<rawData.length; i++)
    {
        outputArray[i]=rawData.charCodeAt(i);
    }
    return outputArray;
};
const webAdding=async()=>//declaracion de la funcion webAdding de forma asincrona.
{
    console.log("Registrando nuevo cliente");
    const registro=await navigator.serviceWorker.register('/worker.js');//indicacion de ruta del worker
    console.log("acceso de service Worker");
    const subs=await registro.pushManager.subscribe({userVisibleOnly:true, applicationServerKey: urlBase64ToUint8Array(public)});//subscripcion del service worket al navegado cliente
    console.log("suscrito a la base de datos");
    const objSubs=JSON.stringify(subs);//conversion a string del objeto de subscripcion
    console.log(objSubs);
    await fetch('/webpushclient/'+id, {//envio del objeto a la ruta de acesso para subscripcion
        method:"post",
        body:objSubs,
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        }
    });
};
if("serviceWorker" in navigator)//verificacion de existencia de servicio service workers
{
    webAdding()//llamada de la funcion webAdding
    .then(()=>
    {
        console.log("Cliente suscrito");
    })
    .catch((err)=>//control de errores
    {
        alert("Error en agregacion "+err);
    });
}