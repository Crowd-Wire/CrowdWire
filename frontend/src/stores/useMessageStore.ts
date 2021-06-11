import create from "zustand";
import { combine } from "zustand/middleware";
import useWorldUserStore from "stores/useWorldUserStore";
import usePlayerStore from "stores/usePlayerStore";


interface Message {
    from: string;
    text: string;
    date: string;
    color: string;
    to: string;
}

const useMessageStore = create(
    combine(
        {   
            messages: [] as Message[],
        },
        (set) => ({
            addMessage: (message: Message) => {
                return set((s) => {
                    const messages = [...s.messages];
                    let from = message.from;
                    let color = 'white';
                    if (from == useWorldUserStore.getState().world_user.user_id)
                        from = useWorldUserStore.getState().world_user.username
                    else if (from in usePlayerStore.getState().users_info) {
                        color = usePlayerStore.getState().users_info[from].color
                        from  = usePlayerStore.getState().users_info[from].username
                    }
                    message.from = from;
                    message.color = color;
                    messages.push(message)
                    return { messages };
                });
            },
        })
    )
);

export default useMessageStore;
