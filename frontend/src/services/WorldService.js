import {API_BASE} from "config";
import AuthenticationService from "./AuthenticationService";

class WorldService {

    search(search, tags, joined = false, page = 1) {
        /*
            search: string,
            tags: List[string]
            joined: boolean
            page: int
        */

        let url = 'worlds/';
        let query = [];
        
        if(search != "")
            query.push('search='+search);
        
        if(tags.length != 0)
            query.push('tags='+tags.join('&tags='));
        
        // when joined searchs for the visited worlds
        query.push('joined=' + joined);

        // pagination
        query.push('page=' + page);

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