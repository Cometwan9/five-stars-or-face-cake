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
      <group position={[0, 1.1, 1.6]}>
        <mesh position={[0, -0.72, -0.48]} castShadow>
          <boxGeometry args={[1.25, 0.52, 1.3]} />
          <meshStandardMaterial color="#4fc3b1" />
        </mesh>
        <mesh position={[0, -0.45, -0.06]} castShadow>
          <boxGeometry args={[0.78, 0.22, 0.72]} />
          <meshStandardMaterial color="#f8f1dc" />
        </mesh>
        <mesh position={[-0.52, -0.75, -0.85]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.22, 0.045, 8, 18]} />
          <meshStandardMaterial color="#202734" />
        </mesh>
        <mesh position={[0.52, -0.75, -0.85]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.22, 0.045, 8, 18]} />
          <meshStandardMaterial color="#202734" />
        </mesh>
        <mesh position={[0, -0.52, 0.06]} castShadow>
          <boxGeometry args={[1.9, 0.08, 0.12]} />
          <meshStandardMaterial color="#222936" />
        </mesh>
        <mesh position={[-0.9, 0, 0]} rotation={[0, 0, -0.22]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
          <meshStandardMaterial color="#222936" />
        </mesh>
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, 0.22]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
          <meshStandardMaterial color="#222936" />
        </mesh>
        <mesh position={[0, -0.22, 0.55]} castShadow>
          <boxGeometry args={[1.7, 0.08, 1.0]} />
          <meshStandardMaterial color="#d9d1bf" />
        </mesh>
        <group
          position={[0, -0.08, 0.55]}
          rotation={[cake.tiltZ, 0, -cake.tiltX]}
        >
          <mesh scale={[collapsed ? 1.12 : 1, cakeScaleY, collapsed ? 1.08 : 1]} castShadow>
            <cylinderGeometry args={[0.42, 0.46, 0.32, 18]} />
            <meshStandardMaterial color={collapsed ? '#d8b783' : '#f4dfb4'} />
          </mesh>
          <mesh position={[creamOffset * state.wind.direction, collapsed ? 0.08 : 0.2, 0]} scale={[collapsed ? 1.18 : 1, 1, collapsed ? 1.08 : 1]} castShadow>
            <cylinderGeometry args={[0.38, 0.42, 0.08, 18]} />
            <meshStandardMaterial color={severe ? '#ffe0dc' : '#fff6ed'} />
          </mesh>
          <mesh position={[0.16 + creamOffset, 0.27 + berryDrop, 0.08]} castShadow>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#d9384e" />
          </mesh>
          <mesh position={[-0.18 + creamOffset, 0.27 + (collapsed ? -0.34 : 0), -0.05]} castShadow>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#d9384e" />
          </mesh>
          {severe ? (
            <>
              <mesh position={[0.34, -0.12, -0.24]} castShadow>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshStandardMaterial color="#f2d0a7" />
              </mesh>
              <mesh position={[-0.28, -0.12, 0.22]} castShadow>
                <sphereGeometry args={[0.028, 8, 8]} />
                <meshStandardMaterial color="#f2d0a7" />
              </mesh>
            </>
          ) : null}
        </group>
      </group>
    </group>
  );
}
