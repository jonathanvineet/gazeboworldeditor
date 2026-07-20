/**
 * SDF is Z-up, right-handed. Three.js is Y-up, right-handed.
 * Wrapping the whole scene in a group rotated -90deg about X converts
 * the basis once; everything nested inside can then use raw SDF
 * (x, y, z) positions and (roll, pitch, yaw) 'XYZ'-order Euler rotations
 * directly, and reading a nested object's local transform back out
 * yields a valid SDF pose with no further conversion needed.
 */
export const SDF_TO_THREE_ROTATION: [number, number, number] = [-Math.PI / 2, 0, 0]
