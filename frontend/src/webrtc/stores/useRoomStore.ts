import create from "zustand";
import { combine } from "zustand/middleware";
import { Device } from "mediasoup-client";
import { detectDevice, Producer, Transport } from "mediasoup-client/lib/types";

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
          micProducer: Producer | null,
          camProducer: Producer | null,
          mediaProducer: Producer | null,
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
                sendTransport: null,
                micProducer: null,
                camProducer: null,
                mediaProducer: null
              }
            },
            device: s.device,
          }
        }),
      removeRoom: (roomId: string) =>
        set((s) => {
          let room = s.rooms[roomId];
          if (room) {
            if (room.micProducer) {room.micProducer.close()}
            if (room.camProducer) {room.camProducer.close()}
            if (room.mediaProducer) {room.mediaProducer.close()}
            if (room.recvTransport) {room.recvTransport.close()}
            if (room.sendTransport) {room.sendTransport.close()}
            delete s.rooms[roomId];
          }
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
                  micProducer: s.rooms[roomId].micProducer,
                  camProducer: s.rooms[roomId].camProducer,
                  mediaProducer: s.rooms[roomId].mediaProducer
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
                  micProducer: s.rooms[roomId].micProducer,
                  camProducer: s.rooms[roomId].camProducer,
                  mediaProducer: s.rooms[roomId].mediaProducer
                }
              },
              device: s.device
            }
          }
        }),
      addProducer: (roomId: string, producer: Producer, type: string) => {
        set((s) => {
          console.log(roomId)
          console.log(s.rooms[roomId])
          if (s.rooms[roomId]) {
            if (type === 'mic')
              s.rooms[roomId].micProducer = producer
            else if (type === 'cam')
              s.rooms[roomId].camProducer = producer
            else if (type === 'media')
              s.rooms[roomId].mediaProducer = producer
          }
          console.log(s)
          return {
            ...s,
          }
        })
      },
      removeProducer: (roomId: string, type: string) => {
        set((s) => {
          if (s.rooms[roomId]) {
            if (type === 'mic'){
              if (s.rooms[roomId].micProducer) s.rooms[roomId].micProducer.close()
              s.rooms[roomId].micProducer = null
            }
            else if (type === 'cam'){
              if (s.rooms[roomId].camProducer) s.rooms[roomId].camProducer.close()
              s.rooms[roomId].camProducer = null
            }
            else if (type === 'media') {
              if (s.rooms[roomId].mediaProducer) s.rooms[roomId].mediaProducer.close()
              s.rooms[roomId].mediaProducer = null
            }
          }
          return {
            ...s,
          }
        })
      },
      set,
    })
  )
);
