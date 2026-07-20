/**
 * Mesh Loader System
 * Supports: DAE, STL, OBJ, GLTF, GLB
 */

import {
  ColladaLoader,
  STLLoader,
  OBJLoader,
  GLTFLoader,
} from "three-stdlib"
import { Group, Mesh, MeshStandardMaterial, Object3D } from "three"

export class MeshLoader {
  private colladaLoader: ColladaLoader
  private stlLoader: STLLoader
  private objLoader: OBJLoader
  private gltfLoader: GLTFLoader

  constructor() {
    this.colladaLoader = new ColladaLoader()
    this.stlLoader = new STLLoader()
    this.objLoader = new OBJLoader()
    this.gltfLoader = new GLTFLoader()
  }

  /**
   * Load mesh from URI
   * Auto-detects format based on file extension
   */
  async loadMesh(uri: string): Promise<Object3D> {
    const extension = uri.split(".").pop()?.toLowerCase()

    try {
      switch (extension) {
        case "dae":
          return await this.loadCollada(uri)
        case "stl":
          return await this.loadSTL(uri)
        case "obj":
          return await this.loadOBJ(uri)
        case "gltf":
        case "glb":
          return await this.loadGLTF(uri)
        default:
          throw new Error(`Unsupported format: ${extension}`)
      }
    } catch (error) {
      console.error(`Error loading mesh ${uri}:`, error)
      throw error
    }
  }

  private async loadCollada(uri: string): Promise<Object3D> {
    return new Promise((resolve, reject) => {
      this.colladaLoader.load(
        uri,
        (dae) => {
          resolve(dae.scene)
        },
        undefined,
        reject
      )
    })
  }

  private async loadSTL(uri: string): Promise<Object3D> {
    return new Promise((resolve, reject) => {
      this.stlLoader.load(
        uri,
        (geometry) => {
          const group = new Group()
          group.add(new Mesh(geometry, new MeshStandardMaterial({ color: 0x999999 })))
          resolve(group)
        },
        undefined,
        reject
      )
    })
  }

  private async loadOBJ(uri: string): Promise<Object3D> {
    return new Promise((resolve, reject) => {
      this.objLoader.load(
        uri,
        (object) => {
          resolve(object)
        },
        undefined,
        reject
      )
    })
  }

  private async loadGLTF(uri: string): Promise<Object3D> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        uri,
        (gltf) => {
          resolve(gltf.scene)
        },
        undefined,
        reject
      )
    })
  }

  /**
   * Load from File object (for drag-drop)
   */
  async loadFromFile(file: File): Promise<Object3D> {
    const arrayBuffer = await file.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: file.type })
    const url = URL.createObjectURL(blob)

    try {
      const mesh = await this.loadMesh(url)
      URL.revokeObjectURL(url)
      return mesh
    } catch (error) {
      URL.revokeObjectURL(url)
      throw error
    }
  }

  /**
   * Load from ArrayBuffer (for ZIP extraction)
   */
  async loadFromBuffer(
    buffer: ArrayBuffer,
    filename: string
  ): Promise<Object3D> {
    const blob = new Blob([buffer])
    const url = URL.createObjectURL(blob)

    try {
      const mesh = await this.loadMesh(url)
      URL.revokeObjectURL(url)
      return mesh
    } catch (error) {
      URL.revokeObjectURL(url)
      throw error
    }
  }
}

export const meshLoader = new MeshLoader()
