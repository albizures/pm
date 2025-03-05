import type { DirEntry } from '@tauri-apps/plugin-fs'
import type { Maybe } from '../../error'
import { maybe } from '../../error'

export function isRustProject(files: Array<DirEntry>): boolean {
	const cargoFile = files.find((file) => file.name.includes('Cargo.toml'))

	return Boolean(cargoFile)
}

export async function getRustProjectName(path: string): Promise<Maybe<string | undefined>> {
	return maybe(path.split('/').pop())
}
