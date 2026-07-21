/**
 * SDF XML Parser
 * Converts XML → JSON → Scene Graph
 */

import { XMLParser, XMLValidator } from "fast-xml-parser"
import {
  World,
  ModelEntity,
  LinkEntity,
  VisualEntity,
  CollisionEntity,
  Joint,
  LightEntity,
  IncludeEntity,
  Pose,
  GeometryType,
  MaterialConfig,
  PhysicsConfig,
  SceneConfig,
} from "@/types/sdf"
import { v4 as uuidv4 } from "uuid"

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: true,
  parseAttributeValue: true,
})

export class SDFParser {
  /**
   * Parse SDF XML string into World object
   */
  static parseWorld(xmlContent: string): World {
    const validation = XMLValidator.validate(xmlContent)
    if (validation !== true) {
      throw new Error(`Invalid XML: ${validation}`)
    }

    const json = parser.parse(xmlContent)
    const sdfRoot = json.sdf || json.world

    if (!sdfRoot) {
      throw new Error("No valid SDF root found in XML")
    }

    const worldData = sdfRoot.world || sdfRoot
    return this.buildWorld(worldData)
  }

  /**
   * Parse a standalone `<sdf><model>...</model></sdf>` document — the format
   * used by model repositories (e.g. gazebo_models, PX4-gazebo-models),
   * as opposed to a full `.world` file.
   *
   * Composite models built from nested `<include>` elements (common for
   * multi-part vehicles) have no visuals of their own; their direct-child
   * include URIs are returned separately so the caller can resolve and
   * merge them.
   */
  static parseStandaloneModel(xmlContent: string): { model: ModelEntity; nestedIncludeUris: string[] } {
    const validation = XMLValidator.validate(xmlContent)
    if (validation !== true) {
      throw new Error(`Invalid XML: ${validation}`)
    }

    const json = parser.parse(xmlContent)
    const modelData = json.sdf?.model || json.model

    if (!modelData) {
      throw new Error("No <model> root found in XML")
    }

    const model = this.parseModel(modelData)

    const includeList = Array.isArray(modelData.include)
      ? modelData.include
      : modelData.include
        ? [modelData.include]
        : []
    const nestedIncludeUris = includeList.map((inc: any) => String(inc.uri || "")).filter(Boolean)

    return { model, nestedIncludeUris }
  }

  /** Merge a resolved nested model's links/joints/plugins into a parent composite model. */
  static mergeModel(parent: ModelEntity, child: ModelEntity): ModelEntity {
    return {
      ...parent,
      links: [...parent.links, ...child.links],
      joints: [...parent.joints, ...child.joints],
      plugins: [...parent.plugins, ...child.plugins],
    }
  }

  private static buildWorld(worldData: any): World {
    const id = uuidv4()
    const name = worldData["@_name"] || "Unnamed World"
    const sdfVersion = worldData["@_version"] || "1.9"

    const physics = this.parsePhysics(worldData.physics)
    const scene = this.parseScene(worldData.scene)

    const models: ModelEntity[] = this.parseModels(worldData.model || [])
    const lights: LightEntity[] = this.parseLights(worldData.light || [])
    const includes: IncludeEntity[] = this.parseIncludes(worldData.include || [])

    return {
      id,
      name,
      sdfVersion,
      physics,
      scene,
      models,
      lights,
      includes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }

  private static parsePhysics(physicsData: any): PhysicsConfig {
    if (!physicsData) {
      return {
        engine: "ode",
        gravity: [0, 0, -9.81],
        maxStepSize: 0.001,
        realTimeUpdateRate: 1000,
        defaultPhysics: { type: "ode" },
      }
    }

    const engine = this.parseEngine(physicsData["@_type"])
    const gravity = this.parseVector3(
      physicsData.gravity || "0 0 -9.81"
    )

    return {
      engine,
      gravity,
      maxStepSize: parseFloat(physicsData.max_step_size) || 0.001,
      realTimeUpdateRate:
        parseFloat(physicsData.real_time_update_rate) || 1000,
      defaultPhysics: { type: engine },
    }
  }

  private static parseScene(sceneData: any): SceneConfig {
    if (!sceneData) {
      return {
        ambient: [0.5, 0.5, 0.5, 1],
        background: [0.5, 0.5, 0.5, 1],
        shadows: true,
        grid: true,
      }
    }

    return {
      ambient: this.parseColor(sceneData.ambient) || [0.5, 0.5, 0.5, 1],
      background: this.parseColor(sceneData.background) || [0.5, 0.5, 0.5, 1],
      shadows: true,
      grid: true,
    }
  }

  private static parseModels(modelDataList: any[]): ModelEntity[] {
    const models = Array.isArray(modelDataList) ? modelDataList : [modelDataList]
    return models
      .filter((m) => m)
      .map((m) => this.parseModel(m))
  }

  private static parseModel(modelData: any): ModelEntity {
    const id = uuidv4()
    const name = modelData["@_name"] || "Unnamed Model"
    const pose = this.parsePose(modelData.pose)
    const isStatic = this.parseBool(modelData.static, false)

    const links: LinkEntity[] = this.parseLinks(modelData.link || [])
    const joints: Joint[] = this.parseJoints(modelData.joint || [], links)
    const plugins: any[] = Array.isArray(modelData.plugin)
      ? modelData.plugin
      : modelData.plugin
        ? [modelData.plugin]
        : []

    return {
      id,
      name,
      type: "model",
      pose,
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      locked: false,
      isStatic,
      links,
      joints,
      plugins,
    }
  }

  private static parseLinks(linkDataList: any[]): LinkEntity[] {
    const links = Array.isArray(linkDataList) ? linkDataList : [linkDataList]
    return links.filter((l) => l).map((l) => this.parseLink(l))
  }

  private static parseLink(linkData: any): LinkEntity {
    const id = uuidv4()
    const name = linkData["@_name"] || "link"
    const pose = this.parsePose(linkData.pose)

    const visuals: VisualEntity[] = this.parseVisuals(
      linkData.visual || []
    )
    const collisions: CollisionEntity[] = this.parseCollisions(
      linkData.collision || []
    )
    const sensors: any[] = []

    return {
      id,
      name,
      type: "link",
      pose,
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      locked: false,
      visuals,
      collisions,
      sensors,
    }
  }

  private static parseVisuals(visualDataList: any[]): VisualEntity[] {
    const visuals = Array.isArray(visualDataList)
      ? visualDataList
      : visualDataList
        ? [visualDataList]
        : []

    return visuals
      .filter((v) => v)
      .map((v) => this.parseVisual(v))
  }

  private static parseVisual(visualData: any): VisualEntity {
    const id = uuidv4()
    const name = visualData["@_name"] || "visual"
    const pose = this.parsePose(visualData.pose)
    const geometry = this.parseGeometry(visualData.geometry)
    const material = this.parseMaterial(visualData.material)

    return {
      id,
      name,
      type: "visual",
      pose,
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      locked: false,
      geometry,
      material,
      castShadow: true,
      receiveShadow: true,
    }
  }

  private static parseCollisions(collisionDataList: any[]): CollisionEntity[] {
    const collisions = Array.isArray(collisionDataList)
      ? collisionDataList
      : collisionDataList
        ? [collisionDataList]
        : []

    return collisions
      .filter((c) => c)
      .map((c) => this.parseCollision(c))
  }

  private static parseCollision(collisionData: any): CollisionEntity {
    const id = uuidv4()
    const name = collisionData["@_name"] || "collision"
    const pose = this.parsePose(collisionData.pose)
    const geometry = this.parseGeometry(collisionData.geometry)

    return {
      id,
      name,
      type: "collision",
      pose,
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      locked: false,
      geometry,
    }
  }

  private static parseGeometry(geometryData: any): GeometryType {
    if (!geometryData) {
      return { type: "box", size: [1, 1, 1] }
    }

    if (geometryData.box) {
      const size = this.parseVector3(geometryData.box.size || "1 1 1")
      return { type: "box", size }
    }

    if (geometryData.sphere) {
      const radius = parseFloat(geometryData.sphere.radius) || 1
      return { type: "sphere", radius }
    }

    if (geometryData.cylinder) {
      const radius = parseFloat(geometryData.cylinder.radius) || 1
      const length = parseFloat(geometryData.cylinder.length) || 1
      return { type: "cylinder", radius, length }
    }

    if (geometryData.plane) {
      const normal = this.parseVector3(geometryData.plane.normal || "0 0 1")
      const size = this.parseVector3(geometryData.plane.size || "1 1 0")
      return { type: "plane", normal, size }
    }

    if (geometryData.mesh) {
      const uri = geometryData.mesh.uri || "model://box/meshes/box.dae"
      const scale = this.parseVector3(
        geometryData.mesh.scale || "1 1 1"
      )
      return { type: "mesh", uri, scale }
    }

    if (geometryData.capsule) {
      const radius = parseFloat(geometryData.capsule.radius) || 1
      const length = parseFloat(geometryData.capsule.length) || 1
      return { type: "capsule", radius, length }
    }

    return { type: "box", size: [1, 1, 1] }
  }

  private static parseMaterial(materialData: any): MaterialConfig | undefined {
    if (!materialData) return undefined

    return {
      name: materialData["@_name"],
      ambient: this.parseColor(materialData.ambient),
      diffuse: this.parseColor(materialData.diffuse),
      specular: this.parseColor(materialData.specular),
      shininess: parseFloat(materialData.shininess) || 1,
      script: materialData.script?.uri,
    }
  }

  private static parseJoints(jointDataList: any[], links: LinkEntity[]): Joint[] {
    const joints = Array.isArray(jointDataList)
      ? jointDataList
      : jointDataList
        ? [jointDataList]
        : []

    return joints.filter((j) => j).map((j) => this.parseJoint(j))
  }

  private static parseJoint(jointData: any): Joint {
    const id = uuidv4()
    const name = jointData["@_name"] || "joint"
    const pose = this.parsePose(jointData.pose)

    const parentLink = jointData.parent || ""
    const childLink = jointData.child || ""
    const jointType = jointData["@_type"] || "fixed"

    return {
      id,
      name,
      type: "joint",
      pose,
      scale: { x: 1, y: 1, z: 1 },
      visible: false,
      locked: false,
      parentLink,
      childLink,
      jointType: jointType as any,
    }
  }

  private static parseLights(lightDataList: any[]): LightEntity[] {
    const lights = Array.isArray(lightDataList)
      ? lightDataList
      : lightDataList
        ? [lightDataList]
        : []

    return lights.filter((l) => l).map((l) => this.parseLight(l))
  }

  private static parseLight(lightData: any): LightEntity {
    const id = uuidv4()
    const name = lightData["@_name"] || "light"
    const pose = this.parsePose(lightData.pose)
    const lightType = lightData["@_type"] || "directional"

    const diffuse = this.parseColor(lightData.diffuse) || [1, 1, 1, 1]
    const specular = this.parseColor(lightData.specular) || [1, 1, 1, 1]
    const direction = this.parseVector3(lightData.direction || "0 0 -1")
    const castShadows = this.parseBool(lightData.cast_shadows, lightType !== "point")

    const attData = lightData.attenuation || {}
    const attenuation = {
      constant: parseFloat(attData.constant) || 1,
      linear: parseFloat(attData.linear) ?? 0.01,
      quadratic: parseFloat(attData.quadratic) ?? 0.001,
    }
    const range = parseFloat(lightData.range) || 50

    if (lightType === "directional") {
      return {
        id,
        name,
        type: "directional_light",
        pose,
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        locked: false,
        diffuse,
        specular,
        direction,
        castShadows,
      }
    }

    if (lightType === "point") {
      return {
        id,
        name,
        type: "point_light",
        pose,
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        locked: false,
        diffuse,
        specular,
        attenuation,
        range,
        castShadows,
      }
    }

    return {
      id,
      name,
      type: "spot_light",
      pose,
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      locked: false,
      diffuse,
      specular,
      direction,
      innerAngle: parseFloat(lightData.inner_angle) || 0.1,
      outerAngle: parseFloat(lightData.outer_angle) || 0.5,
      attenuation,
      range,
      castShadows,
    }
  }

  private static parseEngine(value: any): PhysicsConfig["engine"] {
    const known: PhysicsConfig["engine"][] = ["ode", "bullet", "dart", "simbody"]
    const str = String(value || "ode").toLowerCase()
    return (known as string[]).includes(str) ? (str as PhysicsConfig["engine"]) : "ode"
  }

  private static parseBool(value: any, defaultValue: boolean): boolean {
    if (value === undefined || value === null || value === "") return defaultValue
    if (typeof value === "boolean") return value
    return String(value).toLowerCase() === "true" || value === 1
  }

  private static parseIncludes(includeDataList: any[]): IncludeEntity[] {
    const includes = Array.isArray(includeDataList)
      ? includeDataList
      : includeDataList
        ? [includeDataList]
        : []

    return includes.filter((i) => i).map((i) => this.parseInclude(i))
  }

  private static parseInclude(includeData: any): IncludeEntity {
    const id = uuidv4()
    const uri = includeData.uri || ""
    const name = uri.split("/").pop() || "include"
    const pose = this.parsePose(includeData.pose)

    return {
      id,
      name,
      type: "include",
      pose,
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      locked: false,
      uri,
    }
  }

  private static parsePose(poseData: any): Pose {
    if (!poseData) {
      return {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      }
    }

    const parts = poseData.split ? poseData.split(" ") : poseData
    if (!Array.isArray(parts)) {
      return {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      }
    }

    return {
      position: [
        parseFloat(parts[0]) || 0,
        parseFloat(parts[1]) || 0,
        parseFloat(parts[2]) || 0,
      ],
      rotation: [
        parseFloat(parts[3]) || 0,
        parseFloat(parts[4]) || 0,
        parseFloat(parts[5]) || 0,
      ],
    }
  }

  private static parseVector3(vectorData: any): [number, number, number] {
    if (!vectorData) return [0, 0, 0]

    const parts = vectorData.split ? vectorData.split(" ") : vectorData
    if (!Array.isArray(parts) || parts.length < 3) {
      return [0, 0, 0]
    }

    return [
      parseFloat(parts[0]) || 0,
      parseFloat(parts[1]) || 0,
      parseFloat(parts[2]) || 0,
    ]
  }

  private static parseColor(colorData: any): [number, number, number, number] | undefined {
    if (!colorData) return undefined

    const parts = colorData.split ? colorData.split(" ") : colorData
    if (!Array.isArray(parts)) return undefined

    return [
      Math.min(parseFloat(parts[0]) || 0, 1),
      Math.min(parseFloat(parts[1]) || 0, 1),
      Math.min(parseFloat(parts[2]) || 0, 1),
      Math.min(parseFloat(parts[3]) || 1, 1),
    ]
  }
}
