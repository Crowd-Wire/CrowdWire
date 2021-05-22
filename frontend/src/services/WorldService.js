import { API_BASE } from "config";
import AuthenticationService from "./AuthenticationService";

class WorldService {

    search(search, tags, type = "all", page) {
        /*
            search: string,
            tags: List[string]
            joined: boolean
            page: int
        */

        let url = 'worlds/';
        let query = [];

        if (search !== "")
            query.push('search=' + search);

        if (tags.length !== 0)
            query.push('tags=' + tags.join('&tags='));

        // when joined searchs for the visited worlds
        query.push('visibility=' + type);

        // pagination
        query.push('page=' + page);

        if (query.length !== 0)
            url = url.concat('?' + query.join('&'));

        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    getWorldDetails(path) {

        /*
            id:int
        */

        let url = 'worlds/' + path;
        let query = [];
        return fetch(API_BASE + url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    deleteWorld(id) {
        /*
            id:int
        */

        let url = 'worlds/' + id;
        let query = [];
        return fetch(API_BASE + url, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    create(wName, accessibility, guests, maxUsers, tag_array, desc) {
        return fetch(API_BASE + 'worlds/', {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken(),
                'Content-Type': 'application/json',
            },
            // TODO: change hashed_password to password after backend update
            body: JSON.stringify({
                name: wName,
                public: accessibility,
                allow_guests: guests,
                world_map: "",
                max_users: maxUsers,
                tags: tag_array,
                description: desc
            })
        })
    }

    /**
     * Receives an object for the request's body content. 
     * 
     * Unrecognized parameters will be ignored and undefined values will be removed by JSON.stringify.
     */
    putWorld({ wName, accessibility, guests, maxUsers, tag_array, desc, worldMap }) {

        return fetch(API_BASE + 'worlds/', {
            method: 'PUT',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: wName,
                public: accessibility,
                allow_guests: guests,
                world_map: worldMap,
                max_users: maxUsers,
                tags: tag_array,
                description: desc
            })
        })
    }

    inviteJoin(inviteToken) {
        // change url
        return fetch(API_BASE + 'worlds/invite/' + inviteToken, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })
    }

    generateLink(world_id) {

        return fetch(API_BASE + 'invitation/' + world_id, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })

    }


    joinWorld(world_id) {

        return fetch(API_BASE + 'worlds/' + world_id + '/users', {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization": "Bearer " + AuthenticationService.getToken()
            }
        })

    }

}

export default new WorldService();
