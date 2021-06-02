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
    last_pos?: any;
    map?: string;
}

const colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

function randomIntFromInterval(max) { // min and max included 
    return Math.floor(Math.random() * (max + 1))
}

const rndInt = randomIntFromInterval(20)

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
                    user.color = colorArray[randomIntFromInterval(20)]
                    let new_users_info = {...s.users_info};
                    new_users_info[user.user_id] = user
                    return {
                        users_info: new_users_info,
                    }
                })
            },
            setUsersInfo: (users_data) => {
                return set((s) => {
                    for (var key in users_data) {
                        users_data[key].color = colorArray[randomIntFromInterval(20)]
                    }
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
