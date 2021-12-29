import React from "react";
import LeftIcons from "./LeftIcons";
import {Layout} from "@arco-design/web-react";

const Sider = Layout.Sider;

const LeftLayout = ()=>{
    return (
        <Layout style={{width: 300}}>
            <Sider style={{width: 75}}>
                <LeftIcons/>
            </Sider>
            <Sider style={{ width: '206px', marginLeft: '1px' }}>Sider</Sider>
            </Layout>
    )
}

export default LeftLayout;
