import { Err, Ok, isErr, to, toUnwrapOr } from '@vyke/results/result'
import { type Metadata, metadata } from 'tauri-plugin-fs-extra-api'
import { type FileEntry, readDir, readTextFile } from '@tauri-apps/api/fs'
import { homeDir, join } from '@tauri-apps/api/path'
import { git } from '../git/gitCommands'

export async function getFilesIn(path: string) {
	const entriesResult = await to(readDir(path))

	if (isErr(entriesResult)) {
		return Err(entriesResult.error, 'Failed to read directory')
	}

	const { value: entries } = entriesResult

	return Ok(entries)
}

export async function pathInRoot(path: string) {
	const homeDirResult = await to(homeDir())

	if (isErr(homeDirResult)) {
		return Err(homeDirResult.error, 'Failed to get home directory')
	}

	const resultJoin = await to(join(homeDirResult.value, path))

	if (isErr(resultJoin)) {
		return Err(resultJoin.error, 'Failed to join path')
	}

	return Ok(resultJoin.value)
}

export async function getFileMetadata(path: string) {
	const metadataResult = await to(metadata(path))

	if (isErr(metadataResult)) {
		return Err(metadataResult.error, 'Failed to get metadata')
	}

	return Ok(metadataResult.value)
}

export async function getTextFileContent(path: string) {
	const textResult = await to(readTextFile(path))

	if (isErr(textResult)) {
		return Err(textResult.error, 'Failed to read text file')
	}

	return Ok(textResult.value)
}

type FindMostRecentModifiedFilesArgs = {
	projectPath: string
	path: string
	amount?: number
	ignore?: Array<string>

}

export async function findMostRecentModifiedFiles(args: FindMostRecentModifiedFilesArgs) {
	const { projectPath, path, amount = 5, ignore = [] } = args
	const entriesResult = await getFilesIn(path)

	if (isErr(entriesResult)) {
		return Err(entriesResult.error, 'Failed to get files')
	}

	const { value: entries } = entriesResult
	const entriesWithMetadata: Array<FileEntry & Metadata> = []

	function add(entry: FileEntry & Metadata) {
		// Add entry to entriesWithMetadata only if it's more recent than the oldest entry
		if (entriesWithMetadata.length < amount) {
			entriesWithMetadata.push(entry)
		}
		else {
			const oldest = entriesWithMetadata[0]

			if (entry.modifiedAt > oldest.modifiedAt) {
				entriesWithMetadata[0] = entry
			}
		}

		entriesWithMetadata.sort((a, b) => a.modifiedAt.getTime() - b.modifiedAt.getTime())
	}

	for (const entry of entries) {
		const skipped = entry.path.endsWith('.git') || ignore.some((item) => {
			return entry.path.endsWith(item)
		}) || await toUnwrapOr(git.isPathIgnore(projectPath, entry.path), true)

		if (skipped) {
			continue
		}

		const metadataResult = await getFileMetadata(entry.path)

		if (isErr(metadataResult)) {
			continue
		}

		const { value: meta } = metadataResult

		if (meta.isDir) {
			const nestedList = await toUnwrapOr(findMostRecentModifiedFiles({
				...args,
				path: entry.path,
			}), [])
			nestedList.forEach(add)
		}
		else {
			add({
				...entry,
				...meta,
			})
		}
	}

	return Ok(entriesWithMetadata)
}
