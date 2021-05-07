import { string } from "prop-types";
import create from "zustand";
import { combine } from "zustand/middleware";

interface Guest {
    token: String;
    expire_date: String;
    guest_uuid: String;
}

interface Registered_User {
    token: String;
    expire_date: String;
}

const useAuthStore = create(
    combine(
        {
            guestUser: null as Guest | null,
            registeredUser: null as Registered_User | null,
        },
        (set) => ({
            login: (token: string, expire_date: string) => {
                console.log("login")
                return set(() => {
                    return { registeredUser: {token: token, expire_date: expire_date} };
                })
            },
            joinGuest: (token: string, expire_date: string, guest_uuid: string) => {
                console.log("loginGuest")
                return set(() => {
                    return { guestUser: {token: token, expire_date: expire_date, guest_uuid: guest_uuid} };
                })
            },
            leave: () => {
                console.log("leave")
                return set(() => {
                    return {guestUser: null, registeredUser: null};
                })
            },
            updateToken: (token: string, expire_date: string) => {
                console.log("update")
                return set((s) => {
                    if(s.registeredUser!== null){
                        return { ...s, registerdUser: {token: token, expire_date: expire_date}};
                    }
                    return {...s, guestUser: {token: token, expire_date: expire_date, guest_uuid:s.guestUser.guest_uuid}};
                })
            }
        })
    ),
)

export default useAuthStore;
