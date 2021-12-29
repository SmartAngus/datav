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
    Collapse
} from '@arco-design/web-react';
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


const NodeIcon = ({name})=>{
    console.log('nodelayout>>>>Icon>>>', name);
    return (
        <CollapseItem header='图标' name='icon' contentStyle={customStyle}>
            <Form
                layout='vertical'
            >
                <Row className='grid-gutter-demo' style={{padding: 10}} gutter={24}>
                    <Col span={24}>
                        <FormItem label='字体图标' field='username'>
                            <InputNumber
                                defaultValue={500}
                                style={{width: '100%'}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='图标大小'>
                            <InputNumber
                                defaultValue={500}
                                style={{width: '100%'}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem label='颜色' field='username'>
                            <ColorPicker/>
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
                </Row>
            </Form>
        </CollapseItem>
    )
}

export default NodeIcon;
