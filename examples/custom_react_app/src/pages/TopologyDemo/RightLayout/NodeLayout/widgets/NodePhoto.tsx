/**
 * node节点样式
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


const NodePhoto = ({node})=>{
    const [form] = Form.useForm();
    const { commonStore, authStore, canvasDataStore } = useStore();
    const selectedNode: Pen = canvasDataStore.selectedNodes[0];

    return (
        <Observer>
            {()=>(
                <CollapseItem header='图片' name='photo' contentStyle={customStyle}>
                    <Form
                        layout='vertical'
                    >
                        <Row className='grid-gutter-demo' style={{padding: 10}} gutter={24}>
                            <Col span={24}>
                                <FormItem label='图片选择' field='username'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem label='图片地址'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='宽度' field='username'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='高度'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='保存比例'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='对齐方式'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label='背景颜色'>
                                    <InputNumber
                                        defaultValue={500}
                                        style={{width: '100%'}}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </CollapseItem>
            )}
        </Observer>
    )
}

export default NodePhoto;
