import React from "react";

interface VideoBoxProps {
  label?: boolean;

}

export const VideoBox: React.FC<VideoBoxProps> = ({
  label
}) => {
  return (
    <div>
      {label ? "userx" : ""}
    </div>
  );
};