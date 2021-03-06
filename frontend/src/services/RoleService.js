import { API_BASE } from "config";

import AuthenticationService from "services/AuthenticationService.js";

class RoleService {
    getAllRoles(id) {
        return fetch(API_BASE + 'worlds/'+id+'/roles/', {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()  
            }
        })
    }

    deleteRole(id, role_id) {
        return fetch(API_BASE + 'worlds/'+id+'/roles/'+role_id, {
            method: 'DELETE',
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
                'Content-Type': 'application/json',
                'Authorization' : "Bearer "+ AuthenticationService.getToken()  
            },
            body: JSON.stringify({ world_id: world_id, name: name, is_default: false})
        })
    }

    assignRoleToUser(world_id, role_id,user_id) {
        return fetch(API_BASE + 'worlds/'+world_id+'/roles/'+role_id+'/users/'+user_id, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : "Bearer "+ AuthenticationService.getToken()  
            },
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

    editRole(world_id, state, id) {
        return fetch(API_BASE + 'worlds/'+world_id+'/roles/'+id, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: state.name, interact: state.obj_int, walk: state.walk, talk: state.talk, talk_conference: state.talk_conf,
            world_mute: state.world_mute,role_manage: state.role_manage, conference_manage: state.conf_manage, chat: state.chat, invite: state.inv_users, ban: state.ban
        })
        })
    }
}

export default new RoleService();