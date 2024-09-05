import React, { useState, useRef, useEffect } from 'react';

const ArcSVG = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [currentPosition, setCurrentPosition] = useState('A'); // Initial position
  const svgRef = useRef(null);
  const blueDotRef = useRef(null);
  const pathRef = useRef(null);

  const horizontalMargin = 50; // Margin on both sides
  const angleInDegrees = 30;
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  const calculateArcParams = (width, height) => {
    const adjustedWidth = width - 2 * horizontalMargin;
    const radius = adjustedWidth / (2 * Math.sin(angleInRadians / 2));
    const arcHeight = radius * (1 - Math.cos(angleInRadians / 2));
    const startX = horizontalMargin;
    const startY = height / 2 + arcHeight;
    const endX = width - horizontalMargin;
    const endY = startY;
    const pointA = { x: startX, y: startY };
    const pointB = { x: width / 2, y: startY - arcHeight };
    const pointC = { x: endX, y: endY };
    // A radiusx radiusy rotation large-arc-flag sweep-flag x y
    const arcPath = `
      M ${startX},${startY}
      A ${radius},${radius} 0 0 1 ${endX},${endY}
    `;
    return { pointA, pointB, pointC, arcPath };
  };

  const { pointA, pointB, pointC, arcPath } = calculateArcParams(width, height);

  const getPathLength = () => {
    if (pathRef.current) {
      return pathRef.current.getTotalLength();
    }
    return 0;
  };

  const getPositionOnPath = (position) => {
    if (position === 'A') return 0;
    if (position === 'B') return getPathLength() * 0.5;
    if (position === 'C') return getPathLength();
    return 0;
  };

  const animateTo = (fromPoint, toPoint) => {
    const pathLength = getPathLength();
    if (pathLength === 0) return;
  
    fromPoint = Math.max(0, Math.min(pathLength, fromPoint));
    toPoint = Math.max(0, Math.min(pathLength, toPoint));
  
    const distance = Math.abs(toPoint - fromPoint); // Calculate distance between from and to
    const speed = 300; // Speed in pixels per second
    const duration = (distance / speed) * 1000; // Duration in milliseconds based on distance
  
    const startPointLength = fromPoint;
    const endPointLength = toPoint;
  
    const startTime = performance.now();
  
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
  
      const length = startPointLength + (endPointLength - startPointLength) * progress;
      const point = pathRef.current.getPointAtLength(length);
  
      if (blueDotRef.current) {
        blueDotRef.current.setAttribute('cx', point.x);
        blueDotRef.current.setAttribute('cy', point.y);
      }
  
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
  
    requestAnimationFrame(animate);
  };
  
  const handlePointClick = (point) => {
    const pathLength = getPathLength();
    if (pathLength === 0) return;

    let from = getPositionOnPath(currentPosition);
    let to = getPositionOnPath(point);

    animateTo(from, to);
    setCurrentPosition(point);
  };

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Move the blue dot to its correct new position upon resize
    const { pointA, pointB, pointC } = calculateArcParams(width, height);
    const pathLength = getPathLength();
    const pointOnPath = pathRef.current.getPointAtLength(getPositionOnPath(currentPosition));
    
    if (blueDotRef.current) {
      blueDotRef.current.setAttribute('cx', pointOnPath.x);
      blueDotRef.current.setAttribute('cy', pointOnPath.y);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [width, height, currentPosition]);

  const fontSize = Math.max(12, Math.min(width / 40, 24)); // Adjust the size of the text

  return (
    <svg width="100vw" height="100vh" ref={svgRef}>
      <path
        id="arcPath"
        ref={pathRef}
        d={arcPath}
        stroke="black"
        strokeWidth="2"
        fill="none"
      />

      {/* Points A, B, C */}
      <circle
        cx={pointA.x}
        cy={pointA.y}
        r={Math.max(5, Math.min(width / 150, 10))}
        fill="red"
        onClick={() => handlePointClick('A')}
        style={{ cursor: 'pointer' }}
      />
      <circle
        cx={pointB.x}
        cy={pointB.y}
        r={Math.max(5, Math.min(width / 150, 10))}
        fill="red"
        onClick={() => handlePointClick('B')}
        style={{ cursor: 'pointer' }}
      />
      <circle
        cx={pointC.x}
        cy={pointC.y}
        r={Math.max(5, Math.min(width / 150, 10))}
        fill="red"
        onClick={() => handlePointClick('C')}
        style={{ cursor: 'pointer' }}
      />

      {/* Moving Point */}
      <circle
        ref={blueDotRef}
        cx={pointA.x}
        cy={pointA.y}
        r={Math.max(5, Math.min(width / 150, 10))}
        fill="blue"
      />

      {/* Text labels */}
      <text
        x={pointA.x - fontSize}
        y={pointA.y - fontSize}
        fontSize={`${fontSize}px`}
        fill="black"
        textAnchor="middle"
        style={{ cursor: 'pointer' }}
        onClick={() => handlePointClick('A')}
      >
        A
      </text>
      <text
        x={pointB.x}
        y={pointB.y - fontSize}
        fontSize={`${fontSize}px`}
        fill="black"
        textAnchor="middle"
        style={{ cursor: 'pointer' }}
        onClick={() => handlePointClick('B')}
      >
        B
      </text>
      <text
        x={pointC.x + fontSize}
        y={pointC.y - fontSize}
        fontSize={`${fontSize}px`}
        fill="black"
        textAnchor="end"
        style={{ cursor: 'pointer' }}
        onClick={() => handlePointClick('C')}
      >
        C
      </text>
    </svg>
  );
};

export default ArcSVG;
    