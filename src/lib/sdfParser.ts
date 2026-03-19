import { XMLParser } from 'fast-xml-parser';
import { v4 as uuidv4 } from 'uuid';
import {
  WorldState, SDFModel, SDFLight, SDFInclude, SDFLink, SDFVisual, SDFCollision,
  SDFGeometry, SDFMaterial, PhysicsConfig, SceneConfig, Pose6D, LightType
} from '@/types/sdf.types';
import { defaultPhysics, defaultScene, defaultMaterial, defaultPose } from './sdfDefaults';

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  isArray: (name: string) => {
    return ['model', 'light', 'include', 'link', 'visual', 'collision', 'plugin'].includes(name);
  },
};

function parseBoolean(val: unknown): boolean {
  return val === true || val === 'true' || val === 1;
}

function parsePose(poseVal: unknown): Pose6D {
  if (poseVal == null) return defaultPose();
  const s = String(poseVal).trim();
  const parts = s.split(/\s+/).map(Number);
  return {
    x: parts[0] ?? 0,
    y: parts[1] ?? 0,
    z: parts[2] ?? 0,
    roll: parts[3] ?? 0,
    pitch: parts[4] ?? 0,
    yaw: parts[5] ?? 0,
  };
}

function parseColor(colorVal: unknown): [number, number, number, number] {
  if (colorVal == null) return [1, 1, 1, 1];
  const parts = String(colorVal).trim().split(/\s+/).map(Number);
  return [parts[0] ?? 1, parts[1] ?? 1, parts[2] ?? 1, parts[3] ?? 1];
}

function parseVec3(val: unknown): [number, number, number] {
  if (val == null) return [0, 0, 0];
  const parts = String(val).trim().split(/\s+/).map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function parseGeometry(geomObj: Record<string, unknown>): SDFGeometry {
  if (!geomObj) return { type: 'box', size: [1, 1, 1] };

  if (geomObj.box) {
    const box = geomObj.box as Record<string, unknown>;
    const sizeStr = String(box.size ?? '1 1 1');
    const parts = sizeStr.split(/\s+/).map(Number);
    return { type: 'box', size: [parts[0] ?? 1, parts[1] ?? 1, parts[2] ?? 1] };
  }
  if (geomObj.sphere) {
    const s = geomObj.sphere as Record<string, unknown>;
    return { type: 'sphere', radius: Number(s.radius ?? 0.5) };
  }
  if (geomObj.cylinder) {
    const c = geomObj.cylinder as Record<string, unknown>;
    return { type: 'cylinder', radius: Number(c.radius ?? 0.5), length: Number(c.length ?? 1) };
  }
  if (geomObj.plane) {
    const p = geomObj.plane as Record<string, unknown>;
    const normal = parseVec3(p.normal ?? '0 0 1');
    const sizeParts = String(p.size ?? '100 100').split(/\s+/).map(Number);
    return { type: 'plane', normal, size: [sizeParts[0] ?? 100, sizeParts[1] ?? 100] };
  }
  if (geomObj.mesh) {
    const m = geomObj.mesh as Record<string, unknown>;
    const scaleVal = m.scale ? parseVec3(m.scale) : undefined;
    return { type: 'mesh', uri: String(m.uri ?? ''), scale: scaleVal };
  }
  return { type: 'box', size: [1, 1, 1] };
}

function parseMaterial(matObj: Record<string, unknown> | undefined): SDFMaterial {
  if (!matObj) return defaultMaterial();
  return {
    ambient: parseColor(matObj.ambient),
    diffuse: parseColor(matObj.diffuse),
    specular: parseColor(matObj.specular),
    emissive: parseColor(matObj.emissive),
  };
}

function parseVisual(vObj: Record<string, unknown>, idx: number): SDFVisual {
  return {
    id: uuidv4(),
    name: String(vObj['@_name'] ?? `visual_${idx}`),
    geometry: parseGeometry(vObj.geometry as Record<string, unknown> ?? {}),
    material: parseMaterial(vObj.material as Record<string, unknown> | undefined),
    castShadows: parseBoolean(vObj.cast_shadows),
  };
}

function parseCollision(cObj: Record<string, unknown>, idx: number): SDFCollision {
  return {
    id: uuidv4(),
    name: String(cObj['@_name'] ?? `collision_${idx}`),
    geometry: parseGeometry(cObj.geometry as Record<string, unknown> ?? {}),
    enabled: true,
  };
}

function parseLink(lObj: Record<string, unknown>, idx: number): SDFLink {
  const visuals = (lObj.visual as Record<string, unknown>[] ?? []).map((v, i) => parseVisual(v, i));
  const collisions = (lObj.collision as Record<string, unknown>[] ?? []).map((c, i) => parseCollision(c, i));
  return {
    id: uuidv4(),
    name: String(lObj['@_name'] ?? `link_${idx}`),
    pose: parsePose(lObj.pose),
    visuals,
    collisions,
  };
}

function parseModel(mObj: Record<string, unknown>): SDFModel {
  const links = (mObj.link as Record<string, unknown>[] ?? []).map((l, i) => parseLink(l, i));
  return {
    id: uuidv4(),
    name: String(mObj['@_name'] ?? 'model'),
    isStatic: parseBoolean(mObj.static),
    pose: parsePose(mObj.pose),
    links,
    visible: true,
  };
}

function parseLight(lObj: Record<string, unknown>): SDFLight {
  const typeStr = String(lObj['@_type'] ?? 'point').toLowerCase();
  const lightType: LightType = ['point', 'directional', 'spot'].includes(typeStr)
    ? (typeStr as LightType)
    : 'point';

  const attn = lObj.attenuation as Record<string, unknown> | undefined;
  const spot = lObj.spot as Record<string, unknown> | undefined;

  return {
    id: uuidv4(),
    name: String(lObj['@_name'] ?? 'light'),
    type: lightType,
    pose: parsePose(lObj.pose),
    diffuse: parseColor(lObj.diffuse),
    specular: parseColor(lObj.specular),
    attenuationRange: Number(attn?.range ?? 1000),
    attenuationConstant: Number(attn?.constant ?? 0.9),
    attenuationLinear: Number(attn?.linear ?? 0.01),
    attenuationQuadratic: Number(attn?.quadratic ?? 0.001),
    castShadows: parseBoolean(lObj.cast_shadows),
    direction: lObj.direction ? parseVec3(lObj.direction) : undefined,
    innerAngle: spot ? Number(spot.inner_angle ?? 0.1) : undefined,
    outerAngle: spot ? Number(spot.outer_angle ?? 0.5) : undefined,
    falloff: spot ? Number(spot.falloff ?? 0.8) : undefined,
    visible: true,
  };
}

function parseInclude(iObj: Record<string, unknown>): SDFInclude {
  return {
    id: uuidv4(),
    name: String(iObj.name ?? String(iObj.uri ?? 'include').split('/').pop() ?? 'include'),
    uri: String(iObj.uri ?? ''),
    pose: parsePose(iObj.pose),
    isStatic: parseBoolean(iObj.static),
  };
}

function parsePhysics(phObj: Record<string, unknown>): PhysicsConfig {
  const ode = phObj.ode as Record<string, unknown> | undefined;
  const solver = ode?.solver as Record<string, unknown> | undefined;
  const gravVal = phObj.gravity ? parseVec3(phObj.gravity) : ([0, 0, -9.8] as [number, number, number]);
  return {
    type: String(phObj['@_type'] ?? 'ode'),
    maxStepSize: Number(solver?.dt ?? phObj.max_step_size ?? 0.001),
    realTimeUpdateRate: Number(phObj.real_time_update_rate ?? 1000),
    realTimeFactor: Number(phObj.real_time_factor ?? 1),
    gravity: gravVal,
  };
}

function parseScene(scObj: Record<string, unknown>): SceneConfig {
  return {
    ambient: parseColor(scObj.ambient),
    background: parseColor(scObj.background),
    shadows: parseBoolean(scObj.shadows),
    grid: true,
  };
}

export function parseSDF(xmlString: string): WorldState {
  const parser = new XMLParser(parserOptions);
  const result = parser.parse(xmlString);

  const sdf = result.sdf ?? result;
  const sdfVersion = String(sdf['@_version'] ?? '1.7');
  const version = (sdfVersion === '1.6' ? '1.6' : '1.7') as '1.6' | '1.7';

  const world = sdf.world ?? {};
  const worldName = String(world['@_name'] ?? 'my_world');

  const models: SDFModel[] = (world.model as Record<string, unknown>[] ?? []).map(parseModel);
  const lights: SDFLight[] = (world.light as Record<string, unknown>[] ?? []).map(parseLight);
  const includes: SDFInclude[] = (world.include as Record<string, unknown>[] ?? []).map(parseInclude);

  const physics: PhysicsConfig = world.physics
    ? parsePhysics(world.physics as Record<string, unknown>)
    : defaultPhysics();

  const scene: SceneConfig = world.scene
    ? parseScene(world.scene as Record<string, unknown>)
    : defaultScene();

  return { worldName, sdfVersion: version, physics, scene, models, lights, includes };
}
