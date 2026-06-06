import { useGLTF } from "@react-three/drei";

// Drop a real model at this path and it replaces the procedural car (no code
// change). If it's missing/broken, the gallery falls back to <F1Car>.
const MODEL_URL = "/models/f1-car.glb";

/**
 * Tweak these to fit your downloaded model into the scene — every model is
 * authored at a different scale/orientation. Start with scale and rotation.
 */
const SCALE = 1;
const ROTATION: [number, number, number] = [0, 0, 0];
const POSITION: [number, number, number] = [0, 0, 0];

export function CarModel() {
  const { scene } = useGLTF(MODEL_URL);
  return (
    <primitive
      object={scene}
      scale={SCALE}
      rotation={ROTATION}
      position={POSITION}
    />
  );
}
