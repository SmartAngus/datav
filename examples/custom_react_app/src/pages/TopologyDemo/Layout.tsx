import React, { useEffect } from 'react';
import {Topology} from '@topology/core';
import {useStore} from "@/store";


const EditorLayout = () => {
    const { canvasDataStore } = useStore();
    useEffect(() => {
        const canvasOptions = {
            rotateCursor: '/rotate.cur',
            grid: true,
            ruleColor: '#2db7f5',
        };
        const canvas = new Topology('topology-canvas', canvasOptions)
        canvas.on('*', onMessage);
        canvasDataStore.setCanvas(canvas);
        setTimeout(()=>{
            canvas.resize();
        })
    },[])

    const onMessage = (e:string,data:any)=>{
        console.log(e,data);
        switch (e) {
            case 'active':
                canvasDataStore.setActiveNode(data);
                break;
            case 'translatePens':
                canvasDataStore.updateNodePropertyByTrans(data);
                break;
            case 'inactive':
                //差集
                const d = canvasDataStore.selectedNodes.filter(function(n){
                    const t = data.filter(function (node){
                        return node.id===n.id;
                    })
                    if(t.length===1){
                        return false;
                    }
                    return true;
                })
                canvasDataStore.setActiveNode(d);
                break;
            case 'resizePens':
                canvasDataStore.updateNodePropertyByTrans(data);
                break;
            case 'rotatePens':
                canvasDataStore.updateNodePropertyByTrans(data);
                break;
        }

    }

    return (
        <div className='main' >
            <div className="topology" id="topology-canvas" style={{height: 800}}></div>
        </div>
    );
};

export default EditorLayout;
