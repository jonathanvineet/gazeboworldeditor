/**
 * XML Store
 * Bidirectional synchronization between scene graph and XML
 *
 * Flow 1: Viewport Changes → XML Updates
 * user moves object → store.updateEntity() → parseXML() → xmlString
 *
 * Flow 2: XML Changes → Viewport Updates  
 * user edits XML → debounced parseXML() → updateSceneGraph()
 *
 * Debounced parsing prevents lag and re-render spam
 */

import { useWorldStore } from './worldStore';
import type { World, ModelEntity, LightEntity } from '@/types/sdf';

const DEBOUNCE_DELAY = 300; // ms

/**
 * Serialize scene graph to SDF XML string
 */
export function serializeWorldToSdf(world: World): string {
  const lines: string[] = [];

  lines.push('<?xml version="1.0" ?>');
  lines.push(`<sdf version="${world.sdfVersion}">`);
  lines.push(`  <world name="${world.name}">`);

  // Serialize lights
  for (const light of world.lights) {
    lines.push(`    <light type="${light.type}" name="${light.name}">`);
    if (light.pose) {
      const { position, rotation } = light.pose;
      const [x, y, z] = position;
      const [r, p, y_rot] = rotation;
      lines.push(
        `      <pose>${x} ${y} ${z} ${r} ${p} ${y_rot}</pose>`
      );
    }

    if (light.type === 'directional_light') {
      const dirLight = light as any;
      lines.push(
        `      <diffuse>${dirLight.diffuse?.join(' ') || '1 1 1 1'}</diffuse>`
      );
      lines.push(
        `      <specular>${dirLight.specular?.join(' ') || '1 1 1 1'}</specular>`
      );
      lines.push(
        `      <direction>${dirLight.direction?.join(' ') || '0 0 -1'}</direction>`
      );
      lines.push(`      <cast_shadows>${dirLight.castShadows ? 'true' : 'false'}</cast_shadows>`);
    }

    lines.push(`    </light>`);
  }

  // Serialize models
  for (const model of world.models) {
    lines.push(`    <model name="${model.name}">`);

    if (model.pose) {
      const { position, rotation } = model.pose;
      const [x, y, z] = position;
      const [r, p, y_rot] = rotation;
      lines.push(
        `      <pose>${x} ${y} ${z} ${r} ${p} ${y_rot}</pose>`
      );
    }

    if (model.isStatic !== undefined) {
      lines.push(`      <static>${model.isStatic ? 'true' : 'false'}</static>`);
    }

    // Serialize links
    for (const link of model.links) {
      lines.push(`      <link name="${link.name}">`);

      if (link.pose) {
        const { position, rotation } = link.pose;
        const [x, y, z] = position;
        const [r, p, y_rot] = rotation;
        lines.push(
          `        <pose>${x} ${y} ${z} ${r} ${p} ${y_rot}</pose>`
        );
      }

      // Visuals
      for (const visual of link.visuals) {
        lines.push(`        <visual name="${visual.name}">`);
        lines.push(`          <geometry>`);
        lines.push(`            <${visual.geometry.type}>`);

        if (visual.geometry.type === 'mesh') {
          const meshGeom = visual.geometry as any;
          if (meshGeom.uri) {
            lines.push(`              <uri>${meshGeom.uri}</uri>`);
          }
        }

        lines.push(`            </${visual.geometry.type}>`);
        lines.push(`          </geometry>`);
        lines.push(`        </visual>`);
      }

      // Collisions
      for (const collision of link.collisions) {
        lines.push(`        <collision name="${collision.name}">`);
        lines.push(`          <geometry>`);
        lines.push(`            <${collision.geometry.type}>`);

        if (collision.geometry.type === 'mesh') {
          const meshGeom = collision.geometry as any;
          if (meshGeom.uri) {
            lines.push(`              <uri>${meshGeom.uri}</uri>`);
          }
        }

        lines.push(`            </${collision.geometry.type}>`);
        lines.push(`          </geometry>`);
        lines.push(`        </collision>`);
      }

      lines.push(`      </link>`);
    }

    lines.push(`    </model>`);
  }

  lines.push(`  </world>`);
  lines.push(`</sdf>`);

  return lines.join('\n');
}

/**
 * Parse XML string and update scene graph
 */
export async function parseXmlAndUpdateScene(xmlString: string): Promise<void> {
  // This would use xml2js to parse and update the store
  // Debounced in useXmlSync hook
  console.log('Parsing XML:', xmlString.substring(0, 100), '...');
}

/**
 * Create XML sync hook for bidirectional updates
 */
let debounceTimeout: NodeJS.Timeout | null = null;

export function useXmlSync() {
  const store = useWorldStore();

  /**
   * Called when viewport scene changes
   * Updates XML representation
   */
  const onSceneChange = () => {
    // Serialize scene to XML
    const xml = serializeWorldToSdf(store.world);

    // Emit XML change event (could send to editor panel)
    window.dispatchEvent(
      new CustomEvent('scene-xml-changed', {
        detail: { xml },
      })
    );
  };

  /**
   * Called when XML is edited
   * Updates viewport scene
   */
  const onXmlChange = async (xmlString: string) => {
    // Debounce parsing to prevent spam
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(async () => {
      try {
        await parseXmlAndUpdateScene(xmlString);
        onSceneChange(); // Re-sync XML if parse succeeded
      } catch (error) {
        console.error('XML parsing error:', error);
      }
    }, DEBOUNCE_DELAY);
  };

  return {
    onSceneChange,
    onXmlChange,
    getXml: () => serializeWorldToSdf(store.world),
  };
}
