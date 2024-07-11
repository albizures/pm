import type { ProjectSpec } from './ProjectSpec'

export const javascriptSpec: ProjectSpec<'Javascript'> = {
	type: 'Javascript',
	depsFolder: 'node_modules',
}
