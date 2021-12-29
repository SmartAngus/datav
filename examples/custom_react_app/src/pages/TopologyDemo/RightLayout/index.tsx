import React, {useContext, useEffect, useMemo, useState} from "react";
import {useStore} from "@/store";
import {Button} from "@arco-design/web-react";
import {useLocalStore, useObserver, observer, observable} from 'mobx-react-lite';
import NodeLayout from "./NodeLayout";
import LineLayout from "./LineLayout";
import BackgroundLayout from "./BackgroundLayout";

export let  rightAreaStore: any;

const RightLayout = observer(()=>{
    const { commonStore, authStore, canvasDataStore } = useStore();
    rightAreaStore = useLocalStore((source) => ({
        rightType: source.selectedNodes.length===0?'background':'node',
        setRightType(type: string){
            rightAreaStore.rightType = type;
        },
        rightAreaConfig(){
            return {
                node: <NodeLayout/>,
                line: <LineLayout/>,
                background: <BackgroundLayout/>
            }
        },
        renderRightArea() {
            const temp = rightAreaStore.rightAreaConfig();
            const type = rightAreaStore.rightType;
            // @ts-ignore
            const tempElement = temp[type];
            return tempElement;
        }
    }), canvasDataStore);

    useEffect(()=>{
        console.log('------->>')
        const type = canvasDataStore.selectedNodes.length===0?'background':'node';
        rightAreaStore.setRightType(type);
    },[canvasDataStore.selectedNodes])

    useEffect(() => {
        console.log('right commonStore.isLoadingTags==',commonStore.isLoadingTags, authStore.inProgress)
    },[commonStore.isLoadingTags])
    const changeLoadingTags = ()=>{
        console.log('----->>>')
        commonStore.loadTags();
    }
    const changeNodeType = ()=>{
        rightAreaStore.setRightType('line')
    }
    return (
        <div className="aside-right">
            {rightAreaStore.renderRightArea()}
            <div>right property: {commonStore.isLoadingTags}</div>
            <Button onClick={changeLoadingTags}>点我跟新</Button>
            <Button onClick={changeNodeType}>点我跟新</Button>
            <div>{JSON.stringify(canvasDataStore.canvasData)}</div>
        </div>
    )
})

export default RightLayout;
