import { Dynamic } from 'solid-js/web'
import { For, Show, createMemo } from 'solid-js'
import { destructurable } from '@vyke/solid-destructurable'
import { SiElixir } from 'solid-icons/si'
import { FaBrandsErlang, FaBrandsGitAlt, FaBrandsJs, FaBrandsPython, FaBrandsRust } from 'solid-icons/fa'
import { TbAlertHexagon, TbChevronDown, TbChevronRight, TbExternalLink, TbFolder, TbStar, TbTerminal2 } from 'solid-icons/tb'
import type { ProjectType } from '../bindings'

const icons = {
	'Javascript': FaBrandsJs,
	'Python': FaBrandsPython,
	'Rust': FaBrandsRust,
	'Erlang': FaBrandsErlang,
	'Elixir': SiElixir,
	'Gleam': TbStar,
	'Git': FaBrandsGitAlt,
	'folder': TbFolder,
	'caret-right': TbChevronRight,
	'caret-down': TbChevronDown,
	'alert': TbAlertHexagon,
	'external-link': TbExternalLink,
	'terminal': TbTerminal2,
}

type IconProps = {
	name: keyof typeof icons
	class?: string
}

export function Icon(props: IconProps) {
	const { name, class: className } = destructurable(props)

	return <Dynamic component={icons[name()]} class={className()} />
}

type IconByTypesProps = {
	types: Array<ProjectType>
	size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
	includeGit?: boolean
}

export function IconByTypes(props: IconByTypesProps) {
	const { types, includeGit, size } = destructurable(props, { includeGit: false, size: 'sm' })

	const sizeClass = createMemo(() => {
		switch (size()) {
			case 'sm':
				return 'size-4'
			case 'md':
				return 'size-6'
			case 'lg':
				return 'size-8'
			case 'xl':
				return 'size-12'
			case '2xl':
				return 'size-16'
			default:
				return 'size-4'
		}
	})

	return (
		<For each={types()}>
			{(type) => {
				return (
					// let's show the git icon only if it's the only type
					<Show when={type !== 'Git' || types().length === 1 || includeGit()}>
						<Icon
							name={type}
							class={`${sizeClass()} inline-block align-text-bottom`}
						/>
					</Show>
				)
			}}
		</For>
	)
}
