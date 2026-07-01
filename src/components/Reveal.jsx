import { useRef, useState, useEffect } from 'react';

const DIRECTION_MAP = {
  up: { translate: 'translateY(40px)' },
  down: { translate: 'translateY(-40px)' },
  left: { translate: 'translateX(-50px)' },
  right: { translate: 'translateX(50px)' },
  scale: { translate: 'scale(0.9)' },
  none: { translate: 'none' },
};

export default function Reveal({
  children,
  className = '',
  style = {},
  direction = 'up',
  delay = '0s',
  duration = '0.75s',
  distance = null,
  threshold = 0.12,
  once = true,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);

  const dir = DIRECTION_MAP[direction] || DIRECTION_MAP.up;
  const dist = distance || null;

  return (
    <div
      ref={ref}
      className={`reveal-wrapper ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : dir.translate,
        transition: `opacity ${duration} cubic-bezier(0.16, 1, 0.3, 1) ${delay}, transform ${duration} cubic-bezier(0.16, 1, 0.3, 1) ${delay}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
