import {API_BASE} from "config";

class AuthenticationService {

    login(email, password) {
        return fetch(API_BASE + 'login', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: "username="+email+"&password="+password
            })
    }

    register(email, password, name, birth) {
        return fetch(API_BASE + 'register', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name:name, email:email, birth:birth, password:password})
            })
}

}

export default new AuthenticationService();