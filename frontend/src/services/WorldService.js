import { API_BASE } from "config";
import AuthenticationService from "./AuthenticationService";

class WorldService {

    search(search, tags, visibility, banned, deleted, normal, creator, order_by, order, page, limit) {
        /*
            search: string,
            tags: List[string]
            visibility: boolean
            page: int
        */

        let url = 'worlds/';
        let query = [];
<<<<<<< HEAD

        if (search !== "")
            query.push('search=' + search);

        if (tags.length !== 0)
            query.push('tags=' + tags.join('&tags='));

        // when joined searchs for the visited worlds
        query.push('visibility=' + type);
=======
    
        if(search !== "")
            query.push('search='+search);
        
        if(tags.length !== 0)
            query.push('tags='+tags.join('&tags='));
        
        if(visibility !== null)
            query.push('visibility=' + visibility);
>>>>>>> 865a8700f2632791b68022e5a81c81b34d5989f4

        if(banned !== null)
            query.push('banned=' + banned);

        if(deleted !== null)
            query.push('deleted=' + deleted);

        if(normal !== null)
            query.push('normal=' + normal);

        if(creator !== null)
            query.push('creator=' + creator);

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

    getWorldDetails(path) {

        /*
            id:int
        */

        let url = 'worlds/' + path;
        let query = [];
        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    deleteWorld(id) {
        /*
            id:int
        */

        let url = 'worlds/' + id;
        let query = [];
        return fetch(API_BASE + url, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    create(wName, accessibility, guests, maxUsers, tag_array, desc) {
        return fetch(API_BASE + 'worlds/', {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken(),
                'Content-Type': 'application/json',
            },
            // TODO: change hashed_password to password after backend update
            body: JSON.stringify({
                name: wName,
                public: accessibility,
                allow_guests: guests,
                max_users: maxUsers,
                tags: tag_array,
                description: desc
            })
        })
    }

    /**
     * Receives an object for the request's body content. 
     * 
     * Unrecognized parameters will be ignored and undefined values will be removed by JSON.stringify.
     */
    putWorld({ wName, accessibility, guests, maxUsers, tag_array, desc, worldMap }) {

        return fetch(API_BASE + 'worlds/', {
            method: 'PUT',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: wName,
                public: accessibility,
                allow_guests: guests,
                world_map: worldMap,
                max_users: maxUsers,
                tags: tag_array,
                description: desc
            })
        })
    }

    inviteJoin(inviteToken) {
        // change url
        return fetch(API_BASE + 'worlds/invite/' + inviteToken, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    generateLink(world_id) {

        return fetch(API_BASE + 'invitation/' + world_id, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
<<<<<<< HEAD

    }
=======
        
    }

    join_world(world_id){
>>>>>>> 865a8700f2632791b68022e5a81c81b34d5989f4

    joinWorld(world_id) {

<<<<<<< HEAD
        return fetch(API_BASE + 'worlds/' + world_id + '/users', {
            method: 'GET',
=======
            method: 'POST',
>>>>>>> 865a8700f2632791b68022e5a81c81b34d5989f4
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })

    }
<<<<<<< HEAD
=======

    getAllReports(world, reporter, reviewed, banned, order_by, order, page, limit){

        let url = 'worlds/reports/';
        let query = [];
    
        if(world !== null && world !== '')
            query.push('world=' + world);

        if(reporter !== null && reporter !== '')
            query.push('reporter=' + reporter);

        if(reviewed !== null)
            query.push("reviewed=" + reviewed);
        
        if(banned !== null)
            query.push("banned=" + banned);
        
        if(order_by !== null)
            query.push("order_by=" + order_by);
        
        if(order !== null)
            query.push("order=" + order);
        
        if(page !== null)
            query.push("page=" + page);

        if(limit !== null)
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

>>>>>>> 865a8700f2632791b68022e5a81c81b34d5989f4
}

export default new WorldService();
