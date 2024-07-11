import type { JSX } from 'solid-js'
import { For, createContext, createMemo, useContext } from 'solid-js'
import type { AnyStackViews, StackManager, StackNavigator } from '@vyke/solid-stack/stack'
import { createNavigation } from '@vyke/solid-stack'
import { destructurable } from '@vyke/solid-destructurable'
import type { AppStack } from '../stack'

type Navigation = StackNavigator<AppStack>
const StackContext = createContext<Navigation>(undefined)

type StackProps = {
	manager: StackManager
	views: AnyStackViews
	Layout: (props: { children: JSX.Element }) => JSX.Element
}

export function StackRoot(props: StackProps) {
	const { Layout, manager, views } = destructurable(props)
	const navigation = createNavigation<AppStack>()
	return (
		<StackContext.Provider value={navigation}>
			<Layout>
				<div>
					<For each={manager().stack()}>
						{(item, index) => {
							const isActive = createMemo(() => manager().index() === index())

							return (
								<div
									classList={{
										hidden: !isActive(),
									}}
									data-index={index()}
								>
									{/* @ts-expect-error not way to type this safely */}
									<Dynamic component={views()[item.name]!.View} {...item.props} />
								</div>
							)
						}}
					</For>
				</div>
			</Layout>
		</StackContext.Provider>
	)
}

export function useNavigation() {
	const navigation = useContext(StackContext)

	if (!navigation) {
		throw new Error('useNavigation must be used within a StackRoot')
	}

	return navigation
}
