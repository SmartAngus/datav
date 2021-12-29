import React, {useEffect} from "react";
import {Tabs, Button, Grid, Collapse,Form, Input, Checkbox,Select,Modal } from '@arco-design/web-react';
import { IconPlus, IconDelete } from '@arco-design/web-react/icon';

import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import CodeEditorModalInput from "./widgets/CodeEditorModalInput";

export enum EventAction {
    Link,
    SetProps,
    StartAnimate,
    PauseAnimate,
    StopAnimate,
    Function,
    WindowFn,
    Emit,
}

const TabPane = Tabs.TabPane;
const Row = Grid.Row;
const Col = Grid.Col;
const CollapseItem = Collapse.Item;
const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

const eventTypes = [
    {key: '1', value:'单击（鼠标按下）'},
    {key: '2', value:'双击'},
    {key: '3', value:'Websocket'},
    {key: '4', value:'MQTT'},
    {key: '5', value:'鼠标移入'},
    {key: '6', value:'鼠标移出'},
    {key: '7', value:'鼠标弹起'},
];

const eventActions = [
    {key:EventAction.Link,value:'打开链接'},
    {key:EventAction.StartAnimate,value:'执行动画'},
    {key:EventAction.PauseAnimate,value:'暂停动画'},
    {key:EventAction.StopAnimate,value:'停止动画'},
    {key:EventAction.Function,value:'执行javascript'},
    {key:EventAction.WindowFn,value:'执行window函数'},
    {key:EventAction.Emit,value:'自定义消息'},

];

const customStyle = {
    borderRadius: 2,
    marginBottom: 12,
    border: 'none',
    overflow: 'hidden',
    padding: 0,
};

const contentStyle={
    padding: '10px 0',
    backgroundColor: '#fff',
}

const formItemLayout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 14,
    },
};

const EventLayout = ()=>{
    const [form] = Form.useForm();
    useEffect(()=>{
        form.setFieldsValue({'jscode': 'console.log(undefined);'});
    },[])
    return (
        <div style={{width:'100%'}}>
            <Tabs type='rounded' size='small'>
                <TabPane key='1' title='自定义事件' >
                    <Row className='grid-gutter-demo' style={{padding: 10}} gutter={24}>
                        <Col span={24}>
                            <Button type='primary' style={{width: '100%'}} icon={<IconPlus />}>添加事件</Button>
                        </Col>
                    </Row>
                    <Collapse bordered={false} defaultActiveKey={['1', '2']} expandIconPosition='right' style={{ maxWidth: 1180,padding:0, }}>
                        <CollapseItem contentStyle={contentStyle} style={customStyle} header='事件1' name='1' extra={<IconDelete style={{color:'red'}} />}>
                            <Form layout='horizontal' {...formItemLayout} form={form}>
                                <FormItem label='事件类型'>
                                    <Select
                                        placeholder='事件类型'
                                        allowClear
                                    >
                                        {eventTypes.map((option, index) => (
                                            <Option key={option.key} disabled={index === 3} value={option.key}>
                                                {option.value}
                                            </Option>
                                        ))}
                                    </Select>
                                </FormItem>
                                <FormItem label='事件行为'>
                                    <Select
                                        placeholder='事件行为'
                                        allowClear
                                    >
                                        {eventActions.map((option, index) => (
                                            <Option key={option.key} disabled={index === 3} value={option.key}>
                                                {option.value}
                                            </Option>
                                        ))}
                                    </Select>
                                </FormItem>
                                <FormItem label='链接地址'>
                                    <Input placeholder='ss' />
                                </FormItem>
                                <FormItem label='打开方式'>
                                    <Input placeholder='ss' />
                                </FormItem>
                                <FormItem label='javascript' field='jscode'>
                                    <CodeEditorModalInput/>
                                </FormItem>
                            </Form>
                        </CollapseItem>
                        <CollapseItem contentStyle={contentStyle}  style={customStyle} header='事件2' name='2' extra={<IconDelete />}>
                            ee
                        </CollapseItem>
                    </Collapse>
                </TabPane>
                <TabPane key='2' title='条件触发器'>
                    assa
                </TabPane>
            </Tabs>
        </div>
    )
}

export default EventLayout;
