import type { GameState } from '../game/gameState';

type RiderViewProps = {
  state: GameState;
};

export function RiderView({ state }: RiderViewProps) {
  const { vehicle, cake } = state;

  return (
    <group
      position={[vehicle.position.x, 0, vehicle.position.z]}
      rotation={[0, vehicle.heading, 0]}
    >
      <group position={[0, 1.1, 1.6]}>
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
          <mesh castShadow>
            <cylinderGeometry args={[0.42, 0.46, 0.32, 18]} />
            <meshStandardMaterial color="#f4dfb4" />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.42, 0.08, 18]} />
            <meshStandardMaterial color="#fff6ed" />
          </mesh>
          <mesh position={[0.16, 0.27, 0.08]} castShadow>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#d9384e" />
          </mesh>
          <mesh position={[-0.18, 0.27, -0.05]} castShadow>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#d9384e" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
