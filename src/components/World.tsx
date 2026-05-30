import { ROUTE_FEATURES, ROUTE_LENGTH } from '../game/route';
import type { GameState } from '../game/gameState';

type WorldProps = {
  state: GameState;
};

const FAIRIES = [
  { id: 'route-fairy', position: [-5.9, 1.55, 34] as const, color: '#7bdff2' },
  { id: 'cream-fairy', position: [5.8, 1.75, 76] as const, color: '#f7aef8' },
  { id: 'wind-fairy', position: [-5.7, 1.55, 132] as const, color: '#b8f2e6' }
];

const BUILDINGS = Array.from({ length: 12 }, (_, index) => ({
  id: `building-${index}`,
  x: index % 2 === 0 ? -17 - (index % 3) * 4 : 17 + (index % 3) * 4,
  z: 18 + index * 15,
  height: 4 + (index % 4) * 1.4,
  color: ['#b85f43', '#d2964a', '#2e8f80', '#554a95'][index % 4]
}));

export function World({ state }: WorldProps) {
  const windLean = state.wind.direction * 0.35;

  return (
    <group>
      <mesh position={[0, 0, ROUTE_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, ROUTE_LENGTH + 60]} />
        <meshStandardMaterial color="#5c7b52" flatShading />
      </mesh>

      <mesh position={[0, 0.02, ROUTE_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[13.4, ROUTE_LENGTH + 28]} />
        <meshStandardMaterial color="#2f3442" flatShading />
      </mesh>

      {[-7.5, 7.5].map((x) => (
        <mesh key={`curb-${x}`} position={[x, 0.08, ROUTE_LENGTH / 2]} castShadow>
          <boxGeometry args={[0.55, 0.18, ROUTE_LENGTH + 28]} />
          <meshStandardMaterial color="#c99038" flatShading />
        </mesh>
      ))}

      {Array.from({ length: 22 }, (_, index) => {
        const z = (state.vehicle.position.z + 8 + index * 8) % (ROUTE_LENGTH + 26);

        return (
          <mesh key={`lane-${index}`} position={[0, 0.095, z]} castShadow>
            <boxGeometry args={[0.32, 0.035, 4.9]} />
            <meshStandardMaterial color="#f7e39a" emissive="#3b2a14" emissiveIntensity={0.08} flatShading />
          </mesh>
        );
      })}

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
                <meshStandardMaterial color="#d2964a" flatShading />
              </mesh>
              <mesh position={[0, 1.2, -0.7]} castShadow>
                <boxGeometry args={[1.8, 2.4, 0.3]} />
                <meshStandardMaterial color="#7a3f2c" flatShading />
              </mesh>
              <mesh position={[0, 6.5, -0.3]} castShadow>
                <boxGeometry args={[5.4, 0.7, 0.3]} />
                <meshStandardMaterial color="#ffef8a" emissive="#ffef8a" emissiveIntensity={0.16} flatShading />
              </mesh>
            </group>
          );
        }

        if (feature.kind === 'roadblock') {
          return (
            <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
              <mesh position={[0, 1.55, 0]} castShadow>
                <boxGeometry args={[5.5, 0.32, 0.42]} />
                <meshStandardMaterial color="#ffef8a" flatShading />
              </mesh>
              <mesh position={[0, 0.95, 0]} castShadow>
                <boxGeometry args={[5.7, 0.32, 0.44]} />
                <meshStandardMaterial color="#ffef8a" flatShading />
              </mesh>
              {[-2.55, 2.55].map((x) => (
                <mesh key={`post-${x}`} position={[x, 0.82, 0]} castShadow>
                  <boxGeometry args={[0.32, 1.55, 0.5]} />
                  <meshStandardMaterial color="#ff3b46" flatShading />
                </mesh>
              ))}
              {[-1.75, -0.6, 0.6, 1.75].map((x, stripeIndex) => (
                <mesh key={`stripe-${x}`} position={[x, 1.24, -0.24]} rotation={[0, 0, stripeIndex % 2 === 0 ? 0.55 : -0.55]} castShadow>
                  <boxGeometry args={[0.32, 1.18, 0.18]} />
                  <meshStandardMaterial color="#ff3b46" flatShading />
                </mesh>
              ))}
              {[-3.2, 0, 3.2].map((x) => (
                <group key={`cone-${x}`} position={[x, 0, 2.0]}>
                  <mesh position={[0, 0.36, 0]} castShadow>
                    <coneGeometry args={[0.42, 0.92, 6]} />
                    <meshStandardMaterial color="#ff8c1a" flatShading />
                  </mesh>
                  <mesh position={[0, 0.1, 0]} castShadow>
                    <cylinderGeometry args={[0.38, 0.44, 0.12, 6]} />
                    <meshStandardMaterial color="#fff0c2" flatShading />
                  </mesh>
                </group>
              ))}
            </group>
          );
        }

        if (feature.kind === 'oilSlick') {
          return (
            <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
              <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[1.8, 8]} />
                <meshStandardMaterial color="#101522" transparent opacity={0.78} flatShading />
              </mesh>
              {[-0.75, 0.2, 0.88].map((x, index) => (
                <mesh key={x} position={[x, 0.16, -0.45 + index * 0.45]} rotation={[-Math.PI / 2, 0, 0.3]} receiveShadow>
                  <circleGeometry args={[0.48, 7]} />
                  <meshStandardMaterial color="#35405a" transparent opacity={0.72} flatShading />
                </mesh>
              ))}
            </group>
          );
        }

        if (feature.kind === 'windTunnel') {
          return (
            <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
              {[-3.2, 3.2].map((x) => (
                <mesh key={x} position={[x, 1.35, 0]} castShadow>
                  <boxGeometry args={[0.24, 2.7, 0.24]} />
                  <meshStandardMaterial color="#52ffd2" emissive="#52ffd2" emissiveIntensity={0.22} flatShading />
                </mesh>
              ))}
              <mesh position={[0, 2.7, 0]} castShadow>
                <boxGeometry args={[6.6, 0.22, 0.22]} />
                <meshStandardMaterial color="#52ffd2" emissive="#52ffd2" emissiveIntensity={0.22} flatShading />
              </mesh>
              {[-1.8, 0, 1.8].map((x) => (
                <mesh key={x} position={[x, 1.2, -0.2]} rotation={[0, 0, state.wind.direction * 0.8]} castShadow>
                  <boxGeometry args={[1.3, 0.08, 0.08]} />
                  <meshStandardMaterial color="#b6fff1" transparent opacity={0.72} flatShading />
                </mesh>
              ))}
            </group>
          );
        }

        if (feature.kind === 'timeGate') {
          return (
            <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
              <mesh position={[0, 1.1, 0]} rotation={[0, state.remainingSeconds * 1.4, 0]} castShadow>
                <octahedronGeometry args={[0.72, 0]} />
                <meshStandardMaterial color="#ffe45e" emissive="#ffe45e" emissiveIntensity={0.45} flatShading />
              </mesh>
              <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <ringGeometry args={[1.1, 1.45, 8]} />
                <meshStandardMaterial color="#ffe45e" emissive="#ffe45e" emissiveIntensity={0.28} flatShading />
              </mesh>
            </group>
          );
        }

        return (
          <group key={feature.id} position={[feature.position.x, 0, feature.position.z]}>
            <mesh position={[0, 0.08, 0]} castShadow>
              <boxGeometry args={[10.6, 0.18, 1.2]} />
              <meshStandardMaterial color={feature.kind === 'pothole' ? '#9d5a34' : '#c99038'} flatShading />
            </mesh>
            {feature.kind === 'pothole' ? (
              <mesh position={[0, 0.13, 1.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[1.35, 8]} />
                <meshStandardMaterial color="#121621" flatShading />
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
          <mesh position={[0, -0.86, 0]} castShadow>
            <boxGeometry args={[1.1, 0.08, 0.16]} />
            <meshStandardMaterial color="#151a27" flatShading />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 16 }, (_, index) => {
        const z = (state.vehicle.position.z + 12 + index * 9) % (ROUTE_LENGTH + 20);
        const x = state.wind.direction * (4.8 + (index % 3) * 1.6);

        return (
          <group key={`wind-${index}`} position={[x, 1.1 + (index % 4) * 0.28, z]} rotation={[0, 0, windLean]}>
            <mesh>
              <boxGeometry args={[2.8, 0.045, 0.045]} />
              <meshStandardMaterial color="#b6fff1" transparent opacity={0.56} flatShading />
            </mesh>
            <mesh position={[state.wind.direction * 1.55, 0.14, 0]} rotation={[0, 0, -state.wind.direction * 0.7]}>
              <boxGeometry args={[0.62, 0.045, 0.045]} />
              <meshStandardMaterial color="#b6fff1" transparent opacity={0.56} flatShading />
            </mesh>
          </group>
        );
      })}

      {Array.from({ length: 5 }, (_, index) => (
        <group key={`warning-gate-${index}`} position={[0, 0, 28 + index * 34]}>
          <mesh position={[-6.4, 1.45, 0]} castShadow>
            <boxGeometry args={[0.22, 2.9, 0.22]} />
            <meshStandardMaterial color="#1b2030" flatShading />
          </mesh>
          <mesh position={[6.4, 1.45, 0]} castShadow>
            <boxGeometry args={[0.22, 2.9, 0.22]} />
            <meshStandardMaterial color="#1b2030" flatShading />
          </mesh>
          <mesh position={[0, 2.8, 0]} castShadow>
            <boxGeometry args={[13, 0.18, 0.2]} />
            <meshStandardMaterial color="#1b2030" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}
