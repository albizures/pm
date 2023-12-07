import { readDir } from '@tauri-apps/api/fs'
import { to } from '@await-to/core'
import { homeDir, join } from '@tauri-apps/api/path'
import { metadata as getMetadata } from 'tauri-plugin-fs-extra-api'
import { rootConsola } from '../consola/consola'
import { classNames } from '../signal/classNames'
import { $ } from '../signal'
import { intera } from '../intera/intera'
import { appStack } from '../navigation/stacks'
import type { Props } from '../component'
import { Fragment, button, div, li, span, ul } from '../elements'

const consola = rootConsola.withTag('FileList')

export async function FileTree() {
	const rootPath = await join(await homeDir(), 'projects')

	return FolderList({
		parent: rootPath,
	})
}

type FolderListProps = Props<{
	parent: string
}>

async function FolderList(props: FolderListProps) {
	const { parent } = props
	const entries = (await readDir(parent))// .splice(0, 4)

	return ul({},
		...await Promise.all(entries.map((entry) => {
			const { name, path } = entry

			if (!name) {
				return ''
			}

			return FileEntryItem({
				name,
				parent,
				path,
			})
		})),
	)
}

type FileEntryItemProps = Props<{
	name: string
	path: string
	parent: string
}>

async function FileEntryItem(props: FileEntryItemProps) {
	const { name, path, parent } = props

	if (!name) {
		return ''
	}

	const metadata = await to(getMetadata(path))

	if (!metadata.ok) {
		consola.error('meta', metadata.error)
		return li('error')
	}

	if (metadata.data.isFile) {
		return ''
	}

	const isProject = await to(isProjectFolder(path))

	if (!isProject.ok) {
		consola.error('isProject', path, isProject.error)

		return li('error')
	}

	const nextProps = {
		path,
		parent,
	}

	return li({ id: path },
		await (isProject.data
				? Project(nextProps)
				: Folder(nextProps)),
	)
}

type ProjectProps = Props<{
	path: string
	parent: string
}>

async function Project(props: ProjectProps) {
	const { path, parent } = props
	const onNavigate = intera.click(() => {
		appStack.push('project', { root: path })
	})

	return button({
		[onNavigate.attrName]: onNavigate.value,
	},
		`🚀 ${path.replace(`${parent}/`, '')}`,
	)
}

function toLowerCase(item: string) {
	return item.toLowerCase()
}

const projectFiles = [
	'mix.exs',
	'package.json',
	'cargo.toml',
	'.git',
	'project.godot',
].map(toLowerCase)

async function isProjectFolder(path: string) {
	const entries = await readDir(path)

	for (const entry of entries) {
		if (projectFiles.includes(String(entry.name).toLowerCase())) {
			return true
		}
	}

	return false
}

type FolderProps = Props<{
	parent: string
	path: string
}>

async function Folder(props: FolderProps): Promise<Node> {
	const { path, parent } = props
	const isOpen = $.signal(false)
	const className = classNames('overflow-hidden ml-7 transition-all', $.if(isOpen, 'h-auto', 'h-0'))

	const classNameIcon = classNames(
		'i-icons-arrow-forward-ios transform inline-block transition-transform',
		$.if(isOpen, 'rotate-90', 'rotate-0'),
	)

	const onOpen = intera.click(() => {
		isOpen((current) => !current)
	})

	return Fragment(
		button({ [onOpen.attrName]: onOpen.value },
			span({
				...classNameIcon.attr,
			}),
			span({ class: 'align-text-bottom' },
				path.replace(`${parent}/`, ''),
			),
		),
		div({ ...className.attr },
			await FolderList({ parent: path }),
		),
	)
}
