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
            body: JSON.stringify({reported: world_id, comment: comment})
        })
    }
}

export default new ReportService();