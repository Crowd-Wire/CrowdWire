import AuthenticationService from './AuthenticationService.js';
import {API_BASE} from "config";

class ReportService{

    sendWorldReport(world_id, comment){
        return fetch(API_BASE + 'worlds/' + world_id  + "/reports/", {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            },
            body: JSON.stringify({comment: comment})
        })
    }

    sendUserReport(reported_id, world_id, comment){
        console.log({world_id: world_id, comment: comment})
        return fetch(API_BASE + 'users/' + reported_id  + "/reports-received/", {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            },
            body: JSON.stringify({world_id: world_id, comment: comment})
        })
    }
}

export default new ReportService();