import { formatDistanceToNow } from 'date-fns'

export function formatLastTimeModified(date: Date) {
	return formatDistanceToNow(date, { addSuffix: true })
}

export function formatLastCommitDate(date: Date) {
	return formatDistanceToNow(date, { addSuffix: true })
}
