import type { ReadSignal } from '@vyke/taggy/signals'
import { $when } from '@vyke/taggy'
import { computed } from '@vyke/taggy/signals'
import { div } from '../../tags'
import { Icon } from '../Icon'

type UncommitedChangesStatProps = {
	$amount: ReadSignal<number>
}

export function UncommitedChangesStat(props: UncommitedChangesStatProps) {
	const { $amount } = props

	return div({ className: 'stat' }, [
		div({ className: 'stat-figure text-secondary' }, [
			Icon({ name: 'disk-usage' }),
		]),
		div({ className: 'stat-title text-center' }, ['Uncommited Changes']),
		div({ className: 'stat-value text-center' }, [
			$amount(),
		]),
		div({ className: 'stat-desc flex justify-center' }, [
			$when(computed(() => $amount() > 0),
				[true, () => 'There are uncommited changes'],
				[false, () => 'No uncommited changes'],
			),
		]),
	])
}
