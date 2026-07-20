/**
 * Comprehensive SDF/Gazebo type definitions
 * Source of truth for the scene graph
 */

export type Vector3 = [number, number, number]
export type Vector4 = [number, number, number, number]
export type Color = [number, number, number, number]

// ============================================================================
// BASE TYPES
// ============================================================================

export interface Pose {
  position: Vector3
  rotation: Vector3 // roll, pitch, yaw in radians
}

export interface Scale {
  x: number
  y: number
  z: number
}

export interface BaseEntity {
  id: string
  name: string
  type: string
  
  pose: Pose
  scale: Scale
  
  visible: boolean
  locked: boolean
  
  metadata?: Record<string, unknown>
}

// ============================================================================
// GEOMETRY TYPES
// ============================================================================

export interface BoxGeometry {
  type: "box"
  size: Vector3
}

export interface SphereGeometry {
  type: "sphere"
  radius: number
}

export interface CylinderGeometry {
  type: "cylinder"
  radius: number
  length: number
}

export interface PlaneGeometry {
  type: "plane"
  normal: Vector3
  size: Vector3
}

export interface MeshGeometry {
  type: "mesh"
  uri: string
  scale: Vector3
}

export interface CapsuleGeometry {
  type: "capsule"
  radius: number
  length: number
}

export type GeometryType =
  | BoxGeometry
  | SphereGeometry
  | CylinderGeometry
  | PlaneGeometry
  | MeshGeometry
  | CapsuleGeometry

// ============================================================================
// MATERIAL SYSTEM
// ============================================================================

export interface MaterialConfig {
  name?: string
  
  // PBR
  albedo?: Color
  roughness?: number // 0-1
  metalness?: number // 0-1
  
  // Maps
  albedoMap?: string
  normalMap?: string
  roughnessMap?: string
  metalnessMap?: string
  aoMap?: string
  emissiveMap?: string
  
  // Emission
  emissive?: Color
  emissiveIntensity?: number
  
  // Advanced
  ior?: number // index of refraction
  transmission?: number // 0-1 for transparency
  thickness?: number // for subsurface scattering
  
  // Legacy Gazebo
  ambient?: Color
  diffuse?: Color
  specular?: Color
  shininess?: number
  script?: string // material script URI
}

// ============================================================================
// PHYSICS
// ============================================================================

export interface CollisionGeometry {
  type: "box" | "sphere" | "cylinder" | "plane" | "mesh" | "capsule"
  geometry: GeometryType
}

export interface SurfaceProperties {
  friction?: number
  bounce?: number
  bounceFactor?: number
  bounceThreshold?: number
}

export interface CollisionEntity extends BaseEntity {
  type: "collision"
  geometry: GeometryType
  surface?: SurfaceProperties
  maxContacts?: number
}

export interface Inertial {
  mass: number
  inertia?: {
    ixx: number
    iyy: number
    izz: number
    ixy?: number
    ixz?: number
    iyz?: number
  }
  pose?: Pose
}

// ============================================================================
// SENSORS
// ============================================================================

export interface CameraSensor {
  type: "camera"
  
  imageWidth: number
  imageHeight: number
  hfov: number
  
  clipNear: number
  clipFar: number
  
  topic?: string
  updateRate?: number
}

export interface LaserSensor {
  type: "lidar"
  
  samples: number
  resolution: number
  minAngle: number
  maxAngle: number
  minRange: number
  maxRange: number
  rangeResolution: number
  
  topic?: string
  updateRate?: number
  
  noise?: {
    type: "gaussian"
    mean: number
    stdDev: number
  }
}

export interface ImuSensor {
  type: "imu"
  topic?: string
  updateRate?: number
}

export interface GpsSensor {
  type: "gps"
  topic?: string
  updateRate?: number
}

export interface RaySensor {
  type: "ray"
  samples: number
  minAngle: number
  maxAngle: number
  minRange: number
  maxRange: number
}

export type SensorType = CameraSensor | LaserSensor | ImuSensor | GpsSensor | RaySensor

export interface Sensor extends BaseEntity {
  type: "sensor"
  config: SensorType
  visualization?: boolean
}

// ============================================================================
// VISUALS
// ============================================================================

export interface VisualEntity extends BaseEntity {
  type: "visual"
  geometry: GeometryType
  material?: MaterialConfig
  castShadow?: boolean
  receiveShadow?: boolean
  transparency?: number // 0-1
}

// ============================================================================
// LINKS
// ============================================================================

export interface LinkEntity extends BaseEntity {
  type: "link"
  
  visuals: VisualEntity[]
  collisions: CollisionEntity[]
  sensors: Sensor[]
  
  inertial?: Inertial
  kinematic?: boolean
  
  selfCollide?: boolean
}

// ============================================================================
// JOINTS
// ============================================================================

export interface JointAxis {
  xyz: Vector3
  lower?: number
  upper?: number
  effort?: number
  velocity?: number
  friction?: number
  damping?: number
}

export interface Joint extends BaseEntity {
  type: "joint"
  
  parentLink: string
  childLink: string
  
  jointType: "fixed" | "hinge" | "slider" | "revolute" | "prismatic" | "ball" | "universal" | "screw"
  
  axis?: JointAxis
  axis2?: JointAxis
  
  physics?: {
    provideFeedback?: boolean
  }
}

// ============================================================================
// PLUGINS
// ============================================================================

export interface Plugin {
  filename: string
  name: string
  params?: Record<string, unknown>
}

// ============================================================================
// MODELS
// ============================================================================

export interface ModelEntity extends BaseEntity {
  type: "model"
  
  links: LinkEntity[]
  joints: Joint[]
  plugins: Plugin[]
  
  isStatic: boolean
  selfCollide?: boolean
  allowAutoDisable?: boolean
}

// ============================================================================
// LIGHTS
// ============================================================================

export interface DirectionalLight extends BaseEntity {
  type: "directional_light"
  
  diffuse: Color
  specular: Color
  
  direction: Vector3
  castShadows: boolean
}

export interface PointLight extends BaseEntity {
  type: "point_light"
  
  diffuse: Color
  specular: Color
  
  attenuation: {
    constant: number
    linear: number
    quadratic: number
  }
  
  range: number
  castShadows: boolean
}

export interface SpotLight extends BaseEntity {
  type: "spot_light"
  
  diffuse: Color
  specular: Color
  
  direction: Vector3
  innerAngle: number
  outerAngle: number
  
  attenuation: {
    constant: number
    linear: number
    quadratic: number
  }
  
  range: number
  castShadows: boolean
}

export type LightEntity = DirectionalLight | PointLight | SpotLight

// ============================================================================
// INCLUDES
// ============================================================================

export interface IncludeEntity extends BaseEntity {
  type: "include"
  
  uri: string // e.g., model://sun, model://warehouse/model.sdf
}

// ============================================================================
// PHYSICS CONFIG
// ============================================================================

export interface PhysicsConfig {
  engine: "bullet" | "dart" | "simbody" | "ode"
  
  gravity: Vector3
  
  maxStepSize: number
  realTimeUpdateRate: number
  
  defaultPhysics: {
    type: string
    [key: string]: unknown
  }
}

// ============================================================================
// SCENE CONFIG
// ============================================================================

export interface SceneConfig {
  ambient: Color
  background: Color
  shadows: boolean
  grid: boolean
  
  fog?: {
    enabled: boolean
    type: "linear" | "exponential"
    color: Color
    near: number
    far: number
    density: number
  }
}

// ============================================================================
// WORLD
// ============================================================================

export interface World {
  id: string
  name: string
  sdfVersion: string
  
  physics: PhysicsConfig
  scene: SceneConfig
  
  models: ModelEntity[]
  lights: LightEntity[]
  includes: IncludeEntity[]
  
  createdAt: number
  updatedAt: number
}

// ============================================================================
// HISTORY / COMMAND SYSTEM
// ============================================================================

export interface Command {
  id: string
  type: string
  timestamp: number
  execute(): void
  undo(): void
  redo?(): void
}

export interface EditorState {
  world: World
  selectedEntity?: string
  selectedEntities: string[]
  
  history: Command[]
  historyIndex: number
  
  mode: "translate" | "rotate" | "scale" | "none"
  space: "world" | "local"
  
  showGrid: boolean
  showGizmo: boolean
  wireframe: boolean
  
  camera?: {
    position: Vector3
    target: Vector3
  }
}

// ============================================================================
// API TYPES
// ============================================================================

export interface FuelSearchResult {
  id: string
  name: string
  author: string
  description: string
  thumbnail?: string
  downloads: number
  likes: number
  modelUrl: string
  sdfUrl: string
  thumbnailUrl?: string
  tags: string[]
}

export interface FuelSearchResponse {
  results: FuelSearchResult[]
  totalCount: number
  pageSize: number
  page: number
}
