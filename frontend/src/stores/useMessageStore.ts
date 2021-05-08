import create from "zustand";
import { combine } from "zustand/middleware";


interface Message {
    text: string;
    date: string;
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
                    messages.push(message)
                    console.log(messages)
                    return { messages };
                });
            },
        })
    )
);

export default useMessageStore;
