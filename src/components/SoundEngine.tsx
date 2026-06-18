import { useEffect, useRef, type MutableRefObject } from 'react';
import type { GameState } from '../game/gameState';

type SoundEngineProps = {
  state: GameState;
};

export function SoundEngine({ state }: SoundEngineProps) {
  const audioRef = useRef<AudioContext | null>(null);
  const motorRef = useRef<OscillatorNode | null>(null);
  const motorGainRef = useRef<GainNode | null>(null);
  const lastHazardRef = useRef<string | undefined>(undefined);
  const lastPhaseRef = useRef(state.phase);

  useEffect(() => {
    const unlock = () => {
      const audio = getAudio(audioRef);
      if (audio.state === 'suspended') void audio.resume();
      if (!motorRef.current) {
        const motor = audio.createOscillator();
        const gain = audio.createGain();
        motor.type = 'sawtooth';
        motor.frequency.value = 54;
        gain.gain.value = 0;
        motor.connect(gain).connect(audio.destination);
        motor.start();
        motorRef.current = motor;
        motorGainRef.current = gain;
      }
    };

    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => {
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('pointerdown', unlock);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const motor = motorRef.current;
    const gain = motorGainRef.current;
    if (!audio || !motor || !gain) return;

    const speedPressure = Math.min(1, Math.abs(state.vehicle.speed) / 24);
    motor.frequency.setTargetAtTime(48 + speedPressure * 120, audio.currentTime, 0.06);
    gain.gain.setTargetAtTime(state.phase === 'running' ? 0.018 + speedPressure * 0.04 : 0, audio.currentTime, 0.08);
  }, [state.phase, state.vehicle.speed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.lastHazardText && state.lastHazardText !== lastHazardRef.current) {
      lastHazardRef.current = state.lastHazardText;
      if (state.lastHazardText.includes('罚单')) {
        beep(audio, 740, 0.08, 0.08, 'square');
        window.setTimeout(() => beep(audio, 520, 0.1, 0.08, 'square'), 110);
      } else if (state.lastHazardText.includes('减速带') || state.lastHazardText.includes('坑洞') || state.lastHazardText.includes('路障')) {
        beep(audio, 95, 0.12, 0.13, 'sawtooth');
      } else {
        beep(audio, 420, 0.08, 0.07, 'triangle');
      }
    }

    if (state.phase !== lastPhaseRef.current) {
      lastPhaseRef.current = state.phase;
      if (state.rating?.stars === 6) {
        arpeggio(audio, [520, 660, 820, 1040], 0.09);
      } else if (state.phase === 'finished') {
        arpeggio(audio, [420, 620, 820], 0.1);
      } else if (state.phase === 'failed') {
        arpeggio(audio, [180, 120, 80], 0.14);
      }
    }
  }, [state.lastHazardText, state.phase, state.rating?.stars]);

  return null;
}

function getAudio(audioRef: MutableRefObject<AudioContext | null>): AudioContext {
  if (!audioRef.current) {
    audioRef.current = new AudioContext();
  }

  return audioRef.current;
}

function beep(
  audio: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType
) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, audio.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration + 0.02);
}

function arpeggio(audio: AudioContext, notes: readonly number[], stepSeconds: number) {
  notes.forEach((note, index) => {
    window.setTimeout(() => beep(audio, note, stepSeconds, 0.08, 'triangle'), index * stepSeconds * 1000);
  });
}
