import type { GameState } from '../game/gameState';
import { getCakeCondition } from '../game/cakePhysics';

type RiderViewProps = {
  state: GameState;
};

export function RiderView({ state }: RiderViewProps) {
  const { vehicle, cake } = state;
  const condition = getCakeCondition(cake);
  const collapsed = condition === 'collapsed' || condition === 'faceCake';
  const severe = condition === 'severeTilt' || collapsed;
  const stress = Math.min(1.2, Math.hypot(cake.tiltX, cake.tiltZ));
  const creamOffset = (severe ? 0.18 : condition === 'slightTilt' ? 0.08 : 0.02) * state.wind.direction;
  const cakeSquash = collapsed ? 0.44 : severe ? 0.78 : 1;
  const layerSlip = severe ? 0.16 * state.wind.direction : condition === 'slightTilt' ? 0.06 * state.wind.direction : 0;
  const berryDrop = severe ? -0.36 : stress > 0.4 ? -0.12 : 0;
  const vehicleLean = Math.max(-0.08, Math.min(0.08, -vehicle.speed * state.wind.force * 0.006));

  return (
    <group
      position={[vehicle.position.x, 0, vehicle.position.z]}
      rotation={[0, vehicle.heading, 0]}
    >
      <group position={[0, 0.86, 1.12]} rotation={[0, 0, vehicleLean]}>
        <mesh position={[0, -0.78, -0.44]} scale={[1, 0.9, 1]} castShadow>
          <boxGeometry args={[1.4, 0.36, 1.18]} />
          <meshStandardMaterial color="#17bda5" flatShading />
        </mesh>
        <mesh position={[0, -0.56, -0.1]} rotation={[0.12, 0, 0]} castShadow>
          <boxGeometry args={[1.04, 0.32, 0.82]} />
          <meshStandardMaterial color="#20dfbd" flatShading />
        </mesh>
        <mesh position={[0, -0.38, -0.46]} rotation={[0.18, 0, 0]} castShadow>
          <boxGeometry args={[0.78, 0.18, 0.24]} />
          <meshStandardMaterial color="#f5cf28" flatShading />
        </mesh>
        <mesh position={[0, -0.42, 0.34]} rotation={[Math.PI / 2, 0, Math.PI / 4]} castShadow>
          <coneGeometry args={[0.38, 0.55, 4]} />
          <meshStandardMaterial color="#fff24a" emissive="#fff24a" emissiveIntensity={0.22} flatShading />
        </mesh>
        <mesh position={[0, -0.78, -1.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.42, 0.09, 6, 12]} />
          <meshStandardMaterial color="#141927" flatShading />
        </mesh>
        <mesh position={[0, -0.78, -1.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.12, 6]} />
          <meshStandardMaterial color="#6b7280" flatShading />
        </mesh>
        <mesh position={[0, -0.56, -1.05]} castShadow>
          <boxGeometry args={[1.28, 0.16, 0.34]} />
          <meshStandardMaterial color="#14a58e" flatShading />
        </mesh>
        <mesh position={[0, -0.34, 0.22]} castShadow>
          <boxGeometry args={[2.15, 0.11, 0.16]} />
          <meshStandardMaterial color="#171c29" flatShading />
        </mesh>
        {[-1.08, 1.08].map((x) => (
          <group key={`mirror-${x}`} position={[x, -0.08, 0.12]}>
            <mesh rotation={[0.18, 0, x > 0 ? -0.36 : 0.36]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.78, 6]} />
              <meshStandardMaterial color="#171c29" flatShading />
            </mesh>
            <mesh position={[x > 0 ? 0.28 : -0.28, 0.26, 0.08]} rotation={[0, 0, x > 0 ? 0.2 : -0.2]} castShadow>
              <boxGeometry args={[0.34, 0.18, 0.06]} />
              <meshStandardMaterial color="#d9fff7" flatShading />
            </mesh>
          </group>
        ))}
        {[-0.98, 0.98].map((x) => (
          <mesh key={`grip-${x}`} position={[x, -0.34, 0.22]} rotation={[0, 0, x > 0 ? 0.18 : -0.18]} castShadow>
            <boxGeometry args={[0.48, 0.16, 0.2]} />
            <meshStandardMaterial color="#101522" flatShading />
          </mesh>
        ))}
        <mesh position={[0, -0.12, 0.82]} castShadow>
          <boxGeometry args={[1.94, 0.12, 1.08]} />
          <meshStandardMaterial color="#292f3d" flatShading />
        </mesh>
        <mesh position={[0, 0.0, 0.82]} castShadow>
          <boxGeometry args={[1.64, 0.2, 0.88]} />
          <meshStandardMaterial color="#f5cf28" flatShading />
        </mesh>
        <mesh position={[0, 0.14, 0.82]} castShadow>
          <boxGeometry args={[1.5, 0.08, 0.78]} />
          <meshStandardMaterial color="#fff4c2" flatShading />
        </mesh>
        <group position={[0, 0.06, 0.82]}>
          <mesh position={[-0.84, 0.04, 0]} castShadow>
            <boxGeometry args={[0.08, 0.3, 0.94]} />
            <meshStandardMaterial color="#151a27" flatShading />
          </mesh>
          <mesh position={[0.84, 0.04, 0]} castShadow>
            <boxGeometry args={[0.08, 0.3, 0.94]} />
            <meshStandardMaterial color="#151a27" flatShading />
          </mesh>
          <mesh position={[0, 0.04, 0.48]} castShadow>
            <boxGeometry args={[1.72, 0.24, 0.08]} />
            <meshStandardMaterial color="#151a27" flatShading />
          </mesh>
        </group>
        <group
          position={[0, 0.33 + Math.sin(state.remainingSeconds * 14) * stress * 0.03, 0.84]}
          rotation={[cake.tiltZ * 1.16, 0, -cake.tiltX * 1.16]}
          scale={[1.18, 1.18, 1.18]}
        >
          <mesh position={[0, -0.16, 0]} scale={[collapsed ? 1.22 : 1, cakeSquash, collapsed ? 1.12 : 1]} castShadow>
            <cylinderGeometry args={[0.5, 0.52, 0.22, 10]} />
            <meshStandardMaterial color={collapsed ? '#d8b783' : '#f4dfb4'} flatShading />
          </mesh>
          <mesh position={[layerSlip, 0.02, 0]} scale={[collapsed ? 1.18 : 1, cakeSquash, collapsed ? 1.12 : 1]} castShadow>
            <cylinderGeometry args={[0.47, 0.5, 0.18, 10]} />
            <meshStandardMaterial color="#ffb46b" flatShading />
          </mesh>
          <mesh position={[layerSlip * 1.4, 0.18, 0]} scale={[collapsed ? 1.28 : 1, collapsed ? 0.65 : 1, collapsed ? 1.18 : 1]} castShadow>
            <cylinderGeometry args={[0.44, 0.47, 0.16, 10]} />
            <meshStandardMaterial color="#f4dfb4" flatShading />
          </mesh>
          <mesh position={[creamOffset, collapsed ? 0.22 : 0.31, 0]} scale={[collapsed ? 1.34 : 1, collapsed ? 0.72 : 1, collapsed ? 1.2 : 1]} castShadow>
            <cylinderGeometry args={[0.45, 0.5, 0.07, 10]} />
            <meshStandardMaterial color={severe ? '#ffe0dc' : '#fff6ed'} flatShading />
          </mesh>
          <mesh position={[0, 0.48 + (collapsed ? -0.22 : 0), 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.024, 0.34, 5]} />
            <meshStandardMaterial color="#ffe45e" emissive="#ffe45e" emissiveIntensity={0.32} flatShading />
          </mesh>
          <mesh position={[0, 0.7 + (collapsed ? -0.22 : 0), 0]} castShadow>
            <coneGeometry args={[0.06, 0.16, 5]} />
            <meshStandardMaterial color="#ff5c33" emissive="#ff5c33" emissiveIntensity={0.35} flatShading />
          </mesh>
          <mesh position={[0.2 + creamOffset, 0.42 + berryDrop, 0.11]} castShadow>
            <icosahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#ff2b54" flatShading />
          </mesh>
          <mesh position={[-0.2 + creamOffset * 0.7, 0.39 + (collapsed ? -0.38 : berryDrop * 0.5), -0.07]} castShadow>
            <icosahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color="#ff2b54" flatShading />
          </mesh>
          {severe ? (
            <>
              <mesh position={[0.34, -0.12, -0.24]} castShadow>
                <tetrahedronGeometry args={[0.06, 0]} />
                <meshStandardMaterial color="#f2d0a7" flatShading />
              </mesh>
              <mesh position={[-0.28, -0.14, 0.22]} castShadow>
                <tetrahedronGeometry args={[0.055, 0]} />
                <meshStandardMaterial color="#f2d0a7" flatShading />
              </mesh>
              <mesh position={[0.24 * state.wind.direction, 0.12, -0.34]} castShadow>
                <boxGeometry args={[0.34, 0.08, 0.13]} />
                <meshStandardMaterial color="#fff6ed" flatShading />
              </mesh>
            </>
          ) : null}
        </group>
      </group>
    </group>
  );
}
