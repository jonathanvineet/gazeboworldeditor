export interface Pose6D {
  x: number;
  y: number;
  z: number;
  roll: number;
  pitch: number;
  yaw: number;
}

export interface PhysicsConfig {
  type: string;
  maxStepSize: number;
  realTimeUpdateRate: number;
  realTimeFactor: number;
  gravity: [number, number, number];
}

export interface SceneConfig {
  ambient: [number, number, number, number];
  background: [number, number, number, number];
  shadows: boolean;
  grid: boolean;
}

export type SDFGeometry =
  | { type: 'box'; size: [number, number, number] }
  | { type: 'sphere'; radius: number }
  | { type: 'cylinder'; radius: number; length: number }
  | { type: 'plane'; normal: [number, number, number]; size: [number, number] }
  | { type: 'mesh'; uri: string; scale?: [number, number, number] };

export interface SDFMaterial {
  ambient: [number, number, number, number];
  diffuse: [number, number, number, number];
  specular: [number, number, number, number];
  emissive: [number, number, number, number];
}

export interface SDFVisual {
  id: string;
  name: string;
  geometry: SDFGeometry;
  material: SDFMaterial;
  castShadows: boolean;
}

export interface SDFCollision {
  id: string;
  name: string;
  geometry: SDFGeometry;
  enabled: boolean;
}

export interface SDFLink {
  id: string;
  name: string;
  pose: Pose6D;
  visuals: SDFVisual[];
  collisions: SDFCollision[];
}

export interface SDFModel {
  id: string;
  name: string;
  isStatic: boolean;
  pose: Pose6D;
  links: SDFLink[];
  visible: boolean;
}

export type LightType = 'point' | 'directional' | 'spot';

export interface SDFLight {
  id: string;
  name: string;
  type: LightType;
  pose: Pose6D;
  diffuse: [number, number, number, number];
  specular: [number, number, number, number];
  attenuationRange: number;
  attenuationConstant: number;
  attenuationLinear: number;
  attenuationQuadratic: number;
  castShadows: boolean;
  direction?: [number, number, number];
  innerAngle?: number;
  outerAngle?: number;
  falloff?: number;
  visible: boolean;
}

export interface SDFInclude {
  id: string;
  name: string;
  uri: string;
  pose: Pose6D;
  isStatic?: boolean;
}

export interface WorldState {
  worldName: string;
  sdfVersion: '1.6' | '1.7';
  physics: PhysicsConfig;
  scene: SceneConfig;
  models: SDFModel[];
  lights: SDFLight[];
  includes: SDFInclude[];
}

export type SelectableItem =
  | { kind: 'model'; id: string }
  | { kind: 'light'; id: string }
  | { kind: 'include'; id: string }
  | { kind: 'scene' }
  | { kind: 'physics' };
