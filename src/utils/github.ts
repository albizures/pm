import ky from 'ky'
import { z } from 'zod'
import type { Maybe } from '../error'
import { maybe } from '../error'

function getRepoPath(repoUrl: string) {
	return repoUrl.replace('https://github.com/', '')
}

type RepoMetadata = z.infer<typeof repoMetadataSchema>
const repoMetadataSchema = z.object({
	repo: z.object({
		id: z.number(),
		name: z.string(),
		repo: z.string(),
		description: z.string(),
	})
})

export async function getRepoMetadata(repoUrl: string): Promise<Maybe<RepoMetadata>> {
	const response = await ky.get(`https://ungh.cc/repos/${getRepoPath(repoUrl)}`)

	const json = await response.json()

	return maybe(repoMetadataSchema.parse(json))
}

export function isGitHubRepo(repoUrl?: string): repoUrl is string {
	return repoUrl?.includes('https://github.com/') ?? false
}
