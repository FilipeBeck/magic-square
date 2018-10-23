import { State as StoreState } from '../store'
import * as actions from '../actions'
import * as components from '../components'
import { connect } from 'react-redux'
import React from 'react'
import { Timing } from './playing';

/**
 * Tela de recordes.
 */
export const Records = connect((storeState: StoreState) => {
	return {
		storeState
	}
}, dispatch => {
	return {
		onBackClick() {
			dispatch(actions.changeScene('intro'))
		},
		onRegisterName(player: string, index: number) {
			dispatch(actions.registerName(player, index))
		}
	}
})((props: Records.Props) => {
	const records = [...props.storeState.records]
	// Preenche o restante das linhas
	for (let i = records.length; i < 9; i++) {
		records.push({
			player: '---- ---- ----',
			date: 0,
			time: Infinity
		})
	}
	
	return <div className="records">
		<h1>Recordes</h1>
		<table>
			<thead><tr><th/><th/><th/></tr></thead>
			<tbody>{ records.map((record, i) => (
				<tr key={i}>
					<td className="name">{ record.player != '' && <span>{ record.player }</span> || <input autoFocus maxLength={20} onKeyUp={event => {
						if (event.which == 13) {
							props.onRegisterName((event.target as HTMLInputElement).value, i)
						}
					}}></input>}</td>
					<td className="date"><span>{ (record.date) ? new Date(record.date).toLocaleString() : '----' }</span></td>
					<td className="time"><components.Clock time={ record.time } resolution={ Timing.CLOCK_RESOLUTION }/></td>
				</tr>
			))}</tbody>
		</table>
		<button className="back" onClick={ props.onBackClick }>Voltar</button>
	</div>
})
/* Inerência de container `Records` */
export namespace Records {
	/**
	 * Atributos de componente `Records`.
	 */
	export interface Props {
		/** Estado do store. */
		storeState: StoreState

		/**
		 * Clique no botão "Voltar".
		 */
		onBackClick(): void

		/**
		 * Registrar nome do jogador.
		 * @param player Nome do jogador.
		 * @param index Índice na lista de recordes.
		 */
		onRegisterName(player: string, index: number): void
	}
}