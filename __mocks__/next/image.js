import React from 'react';

export default function Image({ src, alt, ...props }) {
  return <img src={src} alt={alt} {...props} />;
}