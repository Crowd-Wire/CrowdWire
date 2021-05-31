import { API_BASE } from "config";
import AuthenticationService from "./AuthenticationService";

class UserService {
    

    getUserInfo(){
        let url = 'users/me'
        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    updateUserInfo(user_id,email,name,birthdate){
        let json_body = {}
        if(email)
            json_body['email'] = email
        if(name)
            json_body['name'] = name
        
        if(birthdate)
            json_body['birth'] = birthdate
        
        return fetch(API_BASE + 'users/' + user_id, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(json_body)
        })
        
    }

    updateUserPassword(old_password, new_password) {
        let json_body = {};
        if (old_password){
            json_body['old_password'] = old_password;
        }

        if (new_password){
            json_body['new_password'] = new_password;
        }
        return fetch(API_BASE + 'users/password-update/', {
            method: 'PUT',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(json_body)
        })
    }
}

export default new UserService();