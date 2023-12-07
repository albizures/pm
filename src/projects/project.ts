import { type FileEntry, exists, readDir, readTextFile } from '@tauri-apps/api/fs'
import { resolve } from '@tauri-apps/api/path'
import { getFileSize } from './file'

export enum ProjectType {
	Unknown = 'Unkown',
	NodeJS = 'nodejs',
}

export type NodeJSProjectInfo = {
	type: ProjectType.NodeJS

	nodeModulesSize: number
}

export type CommonProjectInfo = { size: number; vcsEnabled: boolean }

export type ProjectInfo = CommonProjectInfo & (
	| { type: ProjectType.Unknown }
	| NodeJSProjectInfo)

export async function getProjectInfo(root: string): Promise<ProjectInfo> {
	const files = (await readDir(root))
	const type = getProjectType(files)
	const size = await getFileSize(root)
	const vcsEnabled = await exists(await resolve(root, '.git'))

	const common = {
		size, vcsEnabled,
	}

	if (type === ProjectType.NodeJS) {
		const nodeModulesSize = await getFileSize(await resolve(root, 'node_modules'))
		return {
			...common,
			type,
			nodeModulesSize,
		}
	}

	return {
		...common,
		type: ProjectType.Unknown,
	}
}

function getProjectType(files: Array<FileEntry>) {
	for (const file of files) {
		if (file.name && file.name === 'package.json') {
			return ProjectType.NodeJS
		}
	}
}
