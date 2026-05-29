import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import type { GameState } from '../game/gameState';
import { RiderView } from './RiderView';
import { World } from './World';

type GameCanvasProps = {
  state: GameState;
};

export function GameCanvas({ state }: GameCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 2.1, -5], rotation: [0, Math.PI, 0], fov: 72 }}
      shadows
      gl={{ antialias: true }}
      data-testid="game-canvas"
    >
      <color attach="background" args={['#9ed7dc']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} castShadow />
      <Sky sunPosition={[20, 20, 10]} turbidity={2} rayleigh={0.7} />
      <World />
      <RiderView state={state} />
    </Canvas>
  );
}
