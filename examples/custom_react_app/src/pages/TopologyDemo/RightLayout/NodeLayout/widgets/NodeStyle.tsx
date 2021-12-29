/**
 * node节点样式
 */
import React, {useEffect} from "react";
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
    Collapse,
    Select,
} from '@arco-design/web-react';
import {useStore} from "../../../../../store";
import ColorPicker from "../../../../../components/ColorPicker";


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


const NodeStyle = ({lineCap,lineWidth,borderWidth,background,bkType})=>{

    console.log('nodelayout>>>>style>>>');
    const [form] = Form.useForm();
    const { commonStore, authStore, canvasDataStore } = useStore();
    // const selectedNode: Pen = canvasDataStore.selectedNodes[0];
    // console.log('nodelayout>>>>position>>>');

    useEffect(()=>{
        form.setFieldsValue({lineCap,lineWidth,borderWidth,background,bkType})
    },[lineCap,lineWidth,borderWidth,background,bkType])
    const handleNodePropertyChange = (value, values)=>{
        console.log(value)
        canvasDataStore.updateNodeProperty(value);
    }

    return (
        <CollapseItem header='样式' name='style' contentStyle={customStyle}>
            <Form layout='vertical' form={form} onChange={handleNodePropertyChange}>
                <Row className='grid-gutter-demo' style={{padding: 10}} gutter={24}>
                    <Col span={12}>
                        <FormItem label='线条样式' field='username'>
                            <InputNumber
                                defaultValue={500}
                                style={{width: '100%'}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='末端样式' field='lineCap'>
                            <Select
                                placeholder='默认'
                                options={[
                                    { label: '默认', value: 'butt' },
                                    { label: '圆形', value: 'round' },
                                    { label: '方形', value: 'square' },
                                ]}
                                allowClear
                            />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='线条渐变' field='username'>
                            <InputNumber
                                defaultValue={500}
                                style={{width: '100%'}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='线条颜色'>
                            <InputNumber
                                defaultValue={500}
                                style={{width: '100%'}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='线条宽度' field='borderWidth'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='线条宽度2' field='lineWidth'>
                            <InputNumber style={{width: '100%'}}/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='背景' field='bkType'>
                            <Select
                                placeholder='纯色背景'
                                options={[
                                    { label: '纯色背景', value: 0 },
                                    { label: '线性渐变', value: 1 },
                                    { label: '径向渐变', value: 2 },
                                ]}
                                allowClear
                            />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='背景颜色' field='background'>
                            <ColorPicker/>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='透明度'>
                            <InputNumber
                                defaultValue={500}
                                style={{width: '100%'}}
                            />
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </CollapseItem>
    )
}

export default NodeStyle;
