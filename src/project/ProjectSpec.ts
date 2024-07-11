import type { ProjectType } from '../bindings'

export type ProjectSpec<TType extends ProjectType> = {
	type: TType
	depsFolder: string
}
