import type { Maybe } from '../error'
import { Command } from '@tauri-apps/plugin-shell'
import { maybe } from '../error'

export async function openInCursor(path: string): Promise<Maybe<string>> {
	const openInCursor = Command.create('open-in-cursor', [path])

	const result = await openInCursor.execute()

	return maybe(result.stdout)
}
