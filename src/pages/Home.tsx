import { defineView } from '@vyke/solid-stack'
import { createResource } from 'solid-js'
import { getProjectsWithUncommittedChanges } from '../bindings'
import { ProjectListWithChanges } from '../project/ProjectListWithChanges'

export const HomeView = defineView('home', () => {
	const [projects] = createResource(() => {
		return getProjectsWithUncommittedChanges()
	}, { initialValue: [] })

	return (
		<div>
			Home

			<ProjectListWithChanges entries={projects()} />
		</div>
	)
}).withActions((push) => ({
	push,
}))
