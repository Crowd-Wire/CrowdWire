import { Consumer } from "mediasoup-client/lib/types";
import create from "zustand";
import { combine } from "zustand/middleware";

export const useConsumerStore = create(
  combine(
    {
      consumerMap: {} as Record<
        string,
        { consumerAudio: Consumer;
          volume: number;
          consumerVideo: Consumer;
          active: boolean;
          videoToggle: boolean;
          audioToggle: boolean;
        }
      >,
    },
    (set) => ({
      setVolume: (userId: string, volume: number) => {
        set((s) =>
          userId in s.consumerMap
            ? {
                consumerMap: {
                  ...s.consumerMap,
                  [userId]: {
                    ...s.consumerMap[userId],
                    volume,
                  },
                }
              }
            : s
        );
      },
      add: (c: Consumer, userId: string, kind: string) =>
        set((s) => {
          let volume = 100;
          let otherConsumer = null;
          let videoToggle = false;
          let audioToggle = false;
          if (userId in s.consumerMap) {
            const x = s.consumerMap[userId];
            volume = x.volume;
            videoToggle = x.videoToggle;
            audioToggle = x.audioToggle;
            if (kind == "audio") {
              otherConsumer = x.consumerVideo;
              if (x.consumerAudio) x.consumerAudio.close();
            } else if (kind == "video") {
              otherConsumer = x.consumerAudio;
              if (x.consumerVideo) x.consumerVideo.close();
            }
          }
          if (kind == "audio") {
            return {
              consumerMap: {
                ...s.consumerMap,
                [userId]: {
                  consumerAudio: c,
                  volume,
                  consumerVideo: otherConsumer,
                  active: false,
                  videoToggle,
                  audioToggle
                },
              }
            };
          } else if (kind == "video") {
            return {
              consumerMap: {
                ...s.consumerMap,
                [userId]: {
                  consumerVideo: c,
                  volume,
                  consumerAudio: otherConsumer,
                  active: false,
                  videoToggle,
                  audioToggle
                },
              }
            };
          }
        }),
      addAudioToggle: (userId: string, audioToggle: boolean) =>
        set((s) => {
          if (s.consumerMap[userId]) {
            let user = {...s.consumerMap[userId]}
            user.audioToggle = audioToggle
            return {
              consumerMap: {
                ...s.consumerMap,
                [userId]: user,
              }
            };
          }
        }),
      addVideoToggle: (userId: string, videoToggle: boolean) =>
        set((s) => {
          if (s.consumerMap[userId]) {
            let user = {...s.consumerMap[userId]}
            user.videoToggle = videoToggle
            return {
              consumerMap: {
                ...s.consumerMap,
                [userId]: user,
              }
            };
          }
        }),
      addActiveSpeaker: (userId: string) =>
        set((s) => {
          if (s.consumerMap[userId]) {
            const user = {...s.consumerMap[userId]}
            user.active = true
            return {
              consumerMap: {
                ...s.consumerMap,
                [userId]: user,
              }
            };
          }
        }),
      removeActiveSpeaker: (userId: string) =>
        set((s) => {
          if (s.consumerMap[userId]) {
            const user = {...s.consumerMap[userId]}
            user.active = false
            return {
              consumerMap: {
                ...s.consumerMap,
                [userId]: user,
              }
            };
          }
        }),
      closeAll: () =>
        set((s) => {
          for (const value of Object.values(s.consumerMap)) {
            if (value.consumerAudio && !value.consumerAudio.closed) {
              value.consumerAudio.close()
            }
            if (value.consumerVideo && !value.consumerVideo.closed) {
              value.consumerVideo.close()
            }
          };
          return {
            consumerMap: {},
          };
        }),
    })
  )
);
