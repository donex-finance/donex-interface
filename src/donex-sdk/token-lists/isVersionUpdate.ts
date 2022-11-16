import { Version } from './types'
import { versionComparator } from './versionComparator'

/**
 * Returns true if versionB is an update over versionA
 */
export function isVersionUpdate(base: Version, update: Version): boolean {
  return versionComparator(base, update) < 0
}
