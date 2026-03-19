import { XMLBuilder } from 'fast-xml-parser';
import {
  WorldState, SDFModel, SDFLight, SDFInclude, SDFLink, SDFVisual, SDFGeometry, SDFMaterial, Pose6D
} from '@/types/sdf.types';

const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: true,
};

function formatPose(p: Pose6D): string {
  return [p.x, p.y, p.z, p.roll, p.pitch, p.yaw]
    .map(v => Number(v.toFixed(6)).toString())
    .join(' ');
}

function formatColor(c: [number, number, number, number]): string {
  return c.map(v => Number(v.toFixed(4)).toString()).join(' ');
}

function formatVec3(v: [number, number, number]): string {
  return v.map(n => Number(n.toFixed(6)).toString()).join(' ');
}

function buildGeometry(geom: SDFGeometry): Record<string, unknown> {
  switch (geom.type) {
    case 'box':
      return { box: { size: geom.size.join(' ') } };
    case 'sphere':
      return { sphere: { radius: geom.radius } };
    case 'cylinder':
      return { cylinder: { radius: geom.radius, length: geom.length } };
    case 'plane':
      return { plane: { normal: formatVec3(geom.normal), size: geom.size.join(' ') } };
    case 'mesh':
      return { mesh: { uri: geom.uri, ...(geom.scale ? { scale: formatVec3(geom.scale) } : {}) } };
    default:
      return { box: { size: '1 1 1' } };
  }
}

function buildMaterial(mat: SDFMaterial): Record<string, unknown> {
  return {
    ambient: formatColor(mat.ambient),
    diffuse: formatColor(mat.diffuse),
    specular: formatColor(mat.specular),
    emissive: formatColor(mat.emissive),
  };
}

function buildVisual(v: SDFVisual): Record<string, unknown> {
  return {
    '@_name': v.name,
    cast_shadows: v.castShadows ? 1 : 0,
    geometry: buildGeometry(v.geometry),
    material: buildMaterial(v.material),
  };
}

function buildLink(l: SDFLink): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    '@_name': l.name,
    pose: formatPose(l.pose),
    visual: l.visuals.map(buildVisual),
    collision: l.collisions.map(c => ({
      '@_name': c.name,
      geometry: buildGeometry(c.geometry),
    })),
  };
  return obj;
}

function buildModel(m: SDFModel): Record<string, unknown> {
  return {
    '@_name': m.name,
    static: m.isStatic ? 1 : 0,
    pose: formatPose(m.pose),
    link: m.links.map(buildLink),
  };
}

function buildLight(l: SDFLight): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    '@_name': l.name,
    '@_type': l.type,
    pose: formatPose(l.pose),
    diffuse: formatColor(l.diffuse),
    specular: formatColor(l.specular),
    cast_shadows: l.castShadows ? 1 : 0,
    attenuation: {
      range: l.attenuationRange,
      constant: l.attenuationConstant,
      linear: l.attenuationLinear,
      quadratic: l.attenuationQuadratic,
    },
  };

  if (l.direction) {
    obj.direction = formatVec3(l.direction);
  }

  if (l.type === 'spot' && l.innerAngle != null) {
    obj.spot = {
      inner_angle: l.innerAngle,
      outer_angle: l.outerAngle ?? 0.5,
      falloff: l.falloff ?? 0.8,
    };
  }

  return obj;
}

function buildInclude(inc: SDFInclude): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    uri: inc.uri,
    pose: formatPose(inc.pose),
    name: inc.name,
  };
  if (inc.isStatic != null) {
    obj.static = inc.isStatic ? 1 : 0;
  }
  return obj;
}

export function serializeWorldState(world: WorldState): string {
  const builder = new XMLBuilder(builderOptions);

  const worldObj: Record<string, unknown> = {
    '@_name': world.worldName,
    physics: {
      '@_type': world.physics.type,
      max_step_size: world.physics.maxStepSize,
      real_time_update_rate: world.physics.realTimeUpdateRate,
      real_time_factor: world.physics.realTimeFactor,
      gravity: formatVec3(world.physics.gravity),
    },
    scene: {
      ambient: formatColor(world.scene.ambient),
      background: formatColor(world.scene.background),
      shadows: world.scene.shadows ? 1 : 0,
    },
    light: world.lights.map(buildLight),
    model: world.models.map(buildModel),
    include: world.includes.map(buildInclude),
  };

  const sdfObj = {
    '?xml': { '@_version': '1.0' },
    sdf: {
      '@_version': world.sdfVersion,
      world: worldObj,
    },
  };

  const xml = builder.build(sdfObj);
  return '<?xml version="1.0"?>\n' + xml.replace(/^<\?xml[^>]*\?>\n?/, '');
}
