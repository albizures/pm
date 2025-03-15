import type { Signal } from '@vyke/taggy/signals'
import { computed } from '@vyke/taggy/signals'
import { format, formatDistance } from 'date-fns'

type Format = 'full' | 'date' | 'short' | 'short-time-ago' | 'time-ago'

export function formatDate(date: Date | undefined, formatName: Format = 'full') {
	if (!date) {
		return 'Invalid date'
	}

	if (formatName === 'full') {
		return format(date, 'yyyy-MM-dd hh:mm:ss aaa')
	}

	if (formatName === 'date') {
		return format(date, 'yyyy-MM-dd')
	}

	if (formatName === 'short') {
		return format(date, 'MMM dd, yyyy')
	}

	if (formatName === 'time-ago') {
		return formatDistance(date, new Date(), {
			addSuffix: true,
		})
	}

	if (formatName === 'short-time-ago') {
		const timeAgo = formatDistance(date, new Date(), {
			addSuffix: true,
		})
		return `${format(date, 'yyyy-MM-dd')} - ${timeAgo}`
	}

	return format(date, 'yyyy-MM-dd')
}

export function $formatDate($date: Signal<Date>, formatName: Format = 'full') {
	return computed(() => formatDate($date(), formatName))
}
