import { Err, Ok, type Result, isErr, to } from '@vyke/results/result'
import { type ProjectGitData as BaseProjectGitData, getProjectGitData, isPathIgnored } from '../bindings'

type ProjectGitData = Omit<BaseProjectGitData, 'lastCommitDate'> & {
	lastCommitDate: Date
}

export const git = {
	async getProjectData(path: string): Promise<Result<ProjectGitData, unknown>> {
		const result = await to(getProjectGitData(path))

		if (isErr(result)) {
			return Err(result.error)
		}

		const lastCommitDate = new Date(0)
		lastCommitDate.setUTCSeconds(result.value.lastCommitDate)

		return Ok({
			...result.value,
			lastCommitDate,
		})
	},
	defaultProjectData(): ProjectGitData {
		return {
			remoteOrigin: null,
			changes: [],
			branches: [],
			currentBranch: '',
			commitCount: 0,
			lastCommitDate: new Date(0),
		}
	},
	async isPathIgnore(path: string, pathToCheck: string): Promise<Result<boolean, unknown>> {
		const result = await to(isPathIgnored(path, pathToCheck))

		if (isErr(result)) {
			return Ok(true)
		}

		return Ok(result.value)
	},
}
