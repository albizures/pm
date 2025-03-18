import type { DirEntry } from '@tauri-apps/plugin-fs'
import type { ReadSignal } from '@vyke/taggy/signals'
import type { Maybe } from '../error'
import { homeDir, join as unsafeJoin } from '@tauri-apps/api/path'
import {
	exists as unsafeExists,
	readDir as unsafeReadDir,
	readTextFile as unsafeReadTextFile,
	remove as unsafeRemove,
	stat as unsafeStat,
} from '@tauri-apps/plugin-fs'
import { Command } from '@tauri-apps/plugin-shell'
import { computed } from '@vyke/taggy/signals'
import { maybe, throwable, to, unwrap } from '../error'
import { rootSola } from '../logger'

const sola = rootSola.withTag('files')

export const join = throwable(unsafeJoin)
const readTextFile = throwable(unsafeReadTextFile)
const stat = throwable(unsafeStat)
export const exists = throwable(unsafeExists)
const remove = throwable(unsafeRemove)
export async function getFilesIn(path: string): Promise<Maybe<Array<DirEntry>>> {
	const files = await unsafeReadDir(path)

	const betterFiles = await Promise.all(files.map(async (file) => {
		const filePath = await to(join(path, file.name))

		if (!filePath.ok) {
			return undefined
		}

		return {
			...file,
			name: filePath.value,
		}
	}))

	return maybe(betterFiles.filter((file) => file !== undefined))
}

export async function pathInRoot(path: string): Promise<Maybe<string>> {
	const dir = await homeDir()

	return join(dir, path)
}

export async function getTextFileContent(path: string): Promise<Maybe<string>> {
	return readTextFile(path)
}

type FileMetadata = {
	isFile: boolean
	isDirectory: boolean
	modifiedAt: Date | undefined
	createdAt: Date | undefined
	size: number
}

export async function getFileMetadata(path: string): Promise<Maybe<FileMetadata>> {
	const metadata = await unwrap(stat(path))

	return maybe({
		isFile: metadata.isFile,
		isDirectory: metadata.isDirectory,
		modifiedAt: metadata.mtime ? new Date(metadata.mtime) : undefined,
		createdAt: metadata.birthtime ? new Date(metadata.birthtime) : undefined,
		size: metadata.size,
	})
}

type FindMostRecentModifiedFilesArgs = {
	projectPath: string
	path: string
	amount?: number
	ignore?: Array<string>

}

export async function findMostRecentModifiedFiles(
	args: FindMostRecentModifiedFilesArgs,
): Promise<Maybe<Array<DirEntry>>> {
	const files = await unwrap(getFilesIn(args.path))

	return maybe(files)
}

export async function getDiskUsage(path: string): Promise<Maybe<number>> {
	const command = Command.create('dist-usage', ['-d', '0', path])

	const result = await command.execute()

	const [size] = result.stdout.split('\t')

	return maybe(Number(size.trim()) * 1024)
}

export async function getSizeOfFiles(paths: Array<string>): Promise<Maybe<number>> {
	let totalSize = 0

	for (const path of paths) {
		const size = await to(getDiskUsage(path))

		if (!size.ok) {
			sola.error('Error getting metadata for file, skipping', { path, error: size.error })
			continue
		}

		totalSize += size.value
	}

	return maybe(totalSize)
}

/**
 * Prettifies a size in bytes to a string
 * @param size - The size in bytes
 * @returns The prettified size
 */
export function prettySize(size: number): string {
	if (size < 1024) {
		return `${size} B`
	}

	const inKb = size / 1024

	if (inKb < 1024) {
		return `${inKb.toFixed(2)} KB`
	}

	const inMb = inKb / 1024

	if (inMb < 1024) {
		return `${inMb.toFixed(2)} MB`
	}

	const inGb = inMb / 1024

	return `${inGb.toFixed(2)} GB`
}

export function $prettySize(size: ReadSignal<number>): ReadSignal<string> {
	return computed(() => prettySize(size()))
}

export async function deleteFolder(path: string): Promise<Maybe<boolean>> {
	const fileExists = await to(exists(path))

	if (!fileExists.ok || !fileExists.value) {
		return maybe(false)
	}

	const result = await to(remove(path, { recursive: true }))

	if (!result.ok) {
		sola.error('Error deleting file', { path, error: result.error })

		return maybe(false)
	}

	return maybe(true)
}
