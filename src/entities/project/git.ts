import type { DirEntry } from '@tauri-apps/plugin-fs'
import type { Maybe } from '../../error'
import { maybe } from '../../error'

export function isGitProject(files: Array<DirEntry>): boolean {
	const gitFile = files.find((file) => file.name.endsWith('.git'))

	return Boolean(gitFile)
}

export async function getGitProjectName(path: string): Promise<Maybe<string | undefined>> {
	return maybe(path.split('/').pop())
}
