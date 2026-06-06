// A stylized open-wheel car built from primitives, team-coloured with a
// car-paint (clearcoat) material. Reads as an intentional asset, not a
// placeholder. (A real glTF can still be dropped in — see ASSETS.md.)

const TYRE = "#141418";
const RIM = "#c9ced6";
const DARK = "#0b0b0f";

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.36, z]} rotation={[0, 0, Math.PI / 2]}>
      {/* tyre */}
      <mesh castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.32, 28]} />
        <meshStandardMaterial color={TYRE} roughness={0.9} />
      </mesh>
      {/* rim (slightly proud of the tyre so it catches light on both faces) */}
      <mesh>
        <cylinderGeometry args={[0.19, 0.19, 0.34, 20]} />
        <meshStandardMaterial color={RIM} metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function F1Car({ color }: { color: string }) {
  // Reused car-paint material (clearcoat over coloured base).
  const body = (
    <meshPhysicalMaterial
      color={color}
      metalness={0.45}
      roughness={0.4}
      clearcoat={1}
      clearcoatRoughness={0.12}
    />
  );

  return (
    <group>
      {/* floor / chassis */}
      <mesh position={[0, 0.33, 0]} castShadow>
        <boxGeometry args={[0.72, 0.14, 3.3]} />
        {body}
      </mesh>

      {/* tapered nose */}
      <mesh position={[0, 0.36, 2.4]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.2, 1.3, 16]} />
        {body}
      </mesh>

      {/* sidepods, angled inward toward the rear (coke-bottle) */}
      <mesh position={[0.5, 0.4, -0.1]} rotation={[0, -0.12, 0]} castShadow>
        <boxGeometry args={[0.32, 0.3, 1.5]} />
        {body}
      </mesh>
      <mesh position={[-0.5, 0.4, -0.1]} rotation={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.32, 0.3, 1.5]} />
        {body}
      </mesh>

      {/* cockpit + engine cover */}
      <mesh position={[0, 0.55, -0.1]} castShadow>
        <boxGeometry args={[0.46, 0.34, 1.3]} />
        {body}
      </mesh>
      <mesh position={[0, 0.58, -1.1]} castShadow>
        <boxGeometry args={[0.28, 0.34, 0.9]} />
        {body}
      </mesh>
      {/* driver helmet */}
      <mesh position={[0, 0.73, 0.25]} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#ededf2" roughness={0.25} metalness={0.1} />
      </mesh>

      {/* halo: front hoop + central strut */}
      <mesh position={[0, 0.42, 0.5]} castShadow>
        <torusGeometry args={[0.42, 0.045, 10, 28, Math.PI]} />
        <meshStandardMaterial color={DARK} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.62, 0.85]} rotation={[0.6, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.55, 0.06]} />
        <meshStandardMaterial color={DARK} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* front wing + endplates */}
      <mesh position={[0, 0.15, 2.7]} castShadow>
        <boxGeometry args={[1.75, 0.05, 0.55]} />
        {body}
      </mesh>
      <mesh position={[0.87, 0.21, 2.7]} castShadow>
        <boxGeometry args={[0.04, 0.22, 0.55]} />
        <meshStandardMaterial color={DARK} roughness={0.5} />
      </mesh>
      <mesh position={[-0.87, 0.21, 2.7]} castShadow>
        <boxGeometry args={[0.04, 0.22, 0.55]} />
        <meshStandardMaterial color={DARK} roughness={0.5} />
      </mesh>

      {/* rear wing on two supports */}
      <mesh position={[0, 0.98, -2.0]} castShadow>
        <boxGeometry args={[1.4, 0.3, 0.1]} />
        {body}
      </mesh>
      <mesh position={[0.26, 0.72, -1.95]} castShadow>
        <boxGeometry args={[0.06, 0.42, 0.1]} />
        <meshStandardMaterial color={DARK} roughness={0.5} />
      </mesh>
      <mesh position={[-0.26, 0.72, -1.95]} castShadow>
        <boxGeometry args={[0.06, 0.42, 0.1]} />
        <meshStandardMaterial color={DARK} roughness={0.5} />
      </mesh>

      <Wheel x={0.95} z={1.4} />
      <Wheel x={-0.95} z={1.4} />
      <Wheel x={0.95} z={-1.4} />
      <Wheel x={-0.95} z={-1.4} />
    </group>
  );
}
