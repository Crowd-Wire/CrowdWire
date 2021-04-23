import React from "react";
import { useConsumerStore } from "../../webrtc/stores/useConsumerStore";
import { VolumeSlider } from "./VolumeSlider";

interface UserVolumeSliderProps {
  userId: string;
  volColor: string;
}

export const UserVolumeSlider: React.FC<UserVolumeSliderProps> = ({
  userId,
  volColor
}) => {
  const { consumerMap, setVolume } = useConsumerStore();
  const consumerInfo = consumerMap[userId];
  if (!consumerInfo) {
    return <div/>;
  }

  return (
    <VolumeSlider
      max={200}
      volColor={volColor}
      volume={consumerInfo.volume}
      onVolume={(n) => setVolume(userId, n)}
    />
  );
};
