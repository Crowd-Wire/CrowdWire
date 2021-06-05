import {API_BASE} from "config";
import AuthenticationService from './AuthenticationService';

class TagService {

    getAll() {
        return fetch(API_BASE + 'tags/', {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()  
            }
        })
    }

}

export default new TagService();