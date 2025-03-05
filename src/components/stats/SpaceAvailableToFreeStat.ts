import type { ReadSignal } from '@vyke/taggy/signals'
import { $when } from '@vyke/taggy'
import { computed } from '@vyke/taggy/signals'
import { button, div } from '../../tags'
import { $prettySize } from '../../utils/files'
import { Icon } from '../Icon'

type SpaceAvailableToFreeProps = {
	$diskUsage: ReadSignal<number>
	onFreeSpace?: () => void
}

export function SpaceAvailableToFree(props: SpaceAvailableToFreeProps) {
	const { $diskUsage } = props

	return div({ className: 'stat' }, [
		div({ className: 'stat-figure text-secondary' }, [
			Icon({ name: 'disk-usage' }),
		]),
		div({ className: 'stat-title' }, ['Space Available to Free']),
		div({ className: 'stat-value' }, [
			$prettySize($diskUsage),
		]),
		div({ className: 'stat-desc flex justify-center' }, [
			$when(computed(() => $diskUsage() > 0),
				[true, () => button({
					className: 'btn btn-ghost hover:btn-error hover:text-error-content',
					onclick() {
						props.onFreeSpace?.()
					},
				},
				[
					Icon({ name: 'trash' }),
					'Free Space',
				],
				)],
				[false, () => 'No free space available'],
			),
		]),
	])
}
