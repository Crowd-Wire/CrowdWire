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
                // TODO: change hashed_password to password after backend update
                body: JSON.stringify({name:name, email:email, hashed_password:password, birth:birth})
            })
}

}

export default new AuthenticationService();