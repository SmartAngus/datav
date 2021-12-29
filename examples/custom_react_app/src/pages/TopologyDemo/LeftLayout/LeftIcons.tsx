import React, { useCallback,useContext } from 'react';
import { icons } from '../data';
import { Grid, Divider } from '@arco-design/web-react';

const Row = Grid.Row;
const Col = Grid.Col;

const LeftIcons = () => {

    const onDragStart = useCallback((e, data, callback) => {
        e.dataTransfer.setData('Topology', JSON.stringify(data));
        callback&&callback(data);
    }, []);


    return (
        <div >
            <Row className='grid-gutter-demo' gutter={[24, 12]}>
                { icons.map((icon) => {
                    const { key, title, data } = icon;
                    return (
                        <Col span={8}
                            draggable
                            key = { key }
                            title = { title }
                            onDragStart = { (e) => onDragStart(e, data, undefined) }
                        >
                            <i className = { `iconfont icon-${ key }` }/>
                            <span>{key}</span>
                        </Col>
                    );
                }) }
            </Row>
        </div>
    );
};

export default LeftIcons;
