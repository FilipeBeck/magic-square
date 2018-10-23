import { State as StoreState } from '../store'
import { Introduction } from './introduction'
import { Playing } from './playing'
import { Records } from './records'
import { connect } from 'react-redux'
import React from 'react'

/**
 * Indexador.
 */
export const Index = connect((storeState: StoreState) => {
	return {
		storeState
	}
})((props: Index.Props) => {
	const components: { [K in StoreState['scene']]: () => JSX.Element} = {
		intro: () => <Introduction/>,
		playing: () => <Playing/>,
		records: () => <Records/>
	}

	return components[props.storeState.scene]()
})
/* Inerência de interface `Index` */
export namespace Index {
	/**
	 * Atributos de componente `Index`.
	 */
	export interface Props {
		/** Estado do store. */
		storeState: StoreState
	}
}