import { type Accessor, type JSX, type MemoOptions, children, createMemo, untrack } from 'solid-js'

type EvalConditions = readonly [number, unknown?, MatchProps<unknown>?]

function narrowedError(name: string) {
	return '_SOLID_DEV_'
		? `Attempting to access a stale value from <${name}> that could possibly be undefined. This may occur because you are reading the accessor returned from the component at a time where it has already been unmounted. We recommend cleaning up any stale timers or async, or reading from the initial condition.`
		: `Stale read from <${name}>.`
}

/**
 * Switches between content based on mutually exclusive conditions
 * ```typescript
 * <Switch fallback={<FourOhFour />}>
 *   <Match when={state.route === 'home'}>
 *     <Home />
 *   </Match>
 *   <Match when={state.route === 'settings'}>
 *     <Settings />
 *   </Match>
 * </Switch>
 * ```
 * @description https://docs.solidjs.com/reference/components/switch-and-match
 */
export function Switch(props: { fallback?: JSX.Element, children: JSX.Element }): JSX.Element {
	let keyed = false
	const equals: MemoOptions<EvalConditions>['equals'] = (a, b) =>
		(keyed ? a[1] === b[1] : !a[1] === !b[1]) && a[2] === b[2]
	const conditions = children(() => props.children) as unknown as () => Array<MatchProps<unknown>>
	const evalConditions = createMemo(
		(): EvalConditions => {
			let conds = conditions()
			if (!Array.isArray(conds)) { conds = [conds] }
			for (let i = 0; i < conds.length; i++) {
				const c = conds[i].when
				if (c) {
					keyed = !!conds[i].keyed
					return [i, c, conds[i]]
				}
			}
			return [-1]
		},
		undefined,
		'_SOLID_DEV_' ? { equals, name: 'eval conditions' } : { equals },
	)
	return createMemo(
		() => {
			const [index, when, cond] = evalConditions()
			if (index < 0) { return props.fallback }
			const c = cond!.children
			const fn = typeof c === 'function' && c.length > 0
			return fn
				? untrack(() =>
					(c as any)(
						keyed
							? when
							: () => {
								if (untrack(evalConditions)[0] !== index) { throw narrowedError('Match') }
								return cond!.when
							},
					),
				)
				: c
		},
		undefined,
		'_SOLID_DEV_' ? { name: 'value' } : undefined,
	) as unknown as JSX.Element
}

export type MatchProps<T> = {
	when: T | undefined | null | false
	keyed?: boolean
	children: JSX.Element | ((item: NonNullable<T> | Accessor<NonNullable<T>>) => JSX.Element)
}
/**
 * Selects a content based on condition when inside a `<Switch>` control flow
 * ```typescript
 * <Match when={condition()}>
 *   <Content/>
 * </Match>
 * ```
 * @description https://docs.solidjs.com/reference/components/switch-and-match
 */
export function Match<
	T,
	TRenderFunction extends (item: Accessor<NonNullable<T>>) => JSX.Element,
>(props: {
	when: T | undefined | null | false
	keyed?: false
	children: JSX.Element | RequiredParameter<TRenderFunction>
}): JSX.Element
export function Match<T, TRenderFunction extends (item: NonNullable<T>) => JSX.Element>(props: {
	when: T | undefined | null | false
	keyed: true
	children: JSX.Element | RequiredParameter<TRenderFunction>
}): JSX.Element
export function Match<T>(props: MatchProps<T>) {
	return props as unknown as JSX.Element
}

type RequiredParameter<T> = T extends () => unknown ? never : T
