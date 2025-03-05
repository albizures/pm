import type { ParamService } from './params'
import { assert } from '../error'

type Services = {
	logger: Console
	params: ParamService
}

type Service = keyof Services

type DependencyService = {
	register: <TName extends Service>(name: TName, service: Services[TName]) => void
	resolve: <TName extends Service>(name: TName) => Services[TName]
}

function createDepedencyService() {
	const services = new Map<Service, Services[Service]>()

	const service: DependencyService = {
		register(name, service) {
			services.set(name, service)
		},
		resolve(name) {
			const service = services.get(name)
			assert(service, `Service ${String(name)} not found`)

			return service as Services[typeof name]
		},
	}

	return service
}

export const Dependencies = createDepedencyService()
