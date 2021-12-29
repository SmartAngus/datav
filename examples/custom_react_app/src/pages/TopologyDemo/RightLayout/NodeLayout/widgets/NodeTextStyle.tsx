/**
 * node节点文本
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
import ColorPicker from "../../../../../components/ColorPicker";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const Row = Grid.Row;
const Col = Grid.Col;

const CollapseItem = Collapse.Item;

const TextArea = Input.TextArea;

const customStyle = {
    borderRadius: 2,
    marginBottom: 24,
    padding: 0,
    border: 'none',
    overflow: 'hidden',
    backgroundColor:'#fff',
};


const NodeTextStyle = ({textColor,fontSize,text})=>{
    const [form] = Form.useForm();
    const { commonStore, authStore, canvasDataStore } = useStore();
    const selectedNode: Pen = canvasDataStore.selectedNodes[0];
    console.log('nodelayout>>>>TextStyle>>>', selectedNode, canvasDataStore.canvas.data());
    useEffect(()=>{
        form.setFieldsValue({textColor,fontSize,text})
    },[textColor,fontSize,text])
    const handleNodePropertyChange = (value, values)=>{
        console.log(value,values);
        canvasDataStore.updateNodeProperty(value);
    }
    return (
        <Observer>
            {()=>(
                <CollapseItem header='文字' name='text' contentStyle={customStyle}>
                    <Form layout='vertical' onChange={handleNodePropertyChange} form={form}>
                        <Row className='grid-gutter-demo' style={{padding: 10}} gutter={24}>
                            <Col span={12}>
                                <FormItem label='字体' field='username'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='字体大小' field='fontSize'>
                                    <InputNumber style={{width: '100%'}}/>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='文字颜色' field='textColor'>
                                    <ColorPicker/>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='文字背景'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='倾斜'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='加粗'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='水平对齐'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='垂直对齐'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='行高'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='最大行数'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='换行'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='水平偏移'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='垂直偏移'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem label='文本内容' field='text'>
                                    <TextArea placeholder='输入文本内容' style={{ minHeight: 64, width: '100%' }}/>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </CollapseItem>
            )}
        </Observer>
    )
}

export default NodeTextStyle;
