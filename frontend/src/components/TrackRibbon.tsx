import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { Line } from "@react-three/drei";

// A stylized closed circuit (XZ plane) — a procedural stand-in for a real
// track. Real circuit geometry can be extruded from path/coordinate data later.
const POINTS: [number, number][] = [
  [-6, -3],
  [-3, -5],
  [2, -5.5],
  [6, -3],
  [7, 1],
  [4, 4],
  [0, 5],
  [-4, 4.5],
  [-7, 1.5],
];

export function TrackRibbon({ color }: { color: string }) {
  const points = useMemo(() => {
    const curve = new CatmullRomCurve3(
      POINTS.map(([x, z]) => new Vector3(x, 0.02, z)),
      true,
      "catmullrom",
      0.5,
    );
    return curve.getPoints(160);
  }, []);

  return (
    <group>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#0e0e16" roughness={1} />
      </mesh>
      {/* glowing racing line in the team colour */}
      <Line points={points} color={color} lineWidth={3} />
    </group>
  );
}
