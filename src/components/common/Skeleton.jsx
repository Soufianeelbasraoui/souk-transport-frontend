import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`st-skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export default Skeleton;
