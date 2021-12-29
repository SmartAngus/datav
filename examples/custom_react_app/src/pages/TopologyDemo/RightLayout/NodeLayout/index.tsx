import React, {useEffect, useMemo, useState} from "react";
import {
    Tabs,
    Radio,
    Typography,
    InputNumber,
    Form,
    Input,
    Checkbox,
    Button,
    Grid,
    Collapse
} from '@arco-design/web-react';
import ColorPicker from "../../../../components/ColorPicker";
import {useStore} from "../../../../store";
import {Pen} from '@topology/core'
import NodePosAndSize from "./widgets/NodePosAndSize";
import NodeStyle from "./widgets/NodeStyle";
import NodeTextStyle from "./widgets/NodeTextStyle";
import NodePhoto from "./widgets/NodePhoto";
import NodeIcon from "./widgets/NodeIcon";
import GenericPropertyDisplayer from "./GenericPropertyDisplayer";
import {useLocalStore} from 'mobx-react';
import EventLayout from "./EventLayout";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const Row = Grid.Row;
const Col = Grid.Col;

const CollapseItem = Collapse.Item;

const TabPane = Tabs.TabPane;

const customStyle = {
    borderRadius: 2,
    marginBottom: 24,
    padding: 0,
    border: 'none',
    overflow: 'hidden',
    backgroundColor:'#fff',
};



const NodeLayout = () => {
    const { canvasDataStore } = useStore();
    const selectedNode: Pen = canvasDataStore.selectedNodes[0]||{};
    console.log('nodelayout>>>>', selectedNode);
    console.log(canvasDataStore.canvas.data());
    return (<div>
        <Tabs key='card' type="card" overflow="dropdown" tabPosition="top">
            <TabPane key='1' title='外观'>
                <Collapse bordered={false} defaultActiveKey={['position','style']}>
                    <GenericPropertyDisplayer
                        x={()=>selectedNode.x}
                        y={()=>selectedNode.y}
                        width={()=>selectedNode.width}
                        height={()=>selectedNode.height}
                        rotate={()=>selectedNode.rotate}
                        borderRadius={()=>selectedNode.borderRadius}
                        paddingTop={()=>selectedNode.paddingTop}
                        paddingRight={()=>selectedNode.paddingRight}
                        paddingBottom={()=>selectedNode.paddingBottom}
                        paddingLeft={()=>selectedNode.paddingLeft}
                        WrapComponent={NodePosAndSize}
                    />
                    <GenericPropertyDisplayer
                        lineCap={()=>selectedNode.lineCap}
                        lineWidth={()=>selectedNode.lineWidth}
                        borderWidth={()=>selectedNode.borderWidth}
                        background={()=>selectedNode.background}
                        bkType={()=>selectedNode.bkType}
                        WrapComponent={NodeStyle}
                    />
                    <GenericPropertyDisplayer
                        textColor={()=>selectedNode.textColor}
                        text={()=>selectedNode.text}
                        WrapComponent={NodeTextStyle}
                    />
                    {/*<GenericPropertyDisplayer getData={()=>selectedNode.name} WrapComponent={NodePhoto}/>*/}
                    {/*<GenericPropertyDisplayer getData={()=>selectedNode.name} WrapComponent={NodeIcon}/>*/}
                </Collapse>
            </TabPane>
            <TabPane key='2' title='事件'>
                <EventLayout/>
            </TabPane>
            <TabPane key='3' title='动效'>
                3
            </TabPane>
            <TabPane key='4' title='数据'>
                4
            </TabPane>
            <TabPane key='5' title='结构'>
                5
            </TabPane>
        </Tabs>
    </div>)
}

export default NodeLayout;
