import type { Maybe } from '../error'
import { Command } from '@tauri-apps/plugin-shell'
import { maybe, unwrap } from '../error'
import { rootSola } from '../logger'
import { join } from './files'

const sola = rootSola.withTag('git')

export async function hasChanges(path: string): Promise<Maybe<boolean>> {
	const gitStatus = Command.create('git-status', ['status'], {
		cwd: path,
	})

	const result = await gitStatus.execute()
	sola.debug('hasChanges', { path, result })
	return maybe(!result.stdout.includes('nothing to commit, working tree clean'))
}

export async function getBranch(path: string): Promise<Maybe<string>> {
	const gitBranch = Command.create('git', ['branch', '--show-current'], {
		cwd: path,
	})

	const result = await gitBranch.execute()
	return maybe(result.stdout.trim())
}

export type UncommitedChange = {
	type: ChangeType
	path: string
}

type ChangeType = typeof changeTypes[number]
const changeTypes = ['added', 'deleted', 'modified', 'untracked', 'renamed', 'unknown'] as const

type ShortChangeType = typeof shortChangeTypes[number]
const shortChangeTypes = ['A', 'D', 'M', '??', 'R'] as const

const changeType = {
	'A': 'added',
	'D': 'deleted',
	'M': 'modified',
	'??': 'untracked',
	'R': 'renamed',
} as const satisfies Record<ShortChangeType, UncommitedChange['type']>

function isShortChangeType(value: string): value is ShortChangeType {
	return shortChangeTypes.includes(value as ShortChangeType)
}

export async function findUncommitedChanges(path: string): Promise<Maybe<Array<UncommitedChange>>> {
	const gitStatus = Command.create('git-status-porcelain', ['status', '--porcelain'], {
		cwd: path,
	})

	const result = await gitStatus.execute()

	const lines = result.stdout.trim()
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0)

	const changes: Array<UncommitedChange> = []

	for (const line of lines) {
		const [status, filePath] = line.split(' ')
		const change: UncommitedChange = {
			type: isShortChangeType(status) ? changeType[status] : 'unknown',
			path: await unwrap(join(path, filePath)),
		}

		changes.push(change)
	}

	return maybe(changes)
}

export async function getIgnoredFiles(path: string): Promise<Maybe<Array<string>>> {
	const gitIgnoreFiles = Command.create('git-ignore-files', ['status', '--ignored', '-s'], {
		cwd: path,
	})

	const result = await gitIgnoreFiles.execute()

	const files: Array<string> = []
	const lines = result.stdout.trim()
		.split('\n')

	for (const line of lines) {
		if (line.startsWith('!! ')) {
			const filePath = line.slice(3)
			files.push(await unwrap(join(path, filePath)))
		}
	}

	return maybe(files)
}
