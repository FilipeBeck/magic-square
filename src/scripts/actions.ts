import { Payload, State as StoreState } from './store';

/**
 * Muda a cena.
 * @param scene Próxima cena.
 */
export function changeScene(scene: StoreState['scene']): Payload<StoreState['scene']> {
	return {
		type: Payload.Type.CHANGE_SCENE,
		data: scene
	}
}

/**
 * Avança para o próximo estágio.
 */
export function advanceStage(): Payload<void> {
	return {
		type: Payload.Type.NEXT_STAGE,
		data: undefined
	}
}

/**
 * Finaliza o jogo.
 * @param resign Determina se foi desistência ou se completou o jogo.
 */
export function finishGame(resign: boolean): Payload<boolean> {
	return {
		type: Payload.Type.END_GAME,
		data: resign
	}
}

/**
 * Move a peça especificada.
 * @param position Posição da peça a ser movida.
 */
export function movePiece(position: [number, number]): Payload<[number, number]> {
	return {
		type: Payload.Type.MOVE_PIECE,
		data: position
	}
}

/**
 * Terminar embaralhamento.
 */
export function endRand(): Payload<void> {
	return {
		type: Payload.Type.END_RAND,
		data: undefined
	}
}

/**
 * Incrementa o relógio.
 */
export function incrementClock(): Payload<void> {
	return {
		type: Payload.Type.INCREMENT_CLOCK,
		data: undefined
	}
}

export function registerName(player: string, index: number): Payload<{ player: string, index: number }> {
	return {
		type: Payload.Type.REGISTER_NAME,
		data: { player, index }
	}
}