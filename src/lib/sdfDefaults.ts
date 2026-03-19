import { SDFGeometry, SDFLight, SDFMaterial, SDFModel, SDFLink, SDFVisual, SDFCollision, PhysicsConfig, SceneConfig, WorldState, Pose6D } from '@/types/sdf.types';
import { v4 as uuidv4 } from 'uuid';

export const defaultPose = (): Pose6D => ({ x: 0, y: 0, z: 0, roll: 0, pitch: 0, yaw: 0 });

export const defaultMaterial = (): SDFMaterial => ({
  ambient: [0.4, 0.4, 0.4, 1],
  diffuse: [0.8, 0.8, 0.8, 1],
  specular: [0.1, 0.1, 0.1, 1],
  emissive: [0, 0, 0, 1],
});

export const defaultBoxGeometry = (): SDFGeometry => ({ type: 'box', size: [1, 1, 1] });
export const defaultSphereGeometry = (): SDFGeometry => ({ type: 'sphere', radius: 0.5 });
export const defaultCylinderGeometry = (): SDFGeometry => ({ type: 'cylinder', radius: 0.5, length: 1 });
export const defaultPlaneGeometry = (): SDFGeometry => ({ type: 'plane', normal: [0, 0, 1], size: [100, 100] });

export const defaultVisual = (geom: SDFGeometry, name = 'visual'): SDFVisual => ({
  id: uuidv4(),
  name,
  geometry: geom,
  material: defaultMaterial(),
  castShadows: true,
});

export const defaultCollision = (geom: SDFGeometry, name = 'collision'): SDFCollision => ({
  id: uuidv4(),
  name,
  geometry: geom,
  enabled: true,
});

export const defaultLink = (geom: SDFGeometry, name = 'link'): SDFLink => ({
  id: uuidv4(),
  name,
  pose: defaultPose(),
  visuals: [defaultVisual(geom, 'visual')],
  collisions: [defaultCollision(geom, 'collision')],
});

export const defaultModel = (geom: SDFGeometry, name: string): SDFModel => ({
  id: uuidv4(),
  name,
  isStatic: false,
  pose: defaultPose(),
  links: [defaultLink(geom, 'link')],
  visible: true,
});

export const defaultLight = (type: SDFLight['type'], name: string): SDFLight => ({
  id: uuidv4(),
  name,
  type,
  pose: { x: 0, y: 0, z: 10, roll: 0, pitch: 0, yaw: 0 },
  diffuse: [0.8, 0.8, 0.8, 1],
  specular: [0.2, 0.2, 0.2, 1],
  attenuationRange: 1000,
  attenuationConstant: 0.9,
  attenuationLinear: 0.01,
  attenuationQuadratic: 0.001,
  castShadows: false,
  direction: type === 'directional' ? [-0.5, 0.1, -0.9] : [0, 0, -1],
  innerAngle: type === 'spot' ? 0.1 : undefined,
  outerAngle: type === 'spot' ? 0.5 : undefined,
  falloff: type === 'spot' ? 0.8 : undefined,
  visible: true,
});

export const defaultPhysics = (): PhysicsConfig => ({
  type: 'ode',
  maxStepSize: 0.001,
  realTimeUpdateRate: 1000,
  realTimeFactor: 1,
  gravity: [0, 0, -9.8],
});

export const defaultScene = (): SceneConfig => ({
  ambient: [0.4, 0.4, 0.4, 1],
  background: [0.7, 0.7, 0.7, 1],
  shadows: true,
  grid: true,
});

export const defaultWorldState = (): WorldState => ({
  worldName: 'my_world',
  sdfVersion: '1.7',
  physics: defaultPhysics(),
  scene: defaultScene(),
  models: [],
  lights: [defaultLight('directional', 'sun')],
  includes: [],
});
