/**
 * node节点位置和大小
 */
import React, {useEffect} from "react";
import {Observer, observer, useLocalStore} from 'mobx-react';
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
import {useStore} from "../../../../../store";
import {Pen} from "@topology/core";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const Row = Grid.Row;
const Col = Grid.Col;

const CollapseItem = Collapse.Item;

const customStyle = {
    borderRadius: 2,
    marginBottom: 24,
    padding: 0,
    border: 'none',
    overflow: 'hidden',
    backgroundColor:'#fff',
};


const NodePosAndSize = ({x,y,width,height,rotate,borderRadius,paddingTop,paddingRight,paddingBottom,paddingLeft})=>{
    const [form] = Form.useForm();
    const { commonStore, authStore, canvasDataStore } = useStore();
    // const selectedNode: Pen = canvasDataStore.selectedNodes[0];
    // console.log('nodelayout>>>>position>>>');

    useEffect(()=>{
        form.setFieldsValue({x, y, width, height,rotate,paddingTop,paddingRight,paddingBottom,paddingLeft})
    },[x, y, width, height,rotate,borderRadius,paddingTop,paddingRight,paddingBottom,paddingLeft])
    const handleNodePropertyChange = (value, values)=>{
        console.log(value)
        canvasDataStore.updateNodeProperty(value);
    }
    return (
        <CollapseItem header='位置和大小' name='position' contentStyle={customStyle}>
            <Form
                form={form}
                layout="vertical"
                onChange={handleNodePropertyChange}
            >
                <Row className='grid-gutter-demo' style={{padding: 10}} gutter={24}>
                    <Col span={12}>
                        <FormItem label='位置X' field='x'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='位置Y' field='y'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='宽X' field='width'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='高Y' field='height'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='圆角' field='borderRadius'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='旋转' field='rotate'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='内边距（上）' field='paddingTop'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='内边距（右）' field='paddingRight'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='内边距（下）' field='paddingBottom'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='内边距（左）' field='paddingLeft'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </CollapseItem>
    )
}

export default NodePosAndSize;
