import { State as StoreState, VOID_CELL } from '../store'
import * as actions from '../actions'
import * as components from '../components'
import { connect } from 'react-redux'
import React from 'react'

/**
 * Dados de temporização.
 */
// NOTE: Mesmo com `const enum` no namespace, gera erro de identificador duplicado
export const enum Timing {
	/** Limite do contador de movimento no processo de embaralhamento. */
	COUNTER_LIMIT = 150,
	/** Tempo de espera antes de embaralhar. */
	RAND_DELAY = 5000,
	/** Tempo de cada movimento. */
	MOVE_SPEED = 1000 / 8,
	/** Resolução do relógio - delay entre cada incremento. */
	CLOCK_RESOLUTION = 100
}

/**
 * Tela do jogo.
 */
export const Playing = connect((storeState: StoreState) => {
	return {
		storeState
	}
}, dispatch => {
	return {
		onPieceClick(position: [number, number]) {
			dispatch(actions.movePiece(position))
		},
		onBackClick() {
			dispatch(actions.changeScene('intro'))
		},
		onEndRand() {
			dispatch(actions.endRand())
		},
		onTimeElapsed() {
			dispatch(actions.incrementClock())
		},
		onNextClick() {
			dispatch(actions.advanceStage())
		},
		onEndGame() {
			dispatch(actions.finishGame(false))
		}
	}
})(class Playing extends React.Component<Playing.Props, Playing.State> {
	/** Estado inicial. */
	public state: Playing.State = {
		timing: {
			timeoutTimer: undefined,
			intervalTimer: undefined,
			counter: 0,
			clockTimer: undefined
		}
	}

	/**
	 * Embaralha se novo jogo ou nova fase e carrega a imagem.
	 */
	public async componentDidMount() {
		await this.randIfNeeded()
		this.startClock()
	}

	/**
	 * Embaralha se novo jogo ou nova fase e carrega a imagem.
	 */
	public async componentDidUpdate(prevProps: Playing.Props) {
		if (this.props.storeState.isSorted && this.state.timing.clockTimer) {
			this.setState({
				timing: {
					...this.state.timing,
					clockTimer: window.clearInterval(this.state.timing.clockTimer) as undefined
				}
			})
		}
		else if (prevProps.storeState.stage != this.props.storeState.stage) {
			await this.randIfNeeded()
			this.startClock()
		}
	}

	/**
	 * Interrompe os temporizadores ao sair antes do embaralhamento.
	 */
	public componentWillUnmount() {
		if (this.state.timing.timeoutTimer) {
			window.clearTimeout(this.state.timing.timeoutTimer)
		}
		if (this.state.timing.intervalTimer) {
			window.clearInterval(this.state.timing.intervalTimer)
		}
		if (this.state.timing.clockTimer) {
			window.clearInterval(this.state.timing.clockTimer)
		}
	}
	
	/**
	 * Renderiza.
	 */
	public render() {
		const table = this.props.storeState.table
		const cellWidth = Math.floor(100 / table[0].length)
		const cellHeight = Math.floor(100 / table.length)
		//
		const flatTable = table.reduce((result, row) => {
			result.push(...row)
			return result
		}, Array<number | null>())

		const cells = Array<JSX.Element>()

		for (let i = 0, count = flatTable.length; i < count; i++) {
			const offset = flatTable.indexOf(i)

			cells.push(
				<div key={i} className={ `cell${(i == VOID_CELL) ? ' void' : ''}` } style={{
					left: `${(offset % 4) * cellWidth}%`,
					top: `${(Math.floor(offset / 4)) * cellHeight}%`,
					width: `${cellWidth}%`,
					height: `${cellHeight}%`,
					backgroundImage: `url("./images/picture-${this.props.storeState.stage}.png")`,
					backgroundPosition: `${-Playing.PICTURE_SIZE / table[0].length * (i % 4)}px ${-Playing.PICTURE_SIZE / table.length * (Math.floor(i / 4))}px`,
					backgroundSize: `${Playing.PICTURE_SIZE}px ${Playing.PICTURE_SIZE}px`,
					transitionDuration: `${Timing.MOVE_SPEED}ms`,
				}} onClick={event => {
					if (!this.props.storeState.isSorted && !this.state.timing.timeoutTimer && !this.state.timing.intervalTimer) {
						this.props.onPieceClick([offset % 4, Math.floor(offset / 4)])
					}
				}}></div>
			)
		}

		return <div className={`playing${this.props.storeState.isSorted && ' delay' || ''}`}>
			<h1>Estágio { this.props.storeState.stage }</h1>
			<components.Clock time={ this.props.storeState.currentTime } resolution={ Timing.CLOCK_RESOLUTION }/>
			<components.RandTimerNotificator
				step={ (this.state.timing.timeoutTimer) ? 'delay' : (this.state.timing.intervalTimer) ? 'randomizing' : 'playing' }
				time={ (this.state.timing.intervalTimer) ? (Timing.MOVE_SPEED * Timing.COUNTER_LIMIT) : Timing.RAND_DELAY }
			/>
			<div className="table" style={{
				width: Playing.PICTURE_SIZE,
				height: Playing.PICTURE_SIZE
			}}>{ cells }</div>
			{(this.props.storeState.isSorted && !this.state.timing.timeoutTimer && !this.state.timing.intervalTimer && !this.state.timing.clockTimer) ? (
				(this.props.storeState.stage < 4) ? (
					<button onClick={ this.props.onNextClick }>Próximo</button>
				) : (
					<button onClick={ this.props.onEndGame }>Recordes</button>
				)
			) : (
				<button className="back" onClick={ this.props.onBackClick }>Voltar</button>
			)}
		</div>	
	}

	/** Tamnha da imagem. */
	private static PICTURE_SIZE = 400

	/**
	 * Embaralha se necessário.
	 */
	private async randIfNeeded(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (!this.props.storeState.shouldRand) { // Jogo em andamento
				resolve()
				return
			}

			const table = this.props.storeState.table
			// Deixa o usuário ver a imagem por um tempo antes de começar a embaralhar
			this.setState({
				timing: {
					...this.state.timing,
					timeoutTimer: window.setTimeout(() => {
						// Peça ["da direita", "de cima", "da esquerda", "de baixo"]
						const delta = [[1, 0], [0, 1], [-1, 0], [0, -1]]
						// Posição da célula vazia
						let voidCell = [3, 3]
						// Posição da peça a ser movida
						let cellToMove: [number, number] = [0, 0]
						// Índice de `delta` que determina a peça a ser movida
						let currentMove = 2
						// Índice de `delta` do movimento contrário (para evitar zigue-zagues)
						let opossiteMove = 0
						
						this.setState({
							timing: {
								...this.state.timing,
								timeoutTimer: undefined,
								counter: 0,
								intervalTimer: window.setInterval(() => {
									do { // Pegamos uma peça dentro dos limites do tabuleiro
										do { // Pegamos o índice `delta` do movimento
											currentMove = Math.round(Math.random() * 3)
										} // Evita zigue-zague
										while (currentMove == opossiteMove)
				
										const [x, y] = voidCell
										const [dx, dy] = delta[currentMove]
										// Coordenada da peça a ser movida
										cellToMove = [x + dx, y + dy]
									} // Previne movimento fora dos limites do tabuleiro
									while (table[cellToMove[0]] === undefined || table[cellToMove[0]][cellToMove[1]] === undefined)
				
									this.props.onPieceClick(cellToMove)
									voidCell = cellToMove
									opossiteMove = (currentMove + 2) % 4
									// Incrementa o contador
									this.setState({
										timing: {
											...this.state.timing,
											counter: this.state.timing.counter + 1
										}
									}, () => { // Interrompe e limpa o contador se já é hora de finalizar o embaralhamento
										if (this.state.timing.counter == Timing.COUNTER_LIMIT) {
											this.setState({
												timing: {
													...this.state.timing,
													intervalTimer: window.clearInterval(this.state.timing.intervalTimer) as undefined
												}
											}, () => {
												this.props.onEndRand()
												resolve()
											})
										}
									})
								}, Timing.MOVE_SPEED)
							}
						})
					}, Timing.RAND_DELAY)
				}
			})
		})
	}

	/**
	 * Inicia a contagem de tempo.
	 */
	private startClock(): void {
		this.setState({
			timing: {
				...this.state.timing,
				clockTimer: window.setInterval(() => {
					this.props.onTimeElapsed()
				}, Timing.CLOCK_RESOLUTION)
			}
		})
	}
})
/* Inerência de container `Playing` */
export namespace Playing {
	/**
	 * Atributos de componente `Playing`.
	 */
	export interface Props {
		/** Estado do store. */
		storeState: StoreState

		/**
		 * Clique em alguma peça.
		 * @param position Posição [x,y] da peça.
		 */
		onPieceClick(position: [number, number]): void

		/**
		 * Clique no botão "Voltar".
		 */
		onBackClick(): void

		/**
		 * Terminar embaralhamento.
		 */
		onEndRand(): void

		/**
		 * Disparo do timer do relógio.
		 */
		onTimeElapsed(): void

		/**
		 * Clique em "Próximo estágio".
		 */
		onNextClick(): void

		/**
		 * Clique em finalizar jogo.
		 */
		onEndGame(): void
	}

	/**
	 * Estado de componente `Playing`.
	 */
	export interface State {
		/** Dados de temporização. */
	 	timing: {
			/** Temporizador de intervalo entre movimentos. */
			intervalTimer: number | undefined,
			/** Temporizador de delay do primeiro movimento. */
			timeoutTimer: number | undefined,
			/** Contador. */
			counter: number
			/** Temporizador do relógio. */
			clockTimer: number | undefined
		}
	}
}