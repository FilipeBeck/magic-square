import { createStore } from 'redux'

/**
 * Estado da aplicação.
 */
export interface State {
	/** Tela corrente. */
	scene: 'intro' | 'records' | 'playing'
	/** Estágio corrente. */
	stage: number
	/** Tempo de jogo corrente. */
	currentTime: number
	/** Recordes. */
	records: Array<{
		/** Nome do jogador. */
		player: string
		/** Data do recorde. */
		date: number
		/** Tempo de jogo. */
		time: number
	}>
	/** Posição das peças. */
	table: number[][]
	/** Determina se deve embaralhar. */
	shouldRand: boolean
	/** Determina se está ordenado. */
	isSorted: boolean
}

/**
 * Payload das ações.
 */
export interface Payload<T> {
	/** Tipo da ação. */
	type: Payload.Type
	/** Dados da ação. */
	data: T
}
/* Inerência de `Payload`. */
export namespace Payload {
	/**
	 * Tipos de ações possíveis.
	 */
	export const enum Type {
		/** Mudar de tela. */
		CHANGE_SCENE,
		/** Avançar para o próximo estágio. */
		NEXT_STAGE,
		/** Finalizar jogo. */
		END_GAME,
		/** Mover peça. */
		MOVE_PIECE,
		/** Finalizar embaralhamento. */
		END_RAND,
		/** Incrementar relógio. */
		INCREMENT_CLOCK,
		/** Registrar nome do jogador. */
		REGISTER_NAME
	}
}

/** Chave do estado armazenado localmente. */
const LOCAL_STORAGE_KEY = 'magic-quare-store-state'

/** Valor da célula vazia. */
export const VOID_CELL = 15

/** Tabuleiro ordenado. */
export const sortedTable = [
	[ 0,   1,  2,  3        ],
	[ 4,   5,  6,  7        ],
	[ 8,   9, 10, 11        ],
	[ 12, 13, 14, VOID_CELL ]
]

/** Estado persistido no armazenamento local, se existe. */
const initialState: State = localStorage[LOCAL_STORAGE_KEY] && JSON.parse(localStorage[LOCAL_STORAGE_KEY]) || {
	scene: 'intro',
	stage: 1,
	currentTime: 0,
	records: [],
	table: sortedTable,
	shouldRand: true,
	isSorted: true
}
// Evita que comece no meio da partida quando "reload"
if (!initialState.isSorted && initialState.scene == 'playing') {
	initialState.scene = 'intro'
}
// Normaliza quando "reload" durante um embaralhamento
if (initialState.shouldRand) {
	initialState.table = sortedTable
	initialState.isSorted = true
}

/**
 * Função redutora.
 * @param state Estado corrente.
 * @param action Ação causadora.
 */
function reducer(state = initialState, action: Payload<any>): State {
	switch (action.type) {
		// Ir para 'intro'.
		case Payload.Type.CHANGE_SCENE: {
			const scene = action.data as State['scene']

			return {
				...state, scene,
				table: (state.shouldRand) ? sortedTable : state.table,
				isSorted: state.shouldRand
			}
		}
		// Ir para próxima fase
		case Payload.Type.NEXT_STAGE: {
			return {
				...state,
				stage: state.stage + 1,
				table: sortedTable,
				shouldRand: true
			}
		}
		// Fim de jogo
		case Payload.Type.END_GAME: {
			const resign = action.data as boolean
			const record: State['records'][0] | null = (resign) ? null : {
				player: '',
				date: Date.now(),
				time: state.currentTime
			}

			return {
				...state,
				scene: record && 'records' || 'intro',
				stage: 1,
				currentTime: 0,
				table: sortedTable,
				shouldRand: true,
				records: record && [...state.records, record].sort((l, r) => l.time - r.time).slice(0, 9) || state.records
			}
		}
		// Mover peça
		case Payload.Type.MOVE_PIECE: {
			const [x, y] = action.data as [number, number]
			const table = [...state.table!.map(row => [...row])]
			let isSorted = state.isSorted

			if (table[y][x] !== VOID_CELL) {
				for (const position of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
					const [i, j] = position
					if (table[j] !== undefined && table[j][i] === VOID_CELL) {
						table[j][i] = table[y][x]
						table[y][x] = VOID_CELL

						isSorted = true

						IS_SORTED_LOOP: for (let i = 0, count = table.length; i < count; i++) {
							for (let j = 0, count = table[0].length; j < count; j++) {
								if (table[i][j] != i * count + j) {
									isSorted = false
									break IS_SORTED_LOOP
								}
							}
						}
						break
					}
				}
			}
			
			return {
				...state, table, isSorted
			}
		}
		// Finalizar embaralhamento
		case Payload.Type.END_RAND: {
			return {
				...state, shouldRand: false
			}
		}
		// Incrementar relógio
		case Payload.Type.INCREMENT_CLOCK: {
			return {
				...state,
				currentTime: state.currentTime + 1
			}
		}
		// Registrar nome do jogador
		case Payload.Type.REGISTER_NAME: {
			const { player, index } = action.data as { player: string, index: number }

			return {
				...state,
				records: state.records.map((record, i) => (i != index) ? record : { ...record, player })
			}
		}
		// Sem alteraçções
		default:
			return state
	}
}

/** Store da aplicação. */
export const store = createStore(reducer)

/** Persiste o estado ao sair. */
window.onbeforeunload = event => {
	localStorage[LOCAL_STORAGE_KEY] = JSON.stringify(store.getState())
}