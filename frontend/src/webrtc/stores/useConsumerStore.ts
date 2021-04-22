import { Consumer } from "mediasoup-client/lib/types";
import create from "zustand";
import { combine } from "zustand/middleware";

export const useConsumerStore = create(
  combine(
    {
      consumerMap: {} as Record<
        string,
        { consumerAudio: Consumer;
          consumerVideo: Consumer;
          consumerMedia: Consumer;
          volume: number;
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
          let consumerAudio = null;
          let consumerVideo = null;
          let consumerMedia = null;
          let videoToggle = false;
          let audioToggle = false;
          
          if (kind == 'audio')
            consumerAudio = c;
          else if (kind == 'video')
            consumerVideo = c;
          else
            consumerMedia = c;

          if (userId in s.consumerMap) {
            const x = s.consumerMap[userId];
            volume = x.volume;
            videoToggle = x.videoToggle;
            audioToggle = x.audioToggle;
            if (kind == "audio") {
              consumerVideo = x.consumerVideo;
              consumerMedia = x.consumerMedia;
              if (x.consumerAudio) x.consumerAudio.close();
            } else if (kind == "video") {
              consumerAudio = x.consumerAudio;
              consumerMedia = x.consumerMedia;
              if (x.consumerVideo) x.consumerVideo.close();
            } else {
              consumerAudio = x.consumerAudio;
              consumerVideo = x.consumerVideo;
              if (x.consumerMedia) x.consumerMedia.close();
            }
          }
          return {
            consumerMap: {
              ...s.consumerMap,
              [userId]: {
                consumerAudio,
                consumerVideo,
                consumerMedia,
                volume,
                active: false,
                videoToggle,
                audioToggle
              },
            }
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
      closeMedia: (userId: string) =>
        set((s) => {
          if (s.consumerMap[userId]) {
            s.consumerMap[userId].consumerMedia?.close();
            let user = {...s.consumerMap[userId]}
            user.consumerMedia = null;
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
            if (value.consumerMedia && !value.consumerMedia.closed) {
              value.consumerMedia.close()
            }
          };
          return {
            consumerMap: {},
          };
        }),
    })
  )
);
