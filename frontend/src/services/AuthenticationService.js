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
            body: JSON.stringify({ name: name, email: email, hashed_password: password, birth: birth })
        })
    }

    confirmEmail(token) {
        return fetch(API_BASE + 'confirm/' + token, {
            method: 'GET',
            mode: 'cors',
        });
    }

    getToken() {
        return useAuthStore.getState().token;
    }

    setToken(auth, type) {
        if(type === "GUEST"){
            useAuthStore.getState().joinGuest(auth.access_token, auth.expire_date, auth.guest_uuid);
        }
        else if(type === "AUTH"){
            useAuthStore.getState().login(auth.access_token, auth.expire_date, auth.is_superuser);
        }
        else if(type === "REGISTER"){
            useAuthStore.getState().login(auth.access_token, auth.expire_date, false);
        }
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
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
    }

    googleAuth(token){
        return fetch(API_BASE + 'login/google',{ 
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({token: token})
        })
    }
}

export default new AuthenticationService();