import React, {useContext, useEffect, useMemo, useState} from 'react';
import HeaderLayout from "./Header";
import EditorLayout from "./Layout";
import LeftIcons from "./LeftLayout/LeftIcons";
import {useLocalStore, useObserver}  from 'mobx-react-lite';
import './style.less';
import RightLayout from "./RightLayout";
import { Layout, Menu, Breadcrumb, Button, Message, } from '@arco-design/web-react';
import "@arco-design/web-react/dist/css/arco.css";
import LeftMenu from "./LeftLayout/LeftMenu";
import CanvasNodes from "./LeftLayout/CanvasNodes";

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

const Sider = Layout.Sider;
const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;

function TopologyDemo({history}) {
    const [canvasData, setCanvasData]=useState({});
    const menuStore = useLocalStore(() => ({
        menuKey: ['a'],
        menuConfig:{
            a: <LeftIcons/>,
            b: <CanvasNodes/>,
        },
        setMenuKey(key: string[]){
            menuStore.menuKey = key;
        },
        renderMenuConfig(){
            // @ts-ignore
            const menuConfigElement = menuStore.menuConfig[menuStore.menuKey];
            return menuConfigElement
        },
    }));
    useEffect(()=>{
        setCanvasData({
            updateCanvasData:(node:any)=>{
                console.log('add nodes..1.')
            }
        })
    },[])

    const renderMenuConfig = useMemo(()=>{
        return {
            a: <LeftIcons/>,
            b: <CanvasNodes/>,
        }
    },[menuStore.menuKey])

    return useObserver(()=>{
        return (
            <Layout style={{display:'flex',flexDirection:'row'}}>
                <Layout style={{width: '100%'}}>
                    <Header style={{ height: '60px',borderBottom:'1px solid #ccc' }}>
                        <HeaderLayout history={history} />
                    </Header>
                    <Layout style={{ height: '800px'}}>
                        <Sider style={{width: 60}}>
                            <LeftMenu menuStore={menuStore}/>
                        </Sider>
                        <Sider style={{ padding: 10 }}>
                            {menuStore.renderMenuConfig()}
                        </Sider>
                        <Content style={{height: 800}}>
                            <EditorLayout/>
                        </Content>
                        <Sider  style={{ height: '800px', width: 260 }}>
                            <RightLayout/>
                            <div>{menuStore.menuKey}</div>
                        </Sider>
                    </Layout>
                </Layout>
            </Layout>
        )
    })
}

export default TopologyDemo
