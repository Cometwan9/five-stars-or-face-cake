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
  const creamOffset = severe ? 0.12 : condition === 'slightTilt' ? 0.05 : 0;
  const cakeScaleY = collapsed ? 0.48 : 1;
  const berryDrop = severe ? -0.24 : 0;

  return (
    <group
      position={[vehicle.position.x, 0, vehicle.position.z]}
      rotation={[0, vehicle.heading, 0]}
    >
      <group position={[0, 1.0, 1.32]}>
        <mesh position={[0, -0.62, -0.38]} castShadow>
          <boxGeometry args={[1.35, 0.5, 1.15]} />
          <meshStandardMaterial color="#18c7ad" flatShading />
        </mesh>
        <mesh position={[0, -0.34, -0.02]} castShadow>
          <boxGeometry args={[0.82, 0.24, 0.66]} />
          <meshStandardMaterial color="#fff0c2" flatShading />
        </mesh>
        <mesh position={[-0.54, -0.66, -0.82]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.23, 0.055, 6, 10]} />
          <meshStandardMaterial color="#191f2d" flatShading />
        </mesh>
        <mesh position={[0.54, -0.66, -0.82]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.23, 0.055, 6, 10]} />
          <meshStandardMaterial color="#191f2d" flatShading />
        </mesh>
        <mesh position={[0, -0.42, 0.2]} castShadow>
          <boxGeometry args={[2.05, 0.1, 0.14]} />
          <meshStandardMaterial color="#191f2d" flatShading />
        </mesh>
        <mesh position={[-0.92, -0.02, 0.12]} rotation={[0, 0, -0.22]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
          <meshStandardMaterial color="#191f2d" flatShading />
        </mesh>
        <mesh position={[0.92, -0.02, 0.12]} rotation={[0, 0, 0.22]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
          <meshStandardMaterial color="#191f2d" flatShading />
        </mesh>
        <mesh position={[0, -0.1, 0.72]} castShadow>
          <boxGeometry args={[1.75, 0.1, 0.95]} />
          <meshStandardMaterial color="#d9d1bf" flatShading />
        </mesh>
        <group
          position={[0, 0.08, 0.72]}
          rotation={[cake.tiltZ, 0, -cake.tiltX]}
        >
          <mesh scale={[collapsed ? 1.12 : 1, cakeScaleY, collapsed ? 1.08 : 1]} castShadow>
            <cylinderGeometry args={[0.42, 0.46, 0.32, 10]} />
            <meshStandardMaterial color={collapsed ? '#d8b783' : '#f4dfb4'} flatShading />
          </mesh>
          <mesh position={[creamOffset * state.wind.direction, collapsed ? 0.08 : 0.2, 0]} scale={[collapsed ? 1.18 : 1, 1, collapsed ? 1.08 : 1]} castShadow>
            <cylinderGeometry args={[0.38, 0.42, 0.08, 10]} />
            <meshStandardMaterial color={severe ? '#ffe0dc' : '#fff6ed'} flatShading />
          </mesh>
          <mesh position={[0.16 + creamOffset, 0.27 + berryDrop, 0.08]} castShadow>
            <icosahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#ff2b54" flatShading />
          </mesh>
          <mesh position={[-0.18 + creamOffset, 0.27 + (collapsed ? -0.34 : 0), -0.05]} castShadow>
            <icosahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color="#ff2b54" flatShading />
          </mesh>
          {severe ? (
            <>
              <mesh position={[0.34, -0.12, -0.24]} castShadow>
                <tetrahedronGeometry args={[0.06, 0]} />
                <meshStandardMaterial color="#f2d0a7" flatShading />
              </mesh>
              <mesh position={[-0.28, -0.12, 0.22]} castShadow>
                <tetrahedronGeometry args={[0.05, 0]} />
                <meshStandardMaterial color="#f2d0a7" flatShading />
              </mesh>
            </>
          ) : null}
        </group>
      </group>
    </group>
  );
}
