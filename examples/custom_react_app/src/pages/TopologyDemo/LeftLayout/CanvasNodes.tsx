import React from "react";
import { Grid } from '@arco-design/web-react';
import {useLocalStore} from 'mobx-react';
import {useStore} from "../../../store";

const Row = Grid.Row;
const Col = Grid.Col;

const CanvasNodes = ()=>{
    const { canvasDataStore } = useStore();
    console.log('>>>>>>',canvasDataStore.canvas.data().pens);
    const dataStore = useLocalStore(source=>({
        data: source.data().pens,
    }), canvasDataStore.canvas)

    const handleSelectedNode = (node)=>{
        // canvasDataStore.setActiveNode([node])
        // console.log(node,canvasDataStore.canvas);
        // canvasDataStore.canvas.active([node])
        // canvasDataStore.canvas.inactive()
        // canvasDataStore.canvas.render()
    }

    return (
        <div style={{ width: '100%' }}>
            {(dataStore.data||[]).map((item,index)=>{
                return (
                    <Row className='grid-demo' key={index} onClick={()=>handleSelectedNode(item)}>
                        <Col xs={{ span: 5, offset: 1 }} lg={{ span: 6, offset: 2 }}>
                            icon
                        </Col>
                        <Col xs={{ span: 11, offset: 1 }} lg={{ span: 14, offset: 2 }}>
                            {item.name}
                        </Col>
                    </Row>
                )
            })}
        </div>
    )
}

export default CanvasNodes;
