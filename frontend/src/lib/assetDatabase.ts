/**
 * Asset Database
 * Centralized catalog of all available models with metadata
 * In production: would be backed by HTTP API
 */

export interface AssetMetadata {
  id: string;
  name: string;
  category: 'robot' | 'building' | 'terrain' | 'sensor' | 'light' | 'furniture' | 'nature';
  description: string;
  thumbnail: string; // Base64 or URL
  triangles: number;
  sdfVersion: string;
  author?: string;
  tags?: string[];
  modelPath?: string; // Path to model.sdf or ZIP
}

export const ASSET_CATEGORIES = [
  { id: 'robot', label: 'Robots', icon: '🤖' },
  { id: 'building', label: 'Buildings', icon: '🏢' },
  { id: 'terrain', label: 'Terrain', icon: '🏔️' },
  { id: 'sensor', label: 'Sensors', icon: '📡' },
  { id: 'light', label: 'Lights', icon: '💡' },
  { id: 'furniture', label: 'Furniture', icon: '🛋️' },
  { id: 'nature', label: 'Nature', icon: '🌳' },
] as const;

/**
 * Mock asset database
 * In production: populate from Gazebo model database or HTTP API
 */
export const ASSET_DATABASE: AssetMetadata[] = [
  {
    id: 'turtlebot3',
    name: 'TurtleBot3',
    category: 'robot',
    description: 'Mobile robot platform with LiDAR',
    thumbnail: '🤖',
    triangles: 24000,
    sdfVersion: '1.8',
    author: 'ROBOTIS',
    tags: ['mobile', 'ros', 'popular'],
  },
  {
    id: 'pr2',
    name: 'PR2',
    category: 'robot',
    description: 'Humanoid research platform with arms',
    thumbnail: '🦾',
    triangles: 156000,
    sdfVersion: '1.8',
    author: 'Willow Garage',
    tags: ['manipulation', 'humanoid'],
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    category: 'building',
    description: 'Industrial warehouse environment',
    thumbnail: '🏭',
    triangles: 324000,
    sdfVersion: '1.8',
    author: 'Open Robotics',
    tags: ['environment', 'large', 'outdoor'],
  },
  {
    id: 'apartment',
    name: 'Apartment',
    category: 'building',
    description: 'Indoor residential environment',
    thumbnail: '🏠',
    triangles: 156000,
    sdfVersion: '1.8',
    author: 'Open Robotics',
    tags: ['environment', 'indoor'],
  },
  {
    id: 'ground_plane',
    name: 'Ground Plane',
    category: 'terrain',
    description: 'Flat terrain surface',
    thumbnail: '📍',
    triangles: 2,
    sdfVersion: '1.8',
    author: 'Gazebo',
    tags: ['default', 'required'],
  },
  {
    id: 'rough_terrain',
    name: 'Rough Terrain',
    category: 'terrain',
    description: 'Uneven landscape with hills',
    thumbnail: '⛰️',
    triangles: 48000,
    sdfVersion: '1.8',
    author: 'Gazebo',
    tags: ['outdoor', 'challenging'],
  },
  {
    id: 'lidar_sensor',
    name: 'LiDAR Sensor',
    category: 'sensor',
    description: '16-channel LiDAR with 360° FOV',
    thumbnail: '📡',
    triangles: 1200,
    sdfVersion: '1.8',
    author: 'Gazebo',
    tags: ['perception', 'ros'],
  },
  {
    id: 'camera',
    name: 'RGB Camera',
    category: 'sensor',
    description: 'RGB camera with 1920x1080 resolution',
    thumbnail: '📷',
    triangles: 600,
    sdfVersion: '1.8',
    author: 'Gazebo',
    tags: ['vision', 'ros'],
  },
  {
    id: 'sun',
    name: 'Sun',
    category: 'light',
    description: 'Directional light source',
    thumbnail: '☀️',
    triangles: 0,
    sdfVersion: '1.8',
    author: 'Gazebo',
    tags: ['lighting', 'default'],
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    category: 'light',
    description: 'Focused spotlight with shadow',
    thumbnail: '🔦',
    triangles: 0,
    sdfVersion: '1.8',
    author: 'Gazebo',
    tags: ['lighting', 'dynamic'],
  },
];

/**
 * Get all assets for a category
 */
export function getAssetsByCategory(category: string): AssetMetadata[] {
  return ASSET_DATABASE.filter((asset) => asset.category === category);
}

/**
 * Search assets by name and tags
 */
export function searchAssets(query: string): AssetMetadata[] {
  const q = query.toLowerCase();
  return ASSET_DATABASE.filter(
    (asset) =>
      asset.name.toLowerCase().includes(q) ||
      asset.description.toLowerCase().includes(q) ||
      asset.tags?.some((tag) => tag.toLowerCase().includes(q))
  );
}

/**
 * Get asset by ID
 */
export function getAssetById(id: string): AssetMetadata | undefined {
  return ASSET_DATABASE.find((asset) => asset.id === id);
}
