import { State as StoreState } from '../store'
import * as actions from '../actions'
// import * as components from '../components'
import { connect } from 'react-redux'
import React from 'react'

/**
 * Tela de introdução.
 */
export const Introduction = connect((storeState: StoreState) => {
	return {
		storeState
	}
}, dispatch => {
	return {
		onPlayClick() {
			dispatch(actions.changeScene('playing'))
		},
		onResetClick() {
			dispatch(actions.finishGame(true))
			dispatch(actions.changeScene('playing'))
		},
		onRecordsClick() {
			dispatch(actions.changeScene('records'))
		}
	}
})((props: Introduction.Props) => {
	return <div className="introduction">
		<h1>Magic Square</h1>
		<div className="choice-panel">
			<button className="play" onClick={ props.onPlayClick }>{ (props.storeState.currentTime == 0) ? 'Jogar' : 'Continuar' }</button>
			<button className="records" onClick={ props.onRecordsClick }>Recordes</button>
			{ props.storeState.currentTime > 0 && <button className="reset" onClick={ props.onResetClick }>Novo jogo</button> }
		</div>
	</div>
})
/* Inerência de container `Introduction` */
export namespace Introduction {
	/**
	 * Atributos de componente `Introdution`.
	 */
	export interface Props {
		/** Estado do store. */
		storeState: StoreState

		/**
		 * Clique no botão "Jogar".
		 */
		onPlayClick(): void

		/**
		 * Clique no botão "Reiniciar".
		 */
		onResetClick(): void

		/**
		 * Clique no botão "Recordes".
		 */
		onRecordsClick(): void
	} 
}