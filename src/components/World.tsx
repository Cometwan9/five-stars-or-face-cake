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

const BUILDINGS = Array.from({ length: 12 }, (_, index) => ({
  id: `building-${index}`,
  x: index % 2 === 0 ? -18 - (index % 3) * 4 : 18 + (index % 3) * 4,
  z: 18 + index * 15,
  height: 4 + (index % 4) * 1.4,
  color: ['#ff6b6b', '#ffd166', '#3bd7b8', '#7b61ff'][index % 4]
}));

export function World({ state }: WorldProps) {
  const windLean = state.wind.direction * 0.35;

  return (
    <group>
      <mesh position={[0, 0, ROUTE_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, ROUTE_LENGTH + 60]} />
        <meshStandardMaterial color="#39a852" flatShading />
      </mesh>

      <mesh position={[0, 0.02, ROUTE_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, ROUTE_LENGTH + 28]} />
        <meshStandardMaterial color="#444b5b" flatShading />
      </mesh>

      {[-7.5, 7.5].map((x) => (
        <mesh key={`curb-${x}`} position={[x, 0.08, ROUTE_LENGTH / 2]} castShadow>
          <boxGeometry args={[0.55, 0.18, ROUTE_LENGTH + 28]} />
          <meshStandardMaterial color="#f5e35d" flatShading />
        </mesh>
      ))}

      {Array.from({ length: 16 }, (_, index) => (
        <mesh key={`lane-${index}`} position={[0, 0.095, 8 + index * 12]} castShadow>
          <boxGeometry args={[0.28, 0.035, 4.4]} />
          <meshStandardMaterial color="#fff2a8" flatShading />
        </mesh>
      ))}

      {BUILDINGS.map((building) => (
        <group key={building.id} position={[building.x, building.height / 2, building.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5.5, building.height, 5.5]} />
            <meshStandardMaterial color={building.color} flatShading />
          </mesh>
          <mesh position={[0, building.height / 2 + 0.25, 0]} castShadow>
            <coneGeometry args={[4.3, 1.3, 4]} />
            <meshStandardMaterial color="#252a3a" flatShading />
          </mesh>
        </group>
      ))}

      {ROUTE_FEATURES.map((feature) => {
        if (feature.kind === 'destination') {
          return (
            <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
              <mesh position={[0, 3, 0]} castShadow>
                <boxGeometry args={[8, 6, 1.2]} />
                <meshStandardMaterial color="#ffd166" flatShading />
              </mesh>
              <mesh position={[0, 1.2, -0.7]} castShadow>
                <boxGeometry args={[1.8, 2.4, 0.3]} />
                <meshStandardMaterial color="#7a3f2c" flatShading />
              </mesh>
            </group>
          );
        }

        if (feature.kind === 'obstacle') {
          return (
            <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
              <mesh position={[0, 0.65, 0]} castShadow>
                <boxGeometry args={[4.8, 1.1, 0.28]} />
                <meshStandardMaterial color="#fff0c2" flatShading />
              </mesh>
              {[-1.6, 0, 1.6].map((x) => (
                <mesh key={x} position={[x, 0.66, -0.02]} rotation={[0, 0, 0.62]} castShadow>
                  <boxGeometry args={[0.38, 1.35, 0.32]} />
                  <meshStandardMaterial color="#ff3b46" flatShading />
                </mesh>
              ))}
              {[-2.7, 2.7].map((x) => (
                <group key={x} position={[x, 0, 1.8]}>
                  <mesh position={[0, 0.36, 0]} castShadow>
                    <coneGeometry args={[0.36, 0.78, 6]} />
                    <meshStandardMaterial color="#ff8c1a" flatShading />
                  </mesh>
                  <mesh position={[0, 0.08, 0]} castShadow>
                    <cylinderGeometry args={[0.3, 0.34, 0.08, 6]} />
                    <meshStandardMaterial color="#fff0c2" flatShading />
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
              <meshStandardMaterial color="#ffe45e" flatShading />
            </mesh>
            {feature.id.includes('pothole') ? (
              <mesh position={[0, 0.13, 1.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[1.2, 9]} />
                <meshStandardMaterial color="#1d2230" flatShading />
              </mesh>
            ) : null}
          </group>
        );
      })}

      {FAIRIES.map((fairy, index) => (
        <group key={fairy.id} position={fairy.position}>
          <mesh position={[0, Math.sin(state.remainingSeconds * 2 + index) * 0.08, 0]} castShadow>
            <icosahedronGeometry args={[0.36, 0]} />
            <meshStandardMaterial color={fairy.color} emissive={fairy.color} emissiveIntensity={0.45} flatShading />
          </mesh>
          <mesh position={[-0.35, 0.08, 0]} rotation={[0, 0, -0.55]}>
            <tetrahedronGeometry args={[0.27, 0]} />
            <meshStandardMaterial color="#fff8d8" transparent opacity={0.68} flatShading />
          </mesh>
          <mesh position={[0.35, 0.08, 0]} rotation={[0, 0, 0.55]}>
            <tetrahedronGeometry args={[0.27, 0]} />
            <meshStandardMaterial color="#fff8d8" transparent opacity={0.68} flatShading />
          </mesh>
          <mesh position={[0, -0.46, 0]} castShadow>
            <coneGeometry args={[0.22, 0.42, 8]} />
            <meshStandardMaterial color="#653f8c" flatShading />
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
              <meshStandardMaterial color="#e8fbff" transparent opacity={0.72} flatShading />
            </mesh>
            <mesh position={[state.wind.direction * 1.55, 0.14, 0]} rotation={[0, 0, -state.wind.direction * 0.7]}>
              <boxGeometry args={[0.55, 0.035, 0.035]} />
              <meshStandardMaterial color="#e8fbff" transparent opacity={0.72} flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
