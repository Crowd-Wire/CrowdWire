import create from "zustand";
import { combine } from "zustand/middleware";
import { Device } from "mediasoup-client";
import { detectDevice, Transport } from "mediasoup-client/lib/types";
import { useConsumerStore } from "./useConsumerStore";

export const getDevice = () => {
  try {
    let handlerName = detectDevice();
    if (!handlerName) {
      console.warn(
        "mediasoup does not recognize this device, so ben has defaulted it to Chrome74"
      );
      handlerName = "Chrome74";
    }
    return new Device({ handlerName });
  } catch {
    return null;
  }
};

export const useRoomStore = create(
  combine(
    {
      rooms: {} as Record<
        string,
        { 
          recvTransport: Transport | null,
          sendTransport: Transport | null,
        }
      >,
      device: getDevice(),
    },
    (set) => ({
      addRoom: (roomId: string) =>
        set((s) => {
          return {
            rooms : {
              ...s.rooms,
              [roomId]: {
                recvTransport: null,
                sendTransport: null
              }
            },
            device: s.device,
          }
        }),
      removeRoom: (roomId: string) =>
        set((s) => {
          if (s.rooms[roomId]) delete s.rooms[roomId];
          return {
            rooms: {
              ...s.rooms
            },
            device: s.device,
          }
        }),
      addTransport: (direction: string, transport: Transport, roomId: string) =>
        set((s) => {
          if (direction === "recv") {
            return {
              rooms: {
                ...s.rooms,
                [roomId]: {
                  recvTransport: transport,
                  sendTransport: s.rooms[roomId].sendTransport,
                }
              },
              device: s.device
            }
          } else {
            return {
              rooms: {
                ...s.rooms,
                [roomId]: {
                  recvTransport: s.rooms[roomId].recvTransport,
                  sendTransport: transport,
                }
              },
              device: s.device
            }
          }
        }),
      set,
    })
  )
);
