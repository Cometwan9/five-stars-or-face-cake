import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { GameState } from '../game/gameState';
import { RiderView } from './RiderView';
import { World } from './World';

type GameCanvasProps = {
  state: GameState;
};

export function GameCanvas({ state }: GameCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.55, -3.65], rotation: [-0.16, Math.PI, 0], fov: 78 }}
      shadows
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      data-testid="game-canvas"
    >
      <color attach="background" args={['#63c7df']} />
      <fog attach="fog" args={['#63c7df', 32, 132]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 12, -4]} intensity={1.35} castShadow />
      <World state={state} />
      <RiderView state={state} />
      <FollowCamera state={state} />
    </Canvas>
  );
}

function FollowCamera({ state }: GameCanvasProps) {
  const { camera } = useThree();

  useFrame(() => {
    const { position, heading } = state.vehicle;
    const forwardX = Math.sin(heading);
    const forwardZ = Math.cos(heading);

    camera.position.set(position.x - forwardX * 3.65, 1.55, position.z - forwardZ * 3.65);
    camera.lookAt(position.x + forwardX * 7.8, 0.58, position.z + forwardZ * 7.8);
  });

  return null;
}
