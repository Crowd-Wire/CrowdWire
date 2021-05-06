export let WS_BASE = null;
export let API_BASE = null;
export let URL_BASE = null;
console.log(window.REACT_APP_RUNNING_MODE);
if (window.REACT_APP_RUNNING_MODE != null && window.REACT_APP_RUNNING_MODE == 'production'){
    let HOST = "crowdwire.duckdns.org"
    console.log("host " + HOST)
    WS_BASE = `wss://${HOST}/api/v1`
    API_BASE = `https://${HOST}/api/v1/`
    URL_BASE = `https://${HOST}/`
}
else {
    WS_BASE = "ws://localhost:8000";
    API_BASE = "http://localhost:8000/";
    URL_BASE = "http://localhost:3000/";
}
