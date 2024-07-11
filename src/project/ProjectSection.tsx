import { destructurable } from '@vyke/solid-destructurable'
import { createSignal } from 'solid-js'
import type { JSX } from 'solid-js/jsx-runtime'

type ProjectSectionProps = {
	title: JSX.Element
	children: JSX.Element
}

export function ProjectSection(props: ProjectSectionProps) {
	const [status, setStatus] = createSignal<'open' | 'closed'>('closed')
	const { title, children } = destructurable(props)

	function onToggle() {
		setStatus(status() === 'open' ? 'closed' : 'open')
	}

	return (
		<div>
			<div
				classList={{
					'collapse-open': status() === 'open',
				}}
				class="border border-base-300 collapse collapse-plus bg-base-200"
			>
				<div class="collapse-title text-2xl text-left" onClick={onToggle}>
					{title()}
				</div>
				<div class="collapse-content">
					{children()}
				</div>
			</div>
		</div>
	)
}
