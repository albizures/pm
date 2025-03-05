import { div, h1 } from '../../tags'

export function App() {
	return div({ className: 'flex flex-col h-screen' }, [
		div({ className: 'flex-1' }, [
			h1(['Hello, world!']),
		]),
		div({ className: 'flex-1' }, [
			h1(['Hello, world!']),
		]),
	])
}
