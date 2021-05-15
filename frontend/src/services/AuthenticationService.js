import { API_BASE } from "config";

import useAuthStore from "stores/useAuthStore.ts";

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
        return useAuthStore.getState().token;
    }

    setToken(auth, type) {
        if(type==="GUEST"){
            useAuthStore.getState().joinGuest(auth.access_token, auth.expire_date, auth.guest_uuid);
        }
        else if(type==="AUTH"){
            useAuthStore.getState().login(auth.access_token, auth.expire_date);
        }
        console.log(useAuthStore.getState().token)
    }

    logout(){
        useAuthStore.getState().leave();

    }

    refreshToken(){
        return fetch(API_BASE + 'reset-token', {
            method: 'POST',
            mode: 'cors',
            headers:{
                "Authorization" : "Bearer "+ this.getToken() 
            }
        });
    }

    joinAsGuest(){
        return fetch(API_BASE + 'join-guest', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'accept': 'application/json'
            },
        })
    }

}

export default new AuthenticationService();