// A stylized modern-era open-wheel car built from primitives: long & low, with
// a raised pointed nose on a front-wing pylon, halo, airbox + shark-fin engine
// cover, coke-bottle sidepods, low-profile wheels on wishbones, and a two-tone
// (team colour + carbon) livery. Front of the car is +Z.
// (A real glTF can still be dropped in — see ASSETS.md.)

const TYRE = "#141418";
const CARBON = "#0c0c11";

function Wheel({ x, z, width }: { x: number; z: number; width: number }) {
  return (
    <group position={[x, 0.38, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.38, 0.38, width, 32]} />
        <meshStandardMaterial color={TYRE} roughness={0.85} />
      </mesh>
      {/* low-profile rim */}
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, width + 0.02, 28]} />
        <meshStandardMaterial color="#23232c" metalness={0.75} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Wishbone({ x, y, z }: { x: number; y: number; z: number }) {
  const side = Math.sign(x);
  return (
    <group position={[x * 0.63, y, z]}>
      <mesh rotation={[0, side * 0.4, 0]} castShadow>
        <boxGeometry args={[0.7, 0.04, 0.04]} />
        <meshStandardMaterial color={CARBON} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh rotation={[0, -side * 0.4, 0]} castShadow>
        <boxGeometry args={[0.7, 0.04, 0.04]} />
        <meshStandardMaterial color={CARBON} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function F1Car({ color }: { color: string }) {
  // Reused materials. body = team-colour car paint; carbon = dark composite.
  const body = (
    <meshPhysicalMaterial
      color={color}
      metalness={0.45}
      roughness={0.4}
      clearcoat={1}
      clearcoatRoughness={0.12}
    />
  );
  const carbon = (
    <meshStandardMaterial color={CARBON} metalness={0.35} roughness={0.5} />
  );

  return (
    <group>
      {/* wide flat floor */}
      <mesh position={[0, 0.1, -0.1]} receiveShadow castShadow>
        <boxGeometry args={[1.05, 0.05, 4.9]} />
        {carbon}
      </mesh>

      {/* monocoque / chassis */}
      <mesh position={[0, 0.32, 0.1]} castShadow>
        <boxGeometry args={[0.52, 0.26, 2.5]} />
        {body}
      </mesh>
      {/* coke-bottle engine cover */}
      <mesh position={[0, 0.42, -1.3]} castShadow>
        <boxGeometry args={[0.34, 0.3, 1.5]} />
        {body}
      </mesh>
      {/* shark fin */}
      <mesh position={[0, 0.52, -1.55]} castShadow>
        <boxGeometry args={[0.04, 0.3, 1.2]} />
        {body}
      </mesh>

      {/* raised, pointed nose (apex toward +Z) */}
      <mesh position={[0, 0.37, 1.75]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.16, 1.8, 16]} />
        {body}
      </mesh>
      {/* nose pylon down to the front wing */}
      <mesh position={[0, 0.24, 2.62]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.12]} />
        {carbon}
      </mesh>

      {/* front wing: main plane + upper flap + endplates */}
      <mesh position={[0, 0.11, 2.72]} castShadow>
        <boxGeometry args={[1.95, 0.05, 0.5]} />
        {body}
      </mesh>
      <mesh position={[0, 0.2, 2.58]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.04, 0.28]} />
        {carbon}
      </mesh>
      <mesh position={[0.96, 0.22, 2.66]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.52]} />
        {carbon}
      </mesh>
      <mesh position={[-0.96, 0.22, 2.66]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.52]} />
        {carbon}
      </mesh>

      {/* sculpted sidepods (angled inward toward the rear) + dark undercut */}
      <mesh position={[0.49, 0.38, 0.2]} rotation={[0, -0.12, -0.05]} castShadow>
        <boxGeometry args={[0.42, 0.3, 1.4]} />
        {body}
      </mesh>
      <mesh position={[-0.49, 0.38, 0.2]} rotation={[0, 0.12, 0.05]} castShadow>
        <boxGeometry args={[0.42, 0.3, 1.4]} />
        {body}
      </mesh>
      <mesh position={[0.5, 0.22, 0.2]} castShadow>
        <boxGeometry args={[0.46, 0.14, 1.45]} />
        {carbon}
      </mesh>
      <mesh position={[-0.5, 0.22, 0.2]} castShadow>
        <boxGeometry args={[0.46, 0.14, 1.45]} />
        {carbon}
      </mesh>

      {/* airbox / roll hoop with intake */}
      <mesh position={[0, 0.62, -0.45]} castShadow>
        <boxGeometry args={[0.3, 0.42, 0.55]} />
        {body}
      </mesh>
      <mesh position={[0, 0.66, -0.2]} castShadow>
        <boxGeometry args={[0.16, 0.16, 0.12]} />
        {carbon}
      </mesh>

      {/* halo + central strut */}
      <mesh position={[0, 0.44, 0.5]} castShadow>
        <torusGeometry args={[0.42, 0.045, 10, 28, Math.PI]} />
        {carbon}
      </mesh>
      <mesh position={[0, 0.64, 0.86]} rotation={[0.6, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
        {carbon}
      </mesh>
      {/* driver helmet */}
      <mesh position={[0, 0.72, 0.3]} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color="#ededf2" roughness={0.25} metalness={0.1} />
      </mesh>

      {/* rear wing: main plane + flap + endplates + pylon, plus beam wing */}
      <mesh position={[0, 1.02, -2.5]} castShadow>
        <boxGeometry args={[1.25, 0.06, 0.42]} />
        {body}
      </mesh>
      <mesh position={[0, 1.12, -2.56]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.24]} />
        {carbon}
      </mesh>
      <mesh position={[0.63, 0.95, -2.5]} castShadow>
        <boxGeometry args={[0.05, 0.42, 0.46]} />
        {carbon}
      </mesh>
      <mesh position={[-0.63, 0.95, -2.5]} castShadow>
        <boxGeometry args={[0.05, 0.42, 0.46]} />
        {carbon}
      </mesh>
      <mesh position={[0, 0.78, -2.42]} castShadow>
        <boxGeometry args={[0.08, 0.42, 0.1]} />
        {carbon}
      </mesh>
      <mesh position={[0, 0.2, -2.55]} castShadow>
        <boxGeometry args={[1.0, 0.1, 0.4]} />
        {carbon}
      </mesh>

      {/* wheels — rears wider, on wishbones */}
      <Wheel x={0.98} z={1.65} width={0.34} />
      <Wheel x={-0.98} z={1.65} width={0.34} />
      <Wheel x={0.98} z={-1.55} width={0.42} />
      <Wheel x={-0.98} z={-1.55} width={0.42} />

      <Wishbone x={0.98} y={0.3} z={1.65} />
      <Wishbone x={-0.98} y={0.3} z={1.65} />
      <Wishbone x={0.98} y={0.46} z={1.6} />
      <Wishbone x={-0.98} y={0.46} z={1.6} />
      <Wishbone x={0.98} y={0.3} z={-1.55} />
      <Wishbone x={-0.98} y={0.3} z={-1.55} />
      <Wishbone x={0.98} y={0.46} z={-1.5} />
      <Wishbone x={-0.98} y={0.46} z={-1.5} />
    </group>
  );
}
