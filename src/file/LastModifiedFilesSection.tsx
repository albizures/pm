import { For, createResource } from 'solid-js'
import { destructurable } from '@vyke/solid-destructurable'
import { toUnwrapOr } from '@vyke/results/result'
import { ProjectSection } from '../project/ProjectSection'
import { Icon } from '../components/Icon'
import { formatLastTimeModified } from '../date'
import { InfoRow } from '../components/InfoRow'
import { findMostRecentModifiedFiles } from './fileHelpers'

type LastModifiedFilesSectionProps = {
	path: string
}

export function LastModifiedFilesSection(props: LastModifiedFilesSectionProps) {
	const { path } = destructurable(props)
	const [files] = createResource(path(), async (path) => {
		return toUnwrapOr(findMostRecentModifiedFiles({
			path,
			projectPath: path,
			amount: 5,
			ignore: ['node_modules', '.git', 'pnpm-lock.yaml'],
		}), [], console.error)
	}, { initialValue: [] })

	return (
		<ProjectSection title={(
			<>
				<Icon class="inline-block mr-2" name="folder" />
				Last Modified Files
			</>
		)}
		>
			<For each={files()}>
				{(file) => {
					return (
						<InfoRow
							label={file.path.replace(path(), '')}
							value={formatLastTimeModified(file.modifiedAt)}
						/>
					)
				}}
			</For>
		</ProjectSection>
	)
}
