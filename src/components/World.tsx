import { ROUTE_FEATURES, ROUTE_LENGTH } from '../game/route';

export function World() {
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
            <mesh key={feature.id} position={[feature.position.x, 0.6, feature.position.z]} castShadow>
              <boxGeometry args={[4.5, 1.2, 1.5]} />
              <meshStandardMaterial color="#d94f45" />
            </mesh>
          );
        }

        return (
          <mesh key={feature.id} position={[feature.position.x, 0.08, feature.position.z]} castShadow>
            <boxGeometry args={[10, 0.16, 1.1]} />
            <meshStandardMaterial color="#f0d36b" />
          </mesh>
        );
      })}
    </group>
  );
}
