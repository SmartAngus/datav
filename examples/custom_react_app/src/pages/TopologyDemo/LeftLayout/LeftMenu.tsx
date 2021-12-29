import React from "react";
import { Menu } from '@arco-design/web-react';
import { IconApps, IconSafe, IconBulb, IconRobot, IconFire, IconBug, IconBook } from '@arco-design/web-react/icon';
import './leftMenu.less'

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuGroup = Menu.ItemGroup;

const MENU_ITEMS = [
    {key: 'a',type:'item', name: '菜单1', icon: <IconApps fontSize={24} />,},
    {key: 'b',type:'item', name: '菜单2', icon: <IconSafe fontSize={24} />,},
    {key: 'c',type:'item', name: '菜单3', icon: <IconBulb fontSize={24} />,},
    {key: 'd',type:'item', name: '菜单4', icon: <IconApps fontSize={24} />,},
    {
        key: 'e',type:'group', name: '组1', icon: <IconRobot fontSize={24} />,
        children: [
            {key: 'f',type:'item', name: '菜单5', icon: <IconFire fontSize={24} />,},
            {key: 'g',type:'item', name: '菜单6', icon: <IconBug fontSize={24} />,},
            {key: 'h',type:'item', name: '菜单7', icon: <IconBook fontSize={24} />,},
        ]
    },
];

const LeftMenu = ({menuStore})=>{
    const onClickMenuItem = (key: string, event: any, keyPath: string[])=>{
        console.log(key,event,keyPath)
        menuStore.setMenuKey(keyPath);
    }
    return (
        <div
            className='menu-demo-round'
            style={{
                height: 600,
            }}
        >
            <Menu style={{ width: 60 }} mode='pop' defaultSelectedKeys={menuStore.menuKey} onClickMenuItem={onClickMenuItem} hasCollapseButton={false} theme="light" collapse={true}>
                {
                    MENU_ITEMS.map(menu=>{
                        if(menu.type === 'item'){
                            return (
                                <MenuItem key={menu.key}>
                                    {menu.icon}
                                    {menu.name}
                                </MenuItem>
                            )
                        }else if(menu.type === 'group'){
                            return (
                                <MenuGroup title={menu.name} key={menu.key}>
                                    {
                                        (menu.children||[]).map(child=>{
                                            return (
                                                <MenuItem key={child.key}>
                                                    {child.icon}
                                                    {child.name}
                                                </MenuItem>
                                            )
                                        })
                                    }
                                </MenuGroup>
                            )
                        }
                    })
                }
            </Menu>
        </div>
    )
}

export default LeftMenu;
