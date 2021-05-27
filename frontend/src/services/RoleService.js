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

    editRole(world_id, state, id) {
        console.log(state)
        console.log(id)
        return fetch(API_BASE + 'worlds/'+world_id+'/roles/'+id, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            // TODO: change hashed_password to password after backend update
            body: JSON.stringify({ name: state.name, interact: state.obj_int, walk: state.walk, talk: state.talk, talk_conference: state.talk_conf,
            world_mute: state.world_mute,role_manage: state.role_manage, conference_manage: state.conf_manage, chat: state.chat, invite: state.inv_users, ban: state.ban
        })
        })
    }
}

export default new RoleService();