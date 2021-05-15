import create from "zustand";
import { combine } from "zustand/middleware";

interface Role {
    name: string;
    is_default: boolean;
    walk: boolean;
    talk: boolean;
    talk_conference: boolean;
    world_mute: boolean;
    role_manage: boolean;
    conference_manage: boolean;
    chat: boolean;
    invite: boolean;
    ban: boolean;
    role_id: number;
}

interface WorldUser {
    user_id: number;
    world_id: number;
    avatar: string;
    role: Role;
    username: string;
    in_conference: any;
}

const useWorldUserStore = create(
    combine(
        {   
            world_user: null as WorldUser | null,
        },
        (set) => ({
            joinWorld: (world_user: WorldUser) => {
                return set((s) => {
                    world_user.in_conference = false;
                    return { world_user };
                });
            },
            updateConference: (inConference: any) => {
                return set((s) => {
                    s.world_user.in_conference = inConference;
                    return {...s};
                })
            },
            permissionToSpeak: (permit: boolean) => {
                return set((s) => {
                    s.world_user.role.talk_conference = permit;
                    return {...s};
                })
            }
        })
    )
);

export default useWorldUserStore;