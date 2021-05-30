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
        return fetch(API_BASE + 'users/' + reported_id  + "/reports-received/", {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            },
            body: JSON.stringify({world_id: world_id, comment: comment})
        })
    }

    getReports(world_id, reporter_id, reported_id, reviewed, order_by, order, page, limit){
        let url = 'users/reports/';
        let query = [];
    
        if(world_id)
            query.push('world_id=' + world_id);
        
        if(reporter_id)
            query.push('reporter_id=' + reporter_id);
        
        if(reported_id)
            query.push('reported_id=' + reported_id);
        
        if(reviewed !== null)
            query.push('reviewed=' + reviewed);

        if(order_by !== null)
            query.push('order_by=' + order_by); 
        
        if(order !== null)
            query.push('order=' + order);
   
        query.push('page=' + page);
        query.push('limit=' + limit);


        if (query.length !== 0)
            url = url.concat('?' + query.join('&'));

        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    reviewUserReport(world_id, reporter_id, reported_id, reviewed){
        return fetch(API_BASE + 'users/' + reporter_id  + '/reports-sent/' + world_id + '/' + reported_id + '/', {
            method: 'PUT',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            },
            body: JSON.stringify({reviewed: reviewed})
        })
    }

}

export default new ReportService();