/* @refresh reload */
import './styles.css'
import { render } from 'solid-js/web'
import { stackManager } from '@vyke/solid-stack'
import { stackViews } from './stack'
import { Layout } from './components/Layout'
import { StackRoot } from './components/StackRoot'

render(() => (
	<StackRoot
		Layout={Layout}
		manager={stackManager}
		views={stackViews}
	/>
), document.getElementById('root') as HTMLElement)
