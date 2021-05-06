export let WS_BASE = null;
export let API_BASE = null;
export let URL_BASE = null;
console.log(window.REACT_APP_RUNNING_MODE);
console.log(window.REACT_APP_API_IP);
if (window.REACT_APP_RUNNING_MODE != null && window.REACT_APP_RUNNING_MODE == 'production'){
    let HOST = window.REACT_APP_API_IP
    console.log("host" + HOST)
    WS_BASE = `ws://${HOST}/api/v1`
    API_BASE = `http://${HOST}/api/v1`
    URL_BASE = `http://${HOST}`
}
else {
    WS_BASE = "ws://localhost:8000";
    API_BASE = "http://localhost:8000/";
    URL_BASE = "http://localhost:3000/";
}
