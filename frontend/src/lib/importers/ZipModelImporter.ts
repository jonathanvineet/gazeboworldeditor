/**
 * ZIP Model Importer
 * Handles importing Gazebo models from ZIP files with full hierarchy support
 *
 * ZIP Structure:
 * model/
 *   ├── model.config
 *   ├── model.sdf
 *   ├── meshes/
 *   │   └── *.dae, *.stl, *.obj
 *   ├── materials/
 *   │   └── *.material, *.png
 *   └── textures/
 *       └── *.png
 */

import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';
import type { WorldEntity, Model, Link, Visual, Collision } from '@/types/sdf';

export interface ZipModelImportResult {
  model: Model;
  meshFiles: Map<string, Blob>;
  textureFiles: Map<string, Blob>;
  materialFiles: Map<string, Blob>;
}

/**
 * Parse model.config XML to get metadata
 */
async function parseModelConfig(configXml: string): Promise<any> {
  try {
    return await parseStringPromise(configXml);
  } catch (error) {
    console.error('Failed to parse model.config:', error);
    return null;
  }
}

/**
 * Parse model.sdf XML to get structure
 */
async function parseModelSdf(sdfXml: string): Promise<any> {
  try {
    return await parseStringPromise(sdfXml);
  } catch (error) {
    console.error('Failed to parse model.sdf:', error);
    return null;
  }
}

/**
 * Build model from parsed SDF
 * Creates proper hierarchy: Model > Links > Visuals/Collisions
 */
function buildModelFromSdf(parsed: any, modelName: string): Model {
  // Extract model section
  const modelData = parsed?.sdf?.model?.[0];

  if (!modelData) {
    throw new Error('Invalid SDF structure: no model element found');
  }

  // Get model attributes
  const modelId = modelData?.$.name || modelName;

  // Parse links
  const links: Link[] = [];
  const linkElements = modelData?.link || [];

  for (const linkData of linkElements) {
    const linkId = linkData?.$.name || `link_${links.length}`;

    // Parse visuals
    const visuals: Visual[] = [];
    const visualElements = linkData?.visual || [];

    for (const vizData of visualElements) {
      const visual: Visual = {
        name: vizData?.$.name || `visual_${visuals.length}`,
        geometry: {
          type: 'mesh', // Placeholder
          data: {},
        },
        material: vizData?.material?.[0] || {},
        cast_shadows: true,
      };
      visuals.push(visual);
    }

    // Parse collisions
    const collisions: Collision[] = [];
    const collisionElements = linkData?.collision || [];

    for (const collData of collisionElements) {
      const collision: Collision = {
        name: collData?.$.name || `collision_${collisions.length}`,
        geometry: {
          type: 'mesh',
          data: {},
        },
      };
      collisions.push(collision);
    }

    // Create link
    const link: Link = {
      id: linkId,
      name: linkId,
      pose: linkData?.pose?.[0] || [0, 0, 0, 0, 0, 0],
      inertial: linkData?.inertial?.[0] || {},
      visuals,
      collisions,
      sensors: [],
    };

    links.push(link);
  }

  // Create model
  const model: Model = {
    id: modelId,
    name: modelId,
    pose: modelData?.pose?.[0] || [0, 0, 0, 0, 0, 0],
    links,
  };

  return model;
}

/**
 * Main ZIP importer function
 * Handles complete import pipeline
 */
export async function importModelZip(zipFile: File): Promise<ZipModelImportResult> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);

  // Find model folder (usually model/ at root)
  let modelPrefix = '';
  const modelFolders = Object.keys(zipContent.files).filter(
    (path) => path.endsWith('model.sdf')
  );

  if (modelFolders.length === 0) {
    throw new Error('No model.sdf found in ZIP');
  }

  modelPrefix = modelFolders[0].replace('model.sdf', '');

  // Read model.sdf
  const sdfFile = zipContent.file(`${modelPrefix}model.sdf`);
  if (!sdfFile) {
    throw new Error('Cannot find model.sdf');
  }

  const sdfXml = await sdfFile.async('string');
  const parsedSdf = await parseModelSdf(sdfXml);

  // Build model structure
  const modelName = zipFile.name.replace('.zip', '');
  const model = buildModelFromSdf(parsedSdf, modelName);

  // Collect all mesh files
  const meshFiles = new Map<string, Blob>();
  const meshExtensions = ['.dae', '.stl', '.obj', '.glb', '.gltf'];

  for (const [path, file] of Object.entries(zipContent.files)) {
    if (path.includes('meshes/') && !file.dir) {
      const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
      if (meshExtensions.includes(ext)) {
        const blob = await file.async('blob');
        meshFiles.set(path, blob);
      }
    }
  }

  // Collect texture and material files
  const textureFiles = new Map<string, Blob>();
  const materialFiles = new Map<string, Blob>();

  for (const [path, file] of Object.entries(zipContent.files)) {
    if (!file.dir) {
      if (path.includes('textures/') || path.includes('materials/')) {
        const blob = await file.async('blob');
        if (path.includes('textures/')) {
          textureFiles.set(path, blob);
        } else {
          materialFiles.set(path, blob);
        }
      }
    }
  }

  return {
    model,
    meshFiles,
    textureFiles,
    materialFiles,
  };
}

/**
 * Create a file picker for ZIP imports
 */
export function createZipFilePicker(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';

    input.onchange = () => {
      const files = input.files;
      if (files && files.length > 0) {
        resolve(files[0]);
      } else {
        resolve(null);
      }
    };

    input.click();
  });
}
