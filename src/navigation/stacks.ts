import { noProps } from '../component'
import { HomeView } from '../ui/views/HomeView.ui'
import { ProjectView } from '../ui/views/ProjectView.ui'
import { NavigationStack, type StackViews } from './navigation'

const appViews = {
	home: HomeView,
	project: ProjectView,
} as const

export type AppStackViews = typeof appViews

export type StackName = 'app'

export const appStack = new NavigationStack('app', appViews, {
	view: 'home',
	props: noProps,
})

export type AppStack = typeof appStack

export const stacks = {
	app: appStack,
} as const satisfies Record<StackName, unknown>

export type Stacks = typeof stacks

export function getStack<TName extends StackName>(name: TName) {
	return stacks[name]
}
