import React, {useEffect} from "react";
import {Topology,Options} from "@topology/core";


const Preview = ({history})=>{
    useEffect(()=>{
        console.log(history.location.state.data)
    },[history.location.state.data])
    useEffect(() => {
        const canvasOptions: Options = {
            rotateCursor: '/rotate.cur',
            grid: true,
            ruleColor: '#2db7f5',
            disableTranslate:true,
        };
        const canvas = new Topology('topology-canvas-preview', canvasOptions)
        canvas.open(history.location.state.data)
        canvas.setOptions(canvasOptions);
    },[history.location.state.data])
    return (
        <div>
            <div id="topology-canvas-preview" style={{height:'100vh'}}></div>
        </div>
    )
}

export default Preview;
