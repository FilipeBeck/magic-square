import React from 'react'

export function Clock(props: Clock.Props): JSX.Element {
	// Em posições "vazias" na tela de recordes
	if (props.time == Infinity) {
		return <div className="clock">00:00.0</div>
	}
	// Tempo em milisegundos
	let ms = props.time * props.resolution

	const min = Math.floor(ms / 60000)
	ms = ms % 60000
	const seg = Math.floor(ms / 1000)
	ms = ms % 1000
	const dec = Math.floor(ms / 100)

	return <div className="clock">{ min < 10 && '0' }{ min }:{ seg < 10 && '0' }{ seg }:{ dec }</div>
}
/* Namespace de `Clock` */
export namespace Clock {
	/**
	 * Atributos.
	 */
	export interface Props {
		/** Tempo. */
		time: number
		/** Quantos milisegundos cada unidade de tempo possui (ms = t * r). */
		resolution: number
	}
}

/**
 * Barra exibindo o progresso da tarefa de enbaralhamento.
 */
export function RandTimerNotificator(props: RandTimerNotificator.Props): JSX.Element {
	return <div className={ `rand-timer-notificator ${props.step}` } style={{
		'--data-time': `${props.time}ms`
	} as any}></div>
}
/* Namespace de componente `RandTimerNotificator` */
export namespace RandTimerNotificator {
	/**
	 * Atributos.
	 */
	export interface Props {
		/** Estágio. */
		step: 'delay' | 'randomizing' | 'playing'
		/** Tempo de preenchimento em milisegundos. */
		time: number
	}
}