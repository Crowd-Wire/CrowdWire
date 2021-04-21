import {API_BASE} from "config";
import AuthenticationService from "./AuthenticationService";

class WorldService {

    search(search, tags) {
        /*
            search: string,
            tags: List[string]
        */

        let url = 'worlds/';
        let query = [];
        
        if(search != "")
            query.push('search='+search);
        
        if(tags.length != 0)
            query.push('tags='+tags.join('&tags='));

        if(query.length != 0)
            url = url.concat('?'+query.join('&'));


        return fetch(API_BASE + url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    "Authorization" : "Bearer "+ AuthenticationService.getToken()
                }
            })
}

}

export default new WorldService();