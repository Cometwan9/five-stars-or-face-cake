import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { GameState } from '../game/gameState';
import { RiderView } from './RiderView';
import { World } from './World';

export type CameraMode = 'first' | 'third';

type GameCanvasProps = {
  state: GameState;
  cameraMode: CameraMode;
  onCustomerInteract: () => void;
};

export function GameCanvas({ state, cameraMode, onCustomerInteract }: GameCanvasProps) {
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
      <FollowCamera state={state} cameraMode={cameraMode} />
    </Canvas>
  );
}

function FollowCamera({ state, cameraMode }: Pick<GameCanvasProps, 'state' | 'cameraMode'>) {
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

    if (cameraMode === 'first') {
      camera.position.set(
        position.x + forwardX * 1.45 + shakeX * 0.7,
        2.08 + shakeY,
        position.z + forwardZ * 1.08
      );
      camera.lookAt(position.x + forwardX * 10.5, 0.86 + shakeY * 0.35, position.z + forwardZ * 10.5);
      return;
    }

    camera.position.set(
      position.x - forwardX * 5.15 + shakeX,
      2.65 + shakeY,
      position.z - forwardZ * 6.2
    );
    camera.lookAt(position.x + forwardX * 5.8, 0.72 + shakeY * 0.4, position.z + forwardZ * 5.8);
  });

  return null;
}
