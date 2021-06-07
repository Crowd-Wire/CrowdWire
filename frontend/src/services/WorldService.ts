import { API_BASE } from "config";
import AuthenticationService from "./AuthenticationService.js";

class WorldService {

    search(search, tags, visibility, banned, normal, creator, order_by, order, page, limit): Promise<Response> {
        /*
            search: string,
            tags: List[string]
            visibility: boolean
            page: int
        */
        let url = 'worlds/';
        let query = [];
    
        if(search !== "")
            query.push('search='+search);
        
        if(tags.length !== 0)
            query.push('tags='+tags.join('&tags='));
        
        if(visibility !== null)
            query.push('visibility=' + visibility);

        if(banned !== null)
            query.push('banned=' + banned);

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

        console.log(url);
        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    searchUsers(search, tags, visibility, order_by, order, page, limit): Promise<Response> {
        return this.search(search, tags, visibility, false, null, null, order_by, order, page, limit);
        // makes it easier to call the function
    }

    searchAdmin(search, tags, banned, normal, creator, order_by, order, page, limit): Promise<Response> {
        // makes it easier to call the function
        return this.search(search, tags, null, banned, normal, creator, order_by, order, page, limit);
    }

    getWorldDetails(path): Promise<Response> {
        /*
            id:int
        */
        let url = 'worlds/' + path;
        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    deleteWorld(id): Promise<Response> {
        /*
            id:int
        */
        let url = 'worlds/' + id;
        return fetch(API_BASE + url, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    create(wName, accessibility, guests, maxUsers, tag_array, desc): Promise<Response> {
        return fetch(API_BASE + "static/maps/default_map.json")
            .then((res) => res.json())
            .then((worldMap) => 
                fetch(API_BASE + 'worlds/', {
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
                        description: desc,
                        world_map: JSON.stringify(worldMap),
                    })
                })
            )
    }

    /**
     * Receives an object for the request's body content. 
     * 
     * Unrecognized parameters will be ignored and undefined values will be removed by JSON.stringify.
     */
    putWorld(world_id: number, body: { 
            wName?: string, 
            accessibility?: boolean, 
            guests?: boolean, 
            maxUsers?: number, 
            tag_array?: string[], 
            desc?: string, 
            worldMap?: string, 
            world_picture?: string }): Promise<Response> {
        return fetch(API_BASE + 'worlds/' + world_id, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: body.wName,
                public: body.accessibility,
                allow_guests: body.guests,
                world_map: body.worldMap,
                max_users: body.maxUsers,
                tags: body.tag_array,
                description: body.desc,
                profile_image: body.world_picture
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

    }

    joinWorld(world_id) {

        return fetch(API_BASE + 'worlds/' + world_id + '/users', {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })

    }

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

        if(query.length !== 0)
            url = url.concat('?'+query.join('&'));

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
    
   getWorldUser(world_id, user_id) {
        return fetch(API_BASE + 'worlds/' + world_id + "/users/" + user_id, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            },
        })
    }

    updateWorldUser(world_id, user_id, avatar, username) {
        return fetch(API_BASE + 'worlds/' + world_id + "/users/" + user_id, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()
            },
            body: JSON.stringify({username: username, avatar: avatar})
        })
    }

}

export default new WorldService();
