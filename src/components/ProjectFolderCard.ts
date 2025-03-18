import type { ProjectFolder } from '../entities/project/project'
import { unwrap } from '../error'
import { button, div, h4, input } from '../tags'
import { openInCursor } from '../utils/editor'

type ProjectFolderCardProps = {
	folder: ProjectFolder
}

export function ProjectFolderCard(props: ProjectFolderCardProps) {
	const { folder } = props

	function onClickOpenInCursor(event: MouseEvent) {
		event.stopPropagation()
		event.preventDefault()
		event.stopImmediatePropagation()
		unwrap(openInCursor(folder.path))
	}

	return div({ className: 'collapse collapse-arrow group bg-base-100 border-base-300 border' }, [
		input({ type: 'checkbox' }),
		div({ className: 'collapse-title font-semibold flex h-8 items-center' }, [
			h4({ className: 'flex-1' }, [
				folder.path,
			]),
			div({ className: 'flex gap-2' }, [
				button({ className: 'btn btn-sm z-100 btn-outline btn-accent transition-opacity duration-200 opacity-0 group-hover:opacity-50 group-hover:hover:opacity-100' }, [
					'Clean',
				]),
				button({
					className: 'btn btn-sm btn-outline z-100 btn-primary transition-opacity duration-200 opacity-0 group-hover:opacity-50 group-hover:hover:opacity-100',
					onclick: onClickOpenInCursor,
				}, [
					'Open',
				]),
			]),
		]),
		div({ className: 'collapse-content text-sm' }, [
			'Click the "Sign Up" button in the top right corner and follow the registration process.',
		]),
	])
}
