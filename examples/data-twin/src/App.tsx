import React,{useEffect} from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import config from './config'
import { selectors, actions } from './store/exampleReducer'
import { Topology, registerNode } from '@topology/core';
import { register as registerChart } from '@topology/chart-diagram';
import {
  activityFinal,
  activityFinalIconRect,
  activityFinalTextRect
} from '@topology/activity-diagram'
import data from './data.json'
export let canvas: any;
function App() {
  const counter = useSelector(selectors.selectCounter)
  const dispatch = useDispatch()
  useEffect(() => {
    const canvasOptions = {
      rotateCursor: '/rotate.cur',
      locked: 2,
      grid: true,
      ruleColor: '#2db7f5',
    };
    
    canvasRegister()
    canvas = new Topology('topology-canvas', canvasOptions)
    canvas.open(data)

  },[])
  const canvasRegister = () => {
    // activity
    registerNode(
      'activityFinal',
      activityFinal,
      undefined,
      activityFinalIconRect,
      activityFinalTextRect
    );
    registerChart();
  }
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Switch>
            <Route exact path="/">
              <p>qte create-react-app-template</p>
              <p>Config string: {config.EXAMPLE}</p>
              <p>Counter: {counter}</p>
              <button onClick={() => dispatch(actions.decreaseAction())}>
                -
              </button>
              <button onClick={() => dispatch(actions.increaseAction())}>
                +
              </button>
            </Route>
            <Route path="*">404</Route>
          </Switch>
        </Router>
        <div id="topology-canvas">图像</div>
      </header>
    </div>
  )
}

export default App
