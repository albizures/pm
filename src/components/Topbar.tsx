import { TbChevronLeft, TbChevronRight } from 'solid-icons/tb'
import { destructurable } from '@vyke/solid-destructurable'
import { Show } from 'solid-js'
import { useNavigation } from './StackRoot'

export function Topbar() {
	const navigation = useNavigation()
	function onPrevious() {
		navigation.goBack()
	}

	function onNext() {
		navigation.goForward()
	}

	return (
		<div data-tauri-drag-region={true} class="px-1 py-1 w-full border-b border-b-base-300">
			<div class="flex pointer-events-none">
				<NavButton isDisabled={false} type="previous" onClick={onPrevious} />
				<NavButton isDisabled={false} type="next" onClick={onNext} />
			</div>
		</div>
	)
}

type NavButtonProps = {
	type: 'previous' | 'next'
	onClick: () => void
	isDisabled?: boolean
}

function NavButton(props: NavButtonProps) {
	const { type, onClick, isDisabled } = destructurable(props)
	return (
		<button
			disabled={isDisabled()}
			onClick={onClick}
			class="p-2 aspect-square text-2xl rounded pointer-events-auto"
			classList={{
				'opacity-50': isDisabled(),
				'hover:bg-base-300': !isDisabled(),
			}}
		>
			<Show when={type() === 'next'} fallback={<TbChevronLeft />}>
				<TbChevronRight />
			</Show>
		</button>
	)
}
