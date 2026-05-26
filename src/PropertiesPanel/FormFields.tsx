'use client';

import React from 'react';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

export function NumberField({ label, value, onChange, step = 0.01, min, max }: Props) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <label className="text-zinc-400 text-xs w-12 flex-shrink-0">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5 min-w-0"
      />
    </div>
  );
}

interface TextProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function TextField({ label, value, onChange }: TextProps) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <label className="text-zinc-400 text-xs w-12 flex-shrink-0">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5 min-w-0"
      />
    </div>
  );
}

interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function CheckboxField({ label, value, onChange }: CheckboxProps) {
  const fieldId = `chk-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return (
    <div className="flex items-center gap-2 mb-1">
      <input
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="accent-blue-500"
        id={fieldId}
      />
      <label htmlFor={fieldId} className="text-zinc-400 text-xs cursor-pointer">{label}</label>
    </div>
  );
}

interface ColorProps {
  label: string;
  value: [number, number, number, number];
  onChange: (v: [number, number, number, number]) => void;
}

export function ColorField({ label, value, onChange }: ColorProps) {
  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
  const hexColor = `#${toHex(value[0])}${toHex(value[1])}${toHex(value[2])}`;

  const fromHex = (hex: string): [number, number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b, value[3]];
  };

  return (
    <div className="flex items-center gap-1 mb-1">
      <label className="text-zinc-400 text-xs w-16 flex-shrink-0">{label}</label>
      <input
        type="color"
        value={hexColor}
        onChange={e => onChange(fromHex(e.target.value))}
        className="w-8 h-6 rounded border-0 cursor-pointer bg-zinc-800"
      />
      <span className="text-zinc-500 text-xs">{hexColor}</span>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function PropSection({ title, children }: SectionProps) {
  return (
    <div className="mb-3">
      <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1 pb-0.5 border-b border-zinc-700">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

interface PoseProps {
  pose: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
  onChange: (pose: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number }) => void;
}

export function PoseFields({ pose, onChange }: PoseProps) {
  return (
    <div>
      <div className="flex gap-1 mb-1">
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} className="flex-1">
            <label className="text-zinc-500 text-xs block text-center">{axis.toUpperCase()}</label>
            <input
              type="number"
              value={pose[axis]}
              step={0.01}
              onChange={e => onChange({ ...pose, [axis]: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {(['roll', 'pitch', 'yaw'] as const).map(axis => (
          <div key={axis} className="flex-1">
            <label className="text-zinc-500 text-xs block text-center">{axis.charAt(0).toUpperCase() + axis.slice(1)}</label>
            <input
              type="number"
              value={pose[axis]}
              step={0.01}
              onChange={e => onChange({ ...pose, [axis]: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
