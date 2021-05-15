import { API_BASE } from "config";

import AuthenticationService from "services/AuthenticationService.js";

class RoleService {
    getAllRoles(id) {
        return fetch(API_BASE + 'worlds/'+id+'/roles?page=1&limit=10', {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()  
            }
        })
    }


}

export default new RoleService();