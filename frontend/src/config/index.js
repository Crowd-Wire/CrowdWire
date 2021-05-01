if (process.env.RUNNING_MODE && process.env.RUNNING_MODE == 'production'){
    HOST = process.env.API_SERVICE_NAME || 'localhost'
    WS_BASE = "ws://{$HOST}:8000"
    API_BASE = "http://{$HOST}:8000/"
}
else {
    WS_BASE = "ws://localhost:8000";
    API_BASE = "http://localhost:8000/";
}
export const WS_BASE;
export const API_BASE;