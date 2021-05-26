import {API_BASE} from "config";
import AuthenticationService from "./AuthenticationService";

class WorldService {

    search(search, tags, type = "all", page) {
        /*
            search: string,
            tags: List[string]
            type: boolean
            page: int
        */

        let url = 'worlds/';
        let query = [];
    
        if(search !== "")
            query.push('search='+search);
        
        if(tags.length !== 0)
            query.push('tags='+tags.join('&tags='));
        
        // when joined searchs for the visited worlds
        query.push('visibility=' + type);

        // pagination
        query.push('page=' + page);

        if(query.length !== 0)
            url = url.concat('?'+query.join('&'));

        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            }
        })
    }

    getWorldDetails(path) {
        
        /*
            id:int
        */

        let url = 'worlds/'+path;
        let query = [];
        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            }
        })
    }

    deleteWorld(id) {
        /*
            id:int
        */

        let url = 'worlds/'+id;
        let query = [];
        return fetch(API_BASE + url, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            }
        })
    }

    create(wName, accessibility, guests, maxUsers, tag_array, desc){
        return fetch(API_BASE + 'worlds/', {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken(),
                'Content-Type': 'application/json',
            },
            // TODO: change hashed_password to password after backend update
            body: JSON.stringify({name: wName, public: accessibility, allow_guests: guests, world_map:"", max_users:maxUsers, tags:tag_array, description: desc})
        })
    }

    inviteJoin(inviteToken){
        // change url
        return fetch(API_BASE + 'worlds/invite/' + inviteToken, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    generateLink(world_id){

        return fetch(API_BASE + 'invitation/' + world_id, {
            method: 'POST',
            mode: 'cors',
            headers:{
                "Authorization" : "Bearer " + AuthenticationService.getToken()
            }
        })
        
    }

    join_world(world_id){

        return fetch(API_BASE + 'worlds/' + world_id + '/users',{

            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer " + AuthenticationService.getToken()
            }
        })

    }

    getAllReports(world, reporter, reviewed, banned, order_by, order, page, limit){

        let url = 'worlds/reports/';
        let query = [];
    
        if(world !== undefined && world !== '')
            query.push('world=' + world);

        if(reporter !== undefined && reporter !== '')
            query.push('reporter=' + reporter);

        if(reviewed !== undefined)
            query.push("reviewed=" + reviewed);
        
        if(banned !== undefined)
            query.push("banned=" + banned);
        
        if(order_by !== undefined)
            query.push("order_by=" + order_by);
        
        if(order !== undefined)
            query.push("order=" + order);
        
        if(page !== undefined)
            query.push("page=" + page);

        if(limit !== undefined)
            query.push("limit=" + limit);

        console.log(query);
        if(query.length !== 0)
            url = url.concat('?'+query.join('&'));

        console.log(url);

        return fetch(API_BASE + url , {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            }
        })
    }

    reviewWorldReport(world_id, reporter, reviewed){

        return fetch(API_BASE + "worlds/" + world_id + "/reports", { 
            method: 'PUT',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            },
            body: JSON.stringify({reporter: reporter, reviewed: reviewed})
        }) 
    }

    banWorld(world_id, status){

        // 0: normal, 1: banned, 2: deleted
        return fetch(API_BASE + 'worlds/' + world_id, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            },
            body: JSON.stringify({status: status})
        })
    }

}

export default new WorldService();