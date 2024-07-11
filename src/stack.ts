import { type InferStack, defineViews } from '@vyke/solid-stack'
import { HomeView } from './pages/Home'
import { ProjectView } from './project/ProjectView'

export const stackViews = defineViews({
	HomeView,
	ProjectView,
}, {
	name: 'home',
})

export type AppStack = InferStack<typeof stackViews>
