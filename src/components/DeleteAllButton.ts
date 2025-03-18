import type { $Project } from '../entities/project/project'
import { computed } from '@vyke/taggy/signals'
import { ProjectBox } from '../entities/project/project-box'

import { button, dialog, div, h3, p } from '../tags'

type DeleteAllButtonProps = {
	className?: string
	$project: $Project
	goBack?: boolean
}

export function DeleteAllButton(props: DeleteAllButtonProps) {
	const { $project, className, goBack = true } = props

	const $modalId = computed(() => `delete-all-${$project().id}`)

	function onClickDeleteAll() {
		const modal = document.getElementById($modalId())
		if (isDialog(modal)) {
			modal.showModal()
		}
	}

	function onClickClose() {
		const modal = document.getElementById($modalId())
		if (isDialog(modal)) {
			modal.close()
		}
	}

	async function onDeleteAll() {
		await ProjectBox.deleteProject($project)

		if (goBack) {
			history.back()
		}
	}

	return div([
		dialog({ className: 'modal', id: $modalId }, [
			div({ className: 'modal-box' }, [
				h3({ className: 'text-2xl font-bold text-center' }, ['Delete all']),
				p({ className: 'text-center' }, ['Are you sure you want to delete all?']),
				div({ className: 'flex gap-2 justify-center mt-4' }, [
					button({ className: 'btn btn-error', onclick: onDeleteAll }, [
						'Delete all',
					]),
					button({ className: 'btn btn-primary', onclick: onClickClose }, [
						'Close',
					]),
				]),
			]),
		]),
		button({ className, onclick: onClickDeleteAll }, [
			'Delete all',
		]),
	])
}

function isDialog(element: HTMLElement | null | undefined): element is HTMLDialogElement {
	return element?.tagName === 'DIALOG'
}
