import { useRef, useCallback, useState } from 'react';

export default function TiltCard({
  children,
  className = '',
  style = {},
  tiltDegree = 8,
  perspective = 1000,
  scale = 1.02,
  glow = true,
  disabled = false,
}) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('');
  const [glowStyle, setGlowStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const frameRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (disabled || !ref.current) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -tiltDegree;
      const rotateY = ((x - centerX) / centerX) * tiltDegree;

      setTransform(
        `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
      );

      if (glow) {
        const intensity = Math.min(
          1,
          Math.sqrt(
            ((x - centerX) / centerX) ** 2 + ((y - centerY) / centerY) ** 2
          )
        );
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        setGlowStyle({
          background: `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255,85,0,0.12) 0%, transparent 60%)`,
          boxShadow: `0 ${4 + intensity * 12}px ${20 + intensity * 20}px rgba(255,85,0,${0.06 + intensity * 0.08})`,
          borderColor: `rgba(255,85,0,${0.15 + intensity * 0.15})`,
        });
      }
    });
  }, [tiltDegree, perspective, scale, glow, disabled]);

  const handleMouseLeave = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setIsHovered(false);
    setTransform(
      `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    );
    setGlowStyle({});
  }, [perspective]);

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: isHovered
          ? 'none'
          : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transform,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        position: 'relative',
        borderRadius: 'inherit',
        ...glowStyle,
        ...style,
      }}
    >
      <div
        style={{
          transform: 'translateZ(20px)',
          transformStyle: 'preserve-3d',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
