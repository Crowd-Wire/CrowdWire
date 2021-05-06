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
        const st = useAuthStore.getState()
        if(st.registeredUser && st.registeredUser.token)
            return useAuthStore.getState().registeredUser.token;
        if(st.guestUser && st.guestUser.token)
            return useAuthStore.getState().guestUser.token;
        return null;
    }

    setToken(auth, type) {
        console.log(useAuthStore.getState());
        if(type==="GUEST"){
            useAuthStore.getState().joinGuest(auth.access_token, auth.expire_date, auth.guest_uuid);
        }
        else if(type==="AUTH"){
            useAuthStore.getState().login(auth.access_token, auth.expire_date);
        }
        console.log(useAuthStore.getState());
    }

    logout(){
        const st = useAuthStore.getState();
        if(st.guestUser){
            useAuthStore.getState().leaveGuest()
        }
        else if(st.registeredUser){
            useAuthStore.getState().leaveRegistered()
        }
    }

    joinAsGuest(){
        return fetch(API_BASE + 'join-guest/', {
            method: 'POST',
            mode: 'cors'
        })
    }

}

export default new AuthenticationService();