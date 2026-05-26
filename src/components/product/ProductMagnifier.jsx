import React, { useState } from 'react';

const ProductMagnifier = ({ src, alt }) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const magnifierHeight = 300;
  const magnifierWidth = 300;
  const zoomLevel = 2.5;

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "zoom-in"
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "auto", maxHeight: "500px", objectFit: "contain", filter: "var(--product-drop-shadow, grayscale(1))" }}
        onMouseEnter={(e) => {
          const elem = e.currentTarget;
          const { width, height } = elem.getBoundingClientRect();
          setSize([width, height]);
          setShowMagnifier(true);
        }}
        onMouseMove={(e) => {
          const elem = e.currentTarget;
          const { top, left } = elem.getBoundingClientRect();
          const x = e.pageX - left - window.pageXOffset;
          const y = e.pageY - top - window.pageYOffset;
          setXY([x, y]);
        }}
        onMouseLeave={() => {
          setShowMagnifier(false);
        }}
      />

      <div
        style={{
          display: showMagnifier ? "block" : "none",
          position: "absolute",
          pointerEvents: "none",
          height: `${magnifierHeight}px`,
          width: `${magnifierWidth}px`,
          top: `${y - magnifierHeight / 2}px`,
          left: `${x - magnifierWidth / 2}px`,
          opacity: "1",
          border: "2px solid rgba(255,255,255,0.5)",
          borderRadius: "50%",
          backgroundColor: "white",
          backgroundImage: `url('${src}')`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
          backgroundPosition: `${-x * zoomLevel + magnifierWidth / 2}px ${-y * zoomLevel + magnifierHeight / 2}px`,
          zIndex: 100,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}
      />
    </div>
  );
};

export default ProductMagnifier;
