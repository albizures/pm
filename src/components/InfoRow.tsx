import { destructurable } from '@vyke/solid-destructurable'
import type { JSX } from 'solid-js'

type InfoRowProps = {
	label: JSX.Element
	value: JSX.Element
}

export function InfoRow(props: InfoRowProps) {
	const { label, value } = destructurable(props)

	return (
		<div class="flex mt-1 flex-wrap justify-between border-b border-dashed border-base-content border-opacity-10">
			<p>
				{label()}
				:
			</p>
			<p class="text-right">
				{value()}
			</p>
		</div>
	)
}
