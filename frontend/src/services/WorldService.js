import {API_BASE} from "config";

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
                    //"Authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTkwMTQyNTEsInN1YiI6IjEiLCJpc19ndWVzdF91c2VyIjpmYWxzZX0.5Xk3rXUsLE0MNwvpnqeZlo9Z7lmXb9RtT1JYcw3R_OM" 
                }
            })
}

}

export default new WorldService();