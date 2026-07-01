import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Soft Bokeh Dust ──────────────────────────────────────────────── */
function BokehDust({ count = 120 }) {
  const mesh = useRef();
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sp[i] = 0.05 + Math.random() * 0.15;
    }
    return [pos, sp];
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.01;
      mesh.current.rotation.x = Math.sin(t * 0.005) * 0.02;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        color="#a855f7"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Premium Glass Shape ───────────────────────────────────────────── */
function GlassShape({ geometry, position, scale, rotationSpeed, tintColor }) {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * rotationSpeed;
      meshRef.current.rotation.y = t * rotationSpeed * 0.8;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {geometry}
      <meshPhysicalMaterial
        color={tintColor}
        transmission={0.85}
        roughness={0.12}
        metalness={0.05}
        thickness={2.0}
        ior={1.45}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transparent
        opacity={0.8}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

/* ─── Mouse Movement Follow Wrapper ─────────────────────────────────── */
function InteractiveMouseGroup({ children }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      // Smoothly interpolate (lerp) toward normalized mouse coordinates
      const targetX = state.pointer.x * 0.35;
      const targetY = state.pointer.y * 0.35;

      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetX, 0.08);
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -targetY, 0.08);
    }
  });

  return <group ref={ref}>{children}</group>;
}

/* ─── Main Background Component ──────────────────────────────────────── */
export default function ThreeBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      pointerEvents: 'none', opacity: 0.8,
    }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Soft studio lighting */}
        <ambientLight intensity={0.9} />
        
        {/* Soft warm pink light from top right */}
        <directionalLight position={[5, 5, 2]} intensity={1.5} color="#ffd4c4" />
        
        {/* Soft purple/indigo light from bottom left */}
        <pointLight position={[-5, -4, 3]} intensity={2.0} color="#e9d5ff" distance={25} />
        
        {/* Subtle highlights */}
        <pointLight position={[0, 4, 2]} intensity={0.8} color="#fff" />

        {/* Mouse interactive group */}
        <InteractiveMouseGroup>
          {/* Soft bokeh/dust particles */}
          <BokehDust count={90} />

          {/* Glass Shapes with smooth organic float animations */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2}>
            <GlassShape
              geometry={<torusGeometry args={[1.2, 0.4, 32, 64]} />}
              position={[4, 1.5, -3]}
              scale={0.85}
              rotationSpeed={0.06}
              tintColor="#ffd4c4"
            />
          </Float>

          <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5}>
            <GlassShape
              geometry={<icosahedronGeometry args={[1, 1]} />}
              position={[-4, -1, -2]}
              scale={0.9}
              rotationSpeed={0.05}
              tintColor="#f3e8ff"
            />
          </Float>

          <Float speed={2.5} rotationIntensity={0.4} floatIntensity={1.0}>
            <GlassShape
              geometry={<sphereGeometry args={[1, 32, 32]} />}
              position={[2, -2, -4]}
              scale={0.7}
              rotationSpeed={0.03}
              tintColor="#e0f2fe"
            />
          </Float>

          <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.3}>
            <GlassShape
              geometry={<torusKnotGeometry args={[0.7, 0.22, 64, 8]} />}
              position={[-2.5, 2.2, -5]}
              scale={0.95}
              rotationSpeed={0.04}
              tintColor="#fae8ff"
            />
          </Float>

          <Float speed={3} rotationIntensity={1.2} floatIntensity={2}>
            <GlassShape
              geometry={<octahedronGeometry args={[0.6]} />}
              position={[0, -2.5, -3]}
              scale={0.6}
              rotationSpeed={0.12}
              tintColor="#ffd4c4"
            />
          </Float>
        </InteractiveMouseGroup>
      </Canvas>
    </div>
  );
}
