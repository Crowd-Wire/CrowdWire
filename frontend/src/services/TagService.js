import {API_BASE} from "config";

class TagService {

    getAll() {
        return fetch(API_BASE + 'tags/', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    //"Authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTkwMTQyNTEsInN1YiI6IjEiLCJpc19ndWVzdF91c2VyIjpmYWxzZX0.5Xk3rXUsLE0MNwvpnqeZlo9Z7lmXb9RtT1JYcw3R_OM" 
                }
            })
}

}

export default new TagService();