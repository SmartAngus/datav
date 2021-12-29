import React, {useCallback, useEffect, useRef} from 'react';
import {useStore} from "../../store";
import { useObserver, observer } from 'mobx-react-lite';

const HeaderLayout = observer(({history}) => {
    const penBtn = useRef(null);
    const pencilBtn = useRef(null);
    const magnifierBtn = useRef(null);
    const minimapBtn = useRef(null);
    const { commonStore, authStore, canvasDataStore } = useStore();

    console.log('header commonStore.isLoadingTags==',commonStore.isLoadingTags, authStore.inProgress, canvasDataStore.selectedNodes[0]?.id)


    // useEffect(() => {
    //     console.log('header commonStore.isLoadingTags==',commonStore.isLoadingTags, authStore.inProgress, canvasDataStore.selectedNodes)
    // },[commonStore.isLoadingTags])

    const onCreate = useCallback(() => {
        canvasDataStore.canvas.open();
    }, []);

    const onOpen = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                canvasDataStore.loadCanvasData(json);
                canvasDataStore.canvas.open(json);
            } catch {
                console.log('读取文件失败，请检查数据格式');
            }
        };
        reader.readAsText(file);
    }, []);


    const onSave = useCallback(() => {
        const filename = '测试数据.json';
        const data = canvasDataStore.canvas.data();
        const json = JSON.stringify(data, undefined, 4);
        const blob = new Blob([ json ], { type: 'text/json' });
        const a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        a.click();
    }, []);

    const onTogglePen = useCallback(() => {
        if (penBtn.current.className === 'active') {
            penBtn.current.className = '';
            canvasDataStore.canvas.finishDrawLine();
        } else {
            penBtn.current.className = 'active';
            canvasDataStore.canvas.drawLine();
        }
    }, []);

    const onTogglePencil = useCallback(() => {
        if (penBtn.current.className === 'active') {
            return;
        }
        if (pencilBtn.current.className === 'active') {
            pencilBtn.current.className = '';
            canvasDataStore.canvas.finishPencil();
        } else {
            pencilBtn.current.className = 'active';
            canvasDataStore.canvas.drawingPencil();
        }
    }, []);

    const onToggleMagnifier = useCallback(() => {
        if (magnifierBtn.current.className === 'active') {
            magnifierBtn.current.className = '';
            canvasDataStore.canvas.hideMagnifier();
        } else {
            magnifierBtn.current.className = 'active';
            canvasDataStore.canvas.showMagnifier();
        }
    }, []);

    const onToggleMinimap = useCallback(() => {
        if (minimapBtn.current.className === 'active') {
            minimapBtn.current.className = '';
            canvasDataStore.canvas.hideMap();
        } else {
            minimapBtn.current.className = 'active';
            canvasDataStore.canvas.showMap();
        }
    }, []);

    const onAddNode = useCallback(()=>{
        const pen = {
            name: 'rectangle',
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            fillStyle: 'blue',
            shadowColor: 'black',
            shadowBlur: 20,
            shadowOffsetX: 10,
            shadowOffsetY: 5,
            text: 'zhe shi yi chang duan wen zi.',
            textWidth: 20,
            textColor: 'green',
        };
        const line = {
            type: 1,
            name: 'line',
            lineName: 'curve',
            anchors: [
                { x: 0.1, y: 0.1 },
                { x: 0.1, y: 0.5 },
                { x: 1, y: 1 },
            ],
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            fromArrow: 'triangleSolid',
        };
        const ifr = {
            name: ' iframe',
            x: 200,
            y: 200,
            width: 100,
            height: 100,
            iframe: 'http://topology.le5le.com/',
        };
        canvasDataStore.canvas.addPen(ifr);
        canvasDataStore.canvas.inactive();

        canvasDataStore.canvas.addPen(line);

        canvasDataStore.canvas.addPen(pen);
    },[])

    const onHelp = useCallback(() => {
        window.open('https://www.yuque.com/alsmile/topology/cucep0');
    }, []);

    const onLayout = useCallback(() => {
        canvasDataStore.canvas.layout();
    }, []);

    const onClear = useCallback(() => {
        canvasDataStore.canvas.finishPencil();
        canvasDataStore.canvas.finishDrawLine();
    }, []);

    const onPreview = useCallback(()=>{
        // canvasDataStore.loadCanvasData(canvasDataStore.canvas.data());
        // window.open('/editor/preview');
        console.log('history....', history);
        console.log('canvasDataStore.canvas.data()', canvasDataStore.canvas.data());
        let reader = new FileReader();
        const result = new Blob([JSON.stringify(canvasDataStore.canvas.data())], { type: 'text/plain;charset=utf-8' });
        reader.readAsText(result, 'text/plain;charset=utf-8');
        reader.onload = (e) => {
            history.push({ pathname: '/editor/preview', state: { data: JSON.parse(reader.result) } });
        }
    },[])

    const onKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'b':
            case 'B':
                if (canvasDataStore.canvas.canvas.pencil) {
                    pencilBtn.current.className = 'active';
                } else {
                    pencilBtn.current.className = '';
                }
                break;
            case 'v':
            case 'V':
                if (e.ctrlKey || e.metaKey) {
                    return;
                } else {
                    if (canvasDataStore.canvas.canvas.drawingLineName) {
                        penBtn.current.className = 'active';
                    } else {
                        penBtn.current.className = '';
                    }
                }
                break;
            case 'm':
            case 'M':
                if (canvasDataStore.canvas.canvas.magnifier) {
                    minimapBtn.current.className = 'active';
                } else {
                    minimapBtn.current.className = '';
                }
                break;
            case 'Escape':
                penBtn.current.className = '';
                pencilBtn.current.className = '';
                magnifierBtn.current.className = '';
                break;
            default:
                break;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        }
    }, []);

    return (
        <div className="header" >
            <div className="button-group" >
                <button onClick={onAddNode}>{commonStore.isLoadingTags}</button>
                <button id="create" onClick = { onCreate } >新建文件</button>
                <button id="open" >
                    打开文件
                    <input id="open-input" type="file" onChange = { onOpen } />
                </button>
                <button id="save" onClick = { onSave } >保存</button>
                <button id="pen" onClick = { onTogglePen } ref = { penBtn } >钢笔</button>
                <button id="pencil" onClick = { onTogglePencil } ref = { pencilBtn } >铅笔</button>
                <button id="magnifier" onClick = { onToggleMagnifier } ref = { magnifierBtn } >放大镜</button>
                <button id="minimap" onClick = { onToggleMinimap } ref = { minimapBtn } >缩略图</button>
                <button id="help" onClick = { onHelp } >帮助</button>
                <button id="help" onClick = { onLayout } >排版</button>
                <button id="help" onClick = { onClear } >清楚画布</button>
                <button id="help" onClick = { onPreview } >预览</button>
            </div>
        </div>
    );
});

export default HeaderLayout;
