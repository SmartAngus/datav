import React from "react";
import ReactDOM from "react-dom";
import { StoreProvider } from './store'
import App from "./App";
import './App.css';

ReactDOM.render(
    <StoreProvider><App/></StoreProvider>,
    document.getElementById("root")
);
