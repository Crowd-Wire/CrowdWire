import { API_BASE } from "config";
import AuthenticationService from "./AuthenticationService";

class UserService {

    getUserDetails(id) {
        /*
            id:int
        */
        let url = 'users/' + id + '/';
        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

}

export default new UserService();