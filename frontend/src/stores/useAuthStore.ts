import { useContext } from "react";
import AppContext from 'AppContext.js';
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
                return set(() => {
                    const myContext = useContext(AppContext);
                    myContext.changeAuth("REGISTERED")
                    return { registeredUser: {token: token, expire_date: expire_date} };
                })
            },
            joinGuest: (token: string, expire_date: string, guest_uuid: string) => {
                return set(() => {
                    const myContext = useContext(AppContext);
                    myContext.changeAuth("GUEST")
                    return { guestUser: {token: token, expire_date: expire_date, guest_uuid: guest_uuid} };
                })
            },
            leaveGuest: () => {
                return set(() => {
                    const myContext = useContext(AppContext);
                    myContext.changeAuth(null)
                    return {guestUser: null};
                })
            },
            leaveRegistered: () => {
                return set(() => {
                    const myContext = useContext(AppContext);
                    myContext.changeAuth(null)
                    return {registeredUser: null};
                })
            },
        })
    ),
)

export default useAuthStore;
