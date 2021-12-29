import {observable, action, makeObservable} from 'mobx';

export class CanvasDataStore{
    @observable canvas = (window as any).topology;
    @observable canvasData = {};
    @observable selectedNodes: any[] = [];
    constructor() {
        makeObservable(this);
    }
    @action loadCanvasData (data: any){
        this.canvasData = data;
    }
    @action setCanvas(instance: any){
        if (!instance) return;
        this.canvas = instance;
        console.log(instance.data())
    }
    @action setActiveNode(nodes: any[]){
        this.selectedNodes = nodes;
    }
    @action getSelectedNodes(){
        return this.selectedNodes;
    }
    @action updateNodeProperty(value){
        for (let o in value){
            this.selectedNodes.forEach((node, index)=>{
                this.selectedNodes[index][o]=value[o];
                this.canvas.setValue({
                    id: node.id,
                    ...value,
                });
            })
        }
    }
    @action updateNodePropertyByTrans(nodes){
        this.selectedNodes.forEach((node, index)=>{
            this.selectedNodes[index].x=nodes[index].x;
            this.selectedNodes[index].y=nodes[index].y;
            this.selectedNodes[index].width=nodes[index].width;
            this.selectedNodes[index].height=nodes[index].height;
            this.selectedNodes[index].rotate=nodes[index].rotate;
            this.canvas.setValue({
                id: node.id,
                x: nodes[index].x,
                y: nodes[index].y,
                width: nodes[index].width,
                height: nodes[index].height,
                rotate: nodes[index].rotate,
            });
        })
    }

}

export default new CanvasDataStore();
