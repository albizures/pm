import { open } from '@tauri-apps/plugin-shell'
import { a } from '../tags'

type ExternalLinkProps = {
	href: string
	children: string
	className?: string
}

export function ExternalLink(props: ExternalLinkProps) {
	const { href, children, className } = props

	function onClick() {
		open(href)
	}

	return a({ href, target: '_blank', className, onclick: onClick }, [children])
}
