import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { GameState } from '../game/gameState';
import { RiderView } from './RiderView';
import { World } from './World';

type GameCanvasProps = {
  state: GameState;
  onCustomerInteract: () => void;
};

export function GameCanvas({ state, onCustomerInteract }: GameCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.55, -3.65], rotation: [-0.16, Math.PI, 0], fov: 78 }}
      shadows
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      data-testid="game-canvas"
    >
      <color attach="background" args={['#d7824f']} />
      <fog attach="fog" args={['#d7824f', 24, 118]} />
      <ambientLight intensity={0.78} color="#8cffb7" />
      <directionalLight position={[5, 10, -7]} intensity={1.45} color="#ffcf7a" castShadow />
      <pointLight position={[0, 2.2, 2.5]} intensity={0.85} color="#3dffe0" />
      <World state={state} onCustomerInteract={onCustomerInteract} />
      <RiderView state={state} />
      <FollowCamera state={state} />
    </Canvas>
  );
}

function FollowCamera({ state }: Pick<GameCanvasProps, 'state'>) {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const { position, heading } = state.vehicle;
    const forwardX = Math.sin(heading);
    const forwardZ = Math.cos(heading);
    const speedPressure = Math.min(1, Math.abs(state.vehicle.speed) / 14);
    const cakePressure = Math.min(1, Math.hypot(state.cake.tiltX, state.cake.tiltZ));
    const timePressure = state.remainingSeconds < 18 ? 1 : 0;
    const shake = (speedPressure * 0.024 + cakePressure * 0.032 + timePressure * 0.025);
    const pulse = clock.elapsedTime * (14 + speedPressure * 14);
    const shakeX = Math.sin(pulse) * shake;
    const shakeY = Math.cos(pulse * 0.73) * shake * 0.65;

    camera.position.set(
      position.x - forwardX * 3.55 + shakeX,
      1.42 + shakeY,
      position.z - forwardZ * 3.55
    );
    camera.lookAt(position.x + forwardX * 8.8, 0.5 + shakeY * 0.4, position.z + forwardZ * 8.8);
  });

  return null;
}
