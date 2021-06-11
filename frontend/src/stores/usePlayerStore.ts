import create from "zustand";
import { combine } from "zustand/middleware";

import { useConsumerStore } from "webrtc/stores/useConsumerStore";

interface Vector {
    x: number;
    y: number;
}

interface Player {
    position: Vector;
    velocity: Vector;
}

interface Player2 {
    requested: boolean
}

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


const usePlayerStore = create(
    combine(
        {
            connecting: false,
            groups: {} as Record<string, string[]>,
            players: {} as Record<string, Player>,
            groupPlayers: {} as Record<string, Player2>,
            requestsToSpeak: 0,
            users_info: {} as Record<string, WorldUser> | null,
        },
        (set) => ({
            setConnecting: (connecting: boolean) => {
                return set(() => {
                    return { connecting }
                })
            },
            connectPlayers: (snapshot: Record<string, Vector>, users_data) => {
                return set(() => {
                    const players = {};
                    for (const [id, position] of Object.entries(snapshot)) {
                        players[id] = { position, velocity: { x: 0, y: 0 } };
                    }
                    console.log(users_data)
                    usePlayerStore.getState().setUsersInfo(users_data)
                    return { players };
                });
            },
            connectPlayer: (id: string, position: Vector, user_info) => {
                return set((s) => {
                    const players = {...s.players};
                    players[id] = { position, velocity: { x: 0, y: 0 } };
                    usePlayerStore.getState().addUserInfo(user_info)
                    return { players };
                });
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
            disconnectPlayer: (id: string) => {
                return set((s) => {
                    const players = {...s.players};
                    if (id in players) delete players[id];
                    usePlayerStore.getState().removeUserInfo(id)
                    return { players };
                });
            },
            wirePlayers: (ids: string[], merge: boolean) => {
                return set((s) => {
                    if (merge) {
                        const groupPlayers = {...s.groupPlayers};
                        for (const id of ids)
                            groupPlayers[id] = { requested: false};
                        return { groupPlayers };
                    }
                    const groupPlayers = {} as Record<string, Player2>;
                    for (const id of ids)
                        groupPlayers[id] = { requested: false};
                    return { ...s, groupPlayers };
                }, !merge);
            },
            unwirePlayers: (ids: string[], merge: boolean) => {
                return set((s) => {
                    if (merge) {
                        const groupPlayers = {...s.groupPlayers};
                        for (const id of ids) {
                            useConsumerStore.getState().closePeer(id);
                            delete groupPlayers[id];
                        }
                        return { groupPlayers };
                    }
                    const groupPlayers = {} as Record<string, Player2>;
                    for (const id of ids)
                        groupPlayers[id] = { requested: false};
                    return { ...s, groupPlayers };
                }, !merge);
            },
            movePlayer: (id: string, position: Vector, velocity: Vector) => {
                return set((s) => {
                    const players = {...s.players};
                    players[id] = { position: position, velocity: velocity };
                    return { players };
                });
            },
            setGroups: (grps: Record<string, string[]>) => {
                return set((s) => {
                    return { ...s, groups: grps };
                }, true);
            },
            setRequested: (user_id:string, has_requested: boolean) => {
                return set((s) => {
                    let groupPlayers = {...s.groupPlayers}
                    groupPlayers[user_id].requested = has_requested;
                    let requestsToSpeak = s.requestsToSpeak;
                    if (has_requested)
                        requestsToSpeak += 1;
                    else
                        requestsToSpeak -= 1;
                    return { ...s,
                        groupPlayers,
                        requestsToSpeak };
                })
            },
        })
    )
);

export default usePlayerStore;
