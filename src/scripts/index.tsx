import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import { store } from './store'
import { Index } from './containers'

ReactDOM.render(
	<Provider store={store}>
		<Index/>
	</Provider>,
	document.getElementById('root')
)