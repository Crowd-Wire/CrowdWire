import { API_BASE } from "config";

import AuthenticationService from "services/AuthenticationService.js";

class RoleService {
    getAllRoles(id) {
        return fetch(API_BASE + 'worlds/'+id+'/roles?page=1', {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()  
            }
        })
    }
    addRole(world_id, name) {
        return fetch(API_BASE + 'worlds/'+world_id+'/roles/', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ world_id: world_id, name: name, is_default: false})
        })
    }
    getWorldUsersWRoles(world_id){
        return fetch(API_BASE + 'worlds/'+world_id+'/users', {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()  
            }
        })
    }
}

export default new RoleService();