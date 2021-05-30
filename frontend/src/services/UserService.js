import { API_BASE } from "config";
import AuthenticationService from "./AuthenticationService";

class UserService {

    getUserDetails(id) {
        /*
            id:int
        */
        let url = 'users/' + id + '/';

   

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

    search(email, normal, banned, order_by, order, page, limit) {
        let url = 'users/';
        let query = [];

        if(email)
            query.push('email=' + email);
        
        if(normal !== null)
            query.push('normal=' + normal)

        if(banned !== null)
            query.push('banned=' + banned)

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
            json_body['birthdate'] = birthdate
        
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

}

export default new UserService();