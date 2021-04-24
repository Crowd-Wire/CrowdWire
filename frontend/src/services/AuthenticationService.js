import { API_BASE } from "config";

class AuthenticationService {

    login(email, password) {
        return fetch(API_BASE + 'login', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: "username=" + email + "&password=" + password
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
            body: JSON.stringify({ name: name, email: email, hashed_password: password, birth: birth })
        })
    }
    getToken() {
        return JSON.parse(localStorage.getItem("auth"))["token"];
    }

    setToken(auth) {
        localStorage.setItem("auth",JSON.stringify(
            {"token":auth.access_token,
            "expire_date":auth.expire_date}
            )
        );
    }

    joinAsGuest(){
        return fetch(API_BASE + 'join-guest/', {
            method: 'POST',
            mode: 'cors'
        })
    }

}

export default new AuthenticationService();