import { span } from '../tags'

const iconNames = {
	'disk-usage': 'fa6-solid--hard-drive',
	'git': 'fa-brands--git-alt',
	'scan': 'fa6-solid--binoculars',
	'loader': 'fa6-solid--circle-notch',
	'search': 'fa6-solid--magnifying-glass',
	'close': 'fa6-solid--xmark',
	'trash': 'fa6-solid--trash-can',
	'folder': 'fa6-solid--folder',
	'options': 'fa6-solid--ellipsis-vertical',
} as const

type IconName = keyof typeof iconNames

type IconProps = {
	name: IconName
	className?: string
}

export function Icon(props: IconProps) {
	const { className = '', name } = props

	return span({ className: `iconify ${iconNames[name]} ${className}` })
}
