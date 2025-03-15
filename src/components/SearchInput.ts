import type { Signal } from '@vyke/taggy/signals'
import { computed, syncValue } from '@vyke/taggy/signals'
import clsx from 'clsx'
import { button, input, label } from '../tags'
import { Icon } from './Icon'

type SearchInputProps = {
	$value: Signal<string | number>
}

export function SearchInput(props: SearchInputProps) {
	const { $value } = props
	return label({ className: 'input input-sm input-bordered w-full max-w-xs' }, [
		Icon({ name: 'search' }),
		input({
			required: true,
			placeholder: 'Search',
			...syncValue($value as Signal<string>),
		}),
		button({
			className: computed(() => clsx('h-[1em] w-[1em] p-0 cursor-pointer', {
				hidden: $value() === '',
			})),
			onclick() {
				$value('')
			},
		}, [Icon({ name: 'close' })]),
	])
}
