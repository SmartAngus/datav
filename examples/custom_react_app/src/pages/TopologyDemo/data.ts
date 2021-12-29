import {EventAction, Where} from "@topology/core";

export const icons = [
    {
        key: 'text',
        title: '矩形',
        data: {
            name: 'text',
            text: '文本',
            width: 100,
            height: 30
        }
    },
    {
        key: 'cloud',
        title: '云',
        data: {
            name: 'cloud',
            text: '云',
            width: 100,
            height: 100
        }
    },
    {
        key: 'cube',
        title: 'cube',
        data: {
            name: 'cube',
            text: 'cube',
            width: 100,
            height: 100
        }
    },
    {
        key: 'diamond',
        title: '菱形',
        data: {
            name: 'diamond',
            text: '菱形',
            width: 100,
            height: 100
        }
    },
    {
        key: 'triangle',
        title: '三角形',
        data: {
            name: 'triangle',
            text: '三角形',
            width: 100,
            height: 100
        }
    },
    {
        key: 'mindLine',
        title: '直线',
        data: {
            name: 'mindLine',
            text: '',
            width: 100,
            height: 0
        }
    },
    {
        key: 'mindNode',
        title: '直线',
        data: {
            name: 'mindNode',
            text: '',
            width: 100,
            height: 0
        }
    },
    {
        key: 'leftArrow',
        title: '左箭头',
        data: {
            name: 'leftArrow',
            text: '左箭头',
            width: 100,
            height: 100
        }
    },
    {
        key: 'rightArrow',
        title: '右箭头',
        data: {
            name: 'rightArrow',
            text: '右箭头',
            width: 100,
            height: 100
        }
    },
    {
        key: 'twowayArrow',
        title: '两端箭头',
        data: {
            name: 'twowayArrow',
            text: '两端箭头',
            width: 100,
            height: 50
        }
    },
    {
        key: 'message',
        title: '消息',
        data: {
            name: 'message',
            text: '消息',
            width: 100,
            height: 50
        }
    },
    {
        key: 'rect',
        title: '矩形',
        data: {
            name: 'rectangle',
            text: '矩形',
            width: 100,
            height: 100
        }
    }, {
        key: 'circle',
        title: '圆形',
        data: {
            name: 'circle',
            text: '圆形',
            width: 100,
            height: 100,
            title: '圆形体室',
            progress: 0.7,
            progressColor: '#1890ff',
            // dropdownList: [1, 2, 3],
            events:[
                {
                    type: 0, // websocket
                    action: 5, // Function，自定义函数
                    value: `console.log('pen', pen, 'params', params)`,  // 这里只用写函数函数内容：即js代码
                    params: 'ws 收到消息，无需配置'
                }
            ],
            hideAnchor:true,
        }
    }, {
        key: 'img',
        title: '图片',
        data: {
            name: 'image',
            width: 100,
            height: 100,
            image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F016ba9554b952b000001bf72fa6574.jpg%402o.jpg&refer=http%3A%2F%2Fimg.zcool.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1636344024&t=f977b8ad47acf62ee3579d594f32489a'
        }
    }, {
        key: 'video',
        title: '视频',
        data: {
            name: 'video',
            width: 100,
            height: 100,
            video: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
            autoPlay: true,
        }
    }, {
        key: 'audio',
        title: '音频',
        data: {
            name: 'video',
            width: 100,
            height: 100,
            audio: 'https://down.ear0.com:3321/preview?soundid=37418&type=mp3',
            autoPlay: true,
        }
    }
];
