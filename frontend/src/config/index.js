export let WS_BASE = null;
export let API_BASE = null;
export let URL_BASE = null;
console.log(window._env_);
console.log(window._env_.REACT_APP_RUNNING_MODE);
if (window._env_.REACT_APP_RUNNING_MODE != null && window._env_.REACT_APP_RUNNING_MODE == 'production'){
    let HOST = window._env_.REACT_APP_API_IP
    console.log("host" + HOST)
    WS_BASE = `ws://${HOST}`
    API_BASE = `http://${HOST}/api/v1`
    URL_BASE = `http://${HOST}`
}
else {
    WS_BASE = "ws://localhost:8000";
    API_BASE = "http://localhost:8000/";
    URL_BASE = "http://localhost:3000/";
}
