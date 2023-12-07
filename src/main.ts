import 'uno.css'
import '@unocss/reset/tailwind.css'
import { rootConsola } from './consola/consola'
import { App, AppAlt } from './ui/App.ui'
import { intera } from './intera/intera'
import { div } from './elements'
import { SideBarAlt } from './ui/Sidebar.ui'

const consola = rootConsola.withTag('main')

const appElement = document.querySelector('#app')!

consola.debug('starting app...')

intera.add(
	appElement,
	await AppAlt(),

)

// App().then((app) => {
// 	intera.append(appElement, app)
// }).catch(() => {
// 	consola.error('error starting the app')
// })
