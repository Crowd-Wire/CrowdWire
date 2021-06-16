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
    color?: string;
    world_map?: string;
    last_pos?: any;
}

const useWorldUserStore = create(
    combine(
        {   
            showFileSharing: false,
            showIFrame: false,
            showMediaOffState: false,
            iFrame: '',
            world_user: null as WorldUser | null,
        },
        (set) => ({
            setShowFileSharing: () => {
                return set({showFileSharing: true});
            },
            setShowIFrame: (iFrame: string) => {
                return set({showIFrame: true, iFrame});
            },
            setShowMediaOffState: (showMediaOffState: boolean) => {
                return set({showMediaOffState});
            },
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
            updateWorldUserAvatarUsername: (avatar, username) => {
                return set((s) => {
                    let update_world_user = {...s.world_user}
                    update_world_user.avatar = avatar;
                    update_world_user.username = username;
                    return {
                        world_user: update_world_user
                    }
                })
            },
        })
    )
);

export default useWorldUserStore;
