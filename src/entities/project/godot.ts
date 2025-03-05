import type { DirEntry } from '@tauri-apps/plugin-fs'

export function isGodotProject(files: Array<DirEntry>): boolean {
	return files.some((file) => file.name === 'project.godot')
}
