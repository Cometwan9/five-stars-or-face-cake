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
      camera={{ position: [0, 1.18, -3.2], rotation: [-0.14, Math.PI, 0], fov: 72 }}
      shadows
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      data-testid="game-canvas"
    >
      <color attach="background" args={['#9ed7dc']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} castShadow />
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

    camera.position.set(position.x - forwardX * 3.2, 1.18, position.z - forwardZ * 3.2);
    camera.lookAt(position.x + forwardX * 3.8, 0.2, position.z + forwardZ * 3.8);
  });

  return null;
}
