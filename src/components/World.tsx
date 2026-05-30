import { ROUTE_FEATURES, ROUTE_LENGTH } from '../game/route';
import type { GameState } from '../game/gameState';

type WorldProps = {
  state: GameState;
};

const FAIRIES = [
  { id: 'route-fairy', position: [-8, 1.4, 34] as const, color: '#7bdff2' },
  { id: 'cream-fairy', position: [8.5, 1.7, 76] as const, color: '#f7aef8' },
  { id: 'wind-fairy', position: [-9, 1.5, 132] as const, color: '#b8f2e6' }
];

export function World({ state }: WorldProps) {
  const windLean = state.wind.direction * 0.35;

  return (
    <group>
      <mesh position={[0, 0, ROUTE_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, ROUTE_LENGTH + 60]} />
        <meshStandardMaterial color="#6fb36d" />
      </mesh>

      <mesh position={[0, 0.02, ROUTE_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, ROUTE_LENGTH + 28]} />
        <meshStandardMaterial color="#59606b" />
      </mesh>

      {ROUTE_FEATURES.map((feature) => {
        if (feature.kind === 'destination') {
          return (
            <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
              <mesh position={[0, 3, 0]} castShadow>
                <boxGeometry args={[8, 6, 1.2]} />
                <meshStandardMaterial color="#f4c45f" />
              </mesh>
              <mesh position={[0, 1.2, -0.7]} castShadow>
                <boxGeometry args={[1.8, 2.4, 0.3]} />
                <meshStandardMaterial color="#8d4d36" />
              </mesh>
            </group>
          );
        }

        if (feature.kind === 'obstacle') {
          return (
            <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
              <mesh position={[0, 0.65, 0]} castShadow>
                <boxGeometry args={[4.8, 1.1, 0.28]} />
                <meshStandardMaterial color="#f8f1dc" />
              </mesh>
              {[-1.6, 0, 1.6].map((x) => (
                <mesh key={x} position={[x, 0.66, -0.02]} rotation={[0, 0, 0.62]} castShadow>
                  <boxGeometry args={[0.38, 1.35, 0.32]} />
                  <meshStandardMaterial color="#d94f45" />
                </mesh>
              ))}
              {[-2.7, 2.7].map((x) => (
                <group key={x} position={[x, 0, 1.8]}>
                  <mesh position={[0, 0.36, 0]} castShadow>
                    <coneGeometry args={[0.34, 0.72, 12]} />
                    <meshStandardMaterial color="#ef7b45" />
                  </mesh>
                  <mesh position={[0, 0.08, 0]} castShadow>
                    <cylinderGeometry args={[0.28, 0.32, 0.08, 12]} />
                    <meshStandardMaterial color="#fff2df" />
                  </mesh>
                </group>
              ))}
            </group>
          );
        }

        return (
          <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
            <mesh position={[0, 0.08, 0]} castShadow>
              <boxGeometry args={[10, 0.16, 1.1]} />
              <meshStandardMaterial color="#f0d36b" />
            </mesh>
            {feature.id.includes('pothole') ? (
              <mesh position={[0, 0.13, 1.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[1.2, 18]} />
                <meshStandardMaterial color="#2f3440" />
              </mesh>
            ) : null}
          </group>
        );
      })}

      {FAIRIES.map((fairy, index) => (
        <group key={fairy.id} position={fairy.position}>
          <mesh position={[0, Math.sin(state.remainingSeconds * 2 + index) * 0.08, 0]} castShadow>
            <sphereGeometry args={[0.32, 12, 12]} />
            <meshStandardMaterial color={fairy.color} emissive={fairy.color} emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[-0.35, 0.08, 0]} rotation={[0, 0, -0.55]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#fff8d8" transparent opacity={0.62} />
          </mesh>
          <mesh position={[0.35, 0.08, 0]} rotation={[0, 0, 0.55]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#fff8d8" transparent opacity={0.62} />
          </mesh>
          <mesh position={[0, -0.46, 0]} castShadow>
            <coneGeometry args={[0.22, 0.42, 8]} />
            <meshStandardMaterial color="#653f8c" />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 10 }, (_, index) => {
        const z = 18 + index * 17;
        const x = state.wind.direction * (9 + (index % 3) * 4);

        return (
          <group key={`wind-${index}`} position={[x, 1.1 + (index % 4) * 0.28, z]} rotation={[0, 0, windLean]}>
            <mesh>
              <boxGeometry args={[2.6, 0.035, 0.035]} />
              <meshStandardMaterial color="#e8fbff" transparent opacity={0.66} />
            </mesh>
            <mesh position={[state.wind.direction * 1.55, 0.14, 0]} rotation={[0, 0, -state.wind.direction * 0.7]}>
              <boxGeometry args={[0.55, 0.035, 0.035]} />
              <meshStandardMaterial color="#e8fbff" transparent opacity={0.66} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
