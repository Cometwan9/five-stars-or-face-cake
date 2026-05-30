import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import {
  Box3,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector3
} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { getCakeCondition } from '../game/cakePhysics';
import type { GameState } from '../game/gameState';

type RiderViewProps = {
  state: GameState;
};

export function RiderView({ state }: RiderViewProps) {
  const { vehicle } = state;
  const vehicleLean = Math.max(-0.1, Math.min(0.1, -vehicle.speed * state.wind.force * 0.007));

  return (
    <group position={[vehicle.position.x, 0, vehicle.position.z]} rotation={[0, vehicle.heading, 0]}>
      <group rotation={[0, 0, vehicleLean]}>
        <DeliveryScooterModel />
        <CakeCargo state={state} />
      </group>
    </group>
  );
}

function CakeCargo({ state }: RiderViewProps) {
  const { cake } = state;
  const condition = getCakeCondition(cake);
  const collapsed = condition === 'collapsed' || condition === 'faceCake';
  const severe = condition === 'severeTilt' || collapsed;
  const stress = Math.min(1.2, Math.hypot(cake.tiltX, cake.tiltZ));
  const creamOffset = (severe ? 0.18 : condition === 'slightTilt' ? 0.08 : 0.02) * state.wind.direction;
  const cakeSquash = collapsed ? 0.44 : severe ? 0.78 : 1;
  const layerSlip = severe ? 0.16 * state.wind.direction : condition === 'slightTilt' ? 0.06 * state.wind.direction : 0;
  const berryDrop = severe ? -0.36 : stress > 0.4 ? -0.12 : 0;
  const airborneCake = condition === 'faceCake';
  const cakeFlight = airborneCake ? Math.min(1, stress) : 0;

  return (
    <group
      position={[
        cakeFlight * state.wind.direction * 0.55,
        0.82 + cakeFlight * 0.92 + Math.sin(state.remainingSeconds * 14) * stress * 0.02,
        1.06 + cakeFlight * 0.95
      ]}
      rotation={[cake.tiltZ * 1.2 + cakeFlight * 0.55, cakeFlight * state.wind.direction * 0.8, -cake.tiltX * 1.2]}
      scale={[0.56, 0.56, 0.56]}
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
  );
}

function DeliveryScooterModel() {
  const obj = useLoader(OBJLoader, '/models/delivery-scooter-textured/scooter.obj');
  const [albedoMap, normalMap, roughnessMap, metalnessMap] = useLoader(TextureLoader, [
    '/models/delivery-scooter-textured/texture_pbr_20250901.png',
    '/models/delivery-scooter-textured/texture_pbr_20250901_normal.png',
    '/models/delivery-scooter-textured/texture_pbr_20250901_roughness.png',
    '/models/delivery-scooter-textured/texture_pbr_20250901_metallic.png'
  ]);

  const scooter = useMemo(() => {
    albedoMap.colorSpace = SRGBColorSpace;
    for (const texture of [albedoMap, normalMap, roughnessMap, metalnessMap]) {
      texture.flipY = true;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.needsUpdate = true;
    }

    const material = new MeshStandardMaterial({
      map: albedoMap,
      normalMap,
      roughnessMap,
      metalnessMap,
      roughness: 0.72,
      metalness: 0.18
    });
    const model = obj.clone(true);

    model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const bounds = new Box3().setFromObject(model);
    const size = new Vector3();
    const center = new Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    const scale = 1 / Math.max(size.x, size.y, size.z, 1);

    model.position.sub(center);
    model.scale.setScalar(scale * 2.25);

    return model;
  }, [albedoMap, metalnessMap, normalMap, obj, roughnessMap]);

  return <primitive object={scooter} position={[0, 0.26, 0.38]} rotation={[0, Math.PI / 2, 0]} />;
}
