/**
 * SDF Serializer
 * Converts Scene Graph → XML → .world/.sdf
 */

import { create } from "xmlbuilder2"
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

export class SDFSerializer {
  /**
   * Serialize World to SDF XML string
   */
  static serializeWorld(world: World, format: "world" | "sdf" = "world"): string {
    const doc = create({ version: "1.0", encoding: "UTF-8" })

    const sdfElement = doc
      .ele("sdf", {
        version: world.sdfVersion || "1.9",
      })

    if (format === "world") {
      this.buildWorldElement(sdfElement, world)
    } else {
      this.buildModelElement(sdfElement, world.models[0])
    }

    return doc.end({ prettyPrint: true })
  }

  private static buildWorldElement(root: any, world: World): void {
    const worldEle = root.ele("world", {
      name: world.name,
    })

    // Physics
    this.buildPhysicsElement(worldEle, world.physics)

    // Scene
    this.buildSceneElement(worldEle, world.scene)

    // Models
    world.models.forEach((model) => {
      this.buildModelElement(worldEle, model)
    })

    // Lights
    world.lights.forEach((light) => {
      this.buildLightElement(worldEle, light)
    })

    // Includes
    world.includes.forEach((include) => {
      this.buildIncludeElement(worldEle, include)
    })
  }

  private static buildPhysicsElement(parent: any, physics: PhysicsConfig): void {
    const physicsEle = parent.ele("physics", {
      name: "default_physics",
      default: "true",
      type: physics.engine,
    })

    physicsEle
      .ele("gravity")
      .txt(physics.gravity.join(" "))
      .up()

    physicsEle
      .ele("max_step_size")
      .txt(physics.maxStepSize.toString())
      .up()

    physicsEle
      .ele("real_time_update_rate")
      .txt(physics.realTimeUpdateRate.toString())
      .up()
  }

  private static buildSceneElement(parent: any, scene: SceneConfig): void {
    const sceneEle = parent.ele("scene")

    if (scene.ambient) {
      sceneEle
        .ele("ambient")
        .txt(scene.ambient.join(" "))
        .up()
    }

    if (scene.background) {
      sceneEle
        .ele("background")
        .txt(scene.background.join(" "))
    }
  }

  private static buildModelElement(parent: any, model: ModelEntity): void {
    const modelEle = parent.ele("model", {
      name: model.name,
    })

    // Pose
    this.buildPoseElement(modelEle, model.pose)

    // Static
    if (model.isStatic) {
      modelEle.ele("static").txt("true")
    }

    // Links
    model.links.forEach((link) => {
      this.buildLinkElement(modelEle, link)
    })

    // Joints
    model.joints.forEach((joint) => {
      this.buildJointElement(modelEle, joint)
    })

    // Plugins
    model.plugins.forEach((plugin) => {
      const pluginEle = modelEle.ele("plugin", {
        filename: plugin.filename,
        name: plugin.name,
      })

      if (plugin.params) {
        Object.entries(plugin.params).forEach(([key, value]) => {
          pluginEle.ele(key).txt(String(value))
        })
      }
    })
  }

  private static buildLinkElement(parent: any, link: LinkEntity): void {
    const linkEle = parent.ele("link", {
      name: link.name,
    })

    // Pose
    this.buildPoseElement(linkEle, link.pose)

    // Visuals
    link.visuals.forEach((visual) => {
      this.buildVisualElement(linkEle, visual)
    })

    // Collisions
    link.collisions.forEach((collision) => {
      this.buildCollisionElement(linkEle, collision)
    })

    // Inertial (if present)
    if (link.inertial) {
      const inertialEle = linkEle.ele("inertial")

      inertialEle
        .ele("mass")
        .txt(link.inertial.mass.toString())
        .up()

      if (link.inertial.inertia) {
        const inertiaEle = inertialEle.ele("inertia")
        inertiaEle.ele("ixx").txt(link.inertial.inertia.ixx.toString())
        inertiaEle.ele("iyy").txt(link.inertial.inertia.iyy.toString())
        inertiaEle.ele("izz").txt(link.inertial.inertia.izz.toString())
        if (link.inertial.inertia.ixy)
          inertiaEle.ele("ixy").txt(link.inertial.inertia.ixy.toString())
        if (link.inertial.inertia.ixz)
          inertiaEle.ele("ixz").txt(link.inertial.inertia.ixz.toString())
        if (link.inertial.inertia.iyz)
          inertiaEle.ele("iyz").txt(link.inertial.inertia.iyz.toString())
      }

      if (link.inertial.pose) {
        this.buildPoseElement(inertialEle, link.inertial.pose)
      }
    }
  }

  private static buildVisualElement(parent: any, visual: VisualEntity): void {
    const visualEle = parent.ele("visual", {
      name: visual.name,
    })

    this.buildPoseElement(visualEle, visual.pose)
    this.buildGeometryElement(visualEle, visual.geometry)

    if (visual.material) {
      this.buildMaterialElement(visualEle, visual.material)
    }
  }

  private static buildCollisionElement(
    parent: any,
    collision: CollisionEntity
  ): void {
    const collisionEle = parent.ele("collision", {
      name: collision.name,
    })

    this.buildPoseElement(collisionEle, collision.pose)
    this.buildGeometryElement(collisionEle, collision.geometry)

    if (collision.surface) {
      const surfaceEle = collisionEle.ele("surface")
      if (collision.surface.friction) {
        surfaceEle
          .ele("friction")
          .ele("ode")
          .ele("mu")
          .txt(collision.surface.friction.toString())
      }
      if (collision.surface.bounce) {
        surfaceEle
          .ele("bounce")
          .ele("restitution_coefficient")
          .txt(collision.surface.bounce.toString())
      }
    }
  }

  private static buildGeometryElement(parent: any, geometry: GeometryType): void {
    const geometryEle = parent.ele("geometry")

    switch (geometry.type) {
      case "box":
        geometryEle
          .ele("box")
          .ele("size")
          .txt(geometry.size.join(" "))
        break
      case "sphere":
        geometryEle
          .ele("sphere")
          .ele("radius")
          .txt(geometry.radius.toString())
        break
      case "cylinder":
        const cylinderEle = geometryEle.ele("cylinder")
        cylinderEle.ele("radius").txt(geometry.radius.toString())
        cylinderEle.ele("length").txt(geometry.length.toString())
        break
      case "plane":
        const planeEle = geometryEle.ele("plane")
        planeEle.ele("normal").txt(geometry.normal.join(" "))
        planeEle.ele("size").txt(geometry.size.join(" "))
        break
      case "mesh":
        const meshEle = geometryEle.ele("mesh")
        meshEle.ele("uri").txt(geometry.uri)
        meshEle.ele("scale").txt(geometry.scale.join(" "))
        break
      case "capsule":
        const capsuleEle = geometryEle.ele("capsule")
        capsuleEle.ele("radius").txt(geometry.radius.toString())
        capsuleEle.ele("length").txt(geometry.length.toString())
        break
    }
  }

  private static buildMaterialElement(parent: any, material: MaterialConfig): void {
    const materialEle = parent.ele("material", {
      name: material.name || "material",
    })

    if (material.ambient) {
      materialEle
        .ele("ambient")
        .txt(material.ambient.join(" "))
        .up()
    }

    if (material.diffuse) {
      materialEle
        .ele("diffuse")
        .txt(material.diffuse.join(" "))
        .up()
    }

    if (material.specular) {
      materialEle
        .ele("specular")
        .txt(material.specular.join(" "))
        .up()
    }

    if (material.shininess) {
      materialEle
        .ele("shininess")
        .txt(material.shininess.toString())
    }
  }

  private static buildJointElement(parent: any, joint: Joint): void {
    const jointEle = parent.ele("joint", {
      name: joint.name,
      type: joint.jointType,
    })

    this.buildPoseElement(jointEle, joint.pose)

    jointEle
      .ele("parent")
      .txt(joint.parentLink)
      .up()

    jointEle
      .ele("child")
      .txt(joint.childLink)
      .up()

    if (joint.axis) {
      const axisEle = jointEle.ele("axis")
      axisEle
        .ele("xyz")
        .txt(joint.axis.xyz.join(" "))
        .up()

      if (joint.axis.lower !== undefined) {
        axisEle
          .ele("limit")
          .ele("lower")
          .txt(joint.axis.lower.toString())
          .up()
          .ele("upper")
          .txt((joint.axis.upper ?? 0).toString())
          .up()
          .ele("effort")
          .txt((joint.axis.effort ?? 1).toString())
          .up()
          .ele("velocity")
          .txt((joint.axis.velocity ?? 1).toString())
      }

      if (joint.axis.friction !== undefined) {
        axisEle
          .ele("friction")
          .txt(joint.axis.friction.toString())
      }

      if (joint.axis.damping !== undefined) {
        axisEle
          .ele("damping")
          .txt(joint.axis.damping.toString())
      }
    }
  }

  private static buildLightElement(parent: any, light: LightEntity): void {
    const lightEle = parent.ele("light", {
      name: light.name,
      type: light.type === "directional_light" ? "directional" : light.type === "point_light" ? "point" : "spot",
    })

    this.buildPoseElement(lightEle, light.pose)

    lightEle
      .ele("diffuse")
      .txt(light.diffuse.join(" "))
      .up()

    lightEle
      .ele("specular")
      .txt(light.specular.join(" "))
      .up()

    if (light.type === "directional_light") {
      lightEle
        .ele("direction")
        .txt(light.direction.join(" "))
        .up()

      if (light.castShadows) {
        lightEle.ele("cast_shadows").txt("true")
      }
    } else if (light.type === "point_light") {
      const attEle = lightEle.ele("attenuation")
      attEle
        .ele("constant")
        .txt(light.attenuation.constant.toString())
        .up()
        .ele("linear")
        .txt(light.attenuation.linear.toString())
        .up()
        .ele("quadratic")
        .txt(light.attenuation.quadratic.toString())

      lightEle.ele("range").txt(light.range.toString())
    } else if (light.type === "spot_light") {
      lightEle
        .ele("direction")
        .txt(light.direction.join(" "))
        .up()

      lightEle.ele("inner_angle").txt(light.innerAngle.toString()).up()
      lightEle.ele("outer_angle").txt(light.outerAngle.toString())
    }
  }

  private static buildIncludeElement(parent: any, include: IncludeEntity): void {
    const includeEle = parent.ele("include", {
      name: include.name,
    })

    if (include.pose) {
      this.buildPoseElement(includeEle, include.pose)
    }

    includeEle.ele("uri").txt(include.uri)
  }

  private static buildPoseElement(parent: any, pose: Pose): void {
    parent
      .ele("pose")
      .txt([...pose.position, ...pose.rotation].join(" "))
      .up()
  }
}

export function exportWorld(
  world: World,
  format: "world" | "sdf" = "world"
): string {
  return SDFSerializer.serializeWorld(world, format)
}

export function downloadWorld(
  world: World,
  filename: string,
  format: "world" | "sdf" = "world"
): void {
  const xml = exportWorld(world, format)
  const blob = new Blob([xml], { type: "text/xml" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
