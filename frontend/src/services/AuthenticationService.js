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
        if(localStorage.getItem("auth")!==null)
            return JSON.parse(localStorage.getItem("auth"))["token"];
        return null;
    }

    setToken(auth, type) {
        if(type==="GUEST"){
            useAuthStore.getState().login(auth.access_token, auth.expire_date, auth.guest_uuid);
        }
        else if(type==="AUTH"){
            useAuthStore.getState().login(auth.access_token, auth.expire_date);
        }
        console.log(useAuthStore.getState());

        localStorage.setItem("auth",JSON.stringify(
            {"token":auth.access_token,
            "expire_date":auth.expire_date}
            )
        );
    }

    logout(){
        const st = useAuthStore.getState();
        if(st.guestUser){
            console.log("GUEST")
            useAuthStore.getState().leaveGuest()
        }
        else if(st.registeredUser){
            console.log("REGISTERED USER")
            useAuthStore.getState().leaveRegistered()
        }
        console.log(st.registeredUser);
    }

    joinAsGuest(){
        return fetch(API_BASE + 'join-guest/', {
            method: 'POST',
            mode: 'cors'
        })
    }

}

export default new AuthenticationService();