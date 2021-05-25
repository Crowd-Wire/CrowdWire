import {API_BASE} from "config";
import AuthenticationService from "./AuthenticationService";

class EventService {

    getEvents(event_type, world_id, user_id, start_date, end_date, order_desc, limit, page_num){

        let url = 'worlds/' + world_id + '/events';

        let query = []

        if(event_type !== null){
            query.push('event_type=' + event_type)
        }

        if(user_id !== null){
            query.push('user_id=' + user_id)
        }

        if(start_date !== null){
            query.push('start_date=' + start_date)
        }

        if(end_date !== null){
            query.push('end_date=' + end_date)
        }

        if(order_desc !== null){
            query.push('order_desc=' + order_desc)
        }

        if(limit !== null){
            query.push('limit=' + limit)
        }

        if(page_num !== null){
            query.push('page_num=' + page_num)
        }

        if(query.length != 0){
            url = url.concat('?'+query.join('&'));
        }

        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            }
        })
    }
}

export default new EventService();