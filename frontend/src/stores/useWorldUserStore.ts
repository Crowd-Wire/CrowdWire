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
    user_id: string;
    world_id: number;
    avatar: string;
    role: Role;
    username: string;
    in_conference: string;
}

const useWorldUserStore = create(
    combine(
        {   
            world_user: null as WorldUser | null,
            users_info: {} as Record<string, WorldUser> | null,
        },
        (set) => ({
            joinWorld: (world_user: WorldUser) => {
                return set((s) => {
                    world_user.in_conference = null;
                    return { world_user };
                });
            },
            updateConference: (inConference: any) => {
                return set((s) => {
                    s.world_user.in_conference = inConference;
                    return {world_user: s.world_user};
                })
            },
            permissionToSpeak: (permit: boolean) => {
                return set((s) => {
                    s.world_user.role.talk_conference = permit;
                    return {world_user: s.world_user};
                })
            },
            addUserInfo: (user) => {
                return set((s) => {
                    let new_users_info = {...s.users_info};
                    new_users_info[user.user_id] = user
                    return {
                        users_info: new_users_info,
                    }
                })
            },
            setUsersInfo: (users_data) => {
                return set((s) => {
                    return {
                        users_info: users_data,
                    }
                })
            },
            removeUserInfo: (user_id) => {
                return set((s) => {
                    let new_users_info = {...s.users_info};
                    if (user_id in new_users_info) delete new_users_info[user_id]
                    return {
                        users_info: new_users_info,
                    }
                })
            },
        })
    )
);

export default useWorldUserStore;
