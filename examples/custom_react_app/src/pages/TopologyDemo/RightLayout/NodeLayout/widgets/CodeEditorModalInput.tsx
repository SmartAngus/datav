import React from "react";
import {UnControlled as CodeMirror} from "react-codemirror2";
import {Button, Input, Modal, Space} from "@arco-design/web-react";
import {IconPlus} from "@arco-design/web-react/icon";

const TextArea = Input.TextArea;

interface IProps{
    onChange?: any;
    value?:string;
}

const CodeEditorModalInput:React.FC<IProps> = (props)=>{
    const [visible, setVisible] = React.useState(false);

    return (
        <>
            <TextArea
                placeholder='js代码'
                value={props.value}
                style={{ minHeight: 64 }}
                autoSize
            />
            <Space direction="horizontal"/>
            <Button type='primary' style={{margin: '10px 0', width: '100%'}} onClick={() => setVisible(true)} icon={<IconPlus />}>新窗口打开</Button>
            <Modal
                title='Modal Title'
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
                autoFocus={false}
                focusLock={true}
                style={{padding:0,width:'80%',margin:0}}
                wrapStyle={{padding:0,margin:0}}
            >
                <CodeMirror
                    value={props.value}
                    options={{
                        mode: 'javascript',
                        theme: 'material',
                        lineNumbers: true
                    }}
                    onChange={(editor, data, value) => {
                    }}
                />
            </Modal>
        </>
    )
}

export default CodeEditorModalInput;
