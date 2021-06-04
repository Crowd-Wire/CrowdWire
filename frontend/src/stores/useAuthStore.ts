import { string } from "prop-types";
import createStore from "zustand";
import { combine } from "zustand/middleware";
import { configurePersist } from 'zustand-persist';
import persist from 'stores/utils/persist.js';


const useAuthStore = createStore(
    persist(
        {
            key:"auth",
        },
        (set) => ({
            token: String as null,
            expire_date: String as null,
            guest_uuid: String as null,
            last_location: String as null,
            is_superuser: false,
            login: (token: string, expire_date: string, is_superuser: boolean) => {
                set((state) => ({
                    token:token,
                    expire_date:expire_date,
                    is_superuser: is_superuser
                }))
            },
            joinGuest: (token: string, expire_date: string, guest_uuid: string) => {
                set((state) => ({
                    token:token, 
                    expire_date:expire_date, 
                    guest_uuid:guest_uuid
                }))
            },
            leave: () => {
                set((state) => ({
                    token: null,
                    expire_date: null,
                    guest_uuid: null
                }))
            },
            updateToken: (token: string, expire_date: string) => {
                set((state) => ({
                        token: token,
                        expire_date: expire_date
                }))
            },
            setLastLocation: (loc) => {
                if (loc !== "/login" && loc !== "login") {
                    set((state) => ({
                        last_location: loc
                    }))
                }
            }
        })
    ),
)

export default useAuthStore;
