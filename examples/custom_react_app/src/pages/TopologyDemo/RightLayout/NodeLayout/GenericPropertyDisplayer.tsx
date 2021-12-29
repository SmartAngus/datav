import React from "react";
import {observer} from "mobx-react";
const GenericPropertyDisplayer = observer((
    {
       x,y,width,height,rotate,borderRadius,
        paddingTop,paddingRight,paddingBottom,paddingLeft,
        lineCap,lineWidth,borderWidth,background,bkType,textColor,
        fontSize,text,
        WrapComponent
    }) => {
    return <WrapComponent
        x={x&&x()}
        y={y&&y()}
        width={width&&width()}
        height={height&&height()}
        rotate={rotate&&rotate()}
        borderRadius={borderRadius&&borderRadius()}
        paddingTop={paddingTop&&paddingTop()}
        paddingRight={paddingRight&&paddingRight()}
        paddingBottom={paddingBottom&&paddingBottom()}
        paddingLeft={paddingLeft&&paddingLeft()}
        lineCap={lineCap&&lineCap()}
        lineWidth={lineWidth&&lineWidth()}
        borderWidth={borderWidth&&borderWidth()}
        background={background&&background()}
        bkType={bkType&&bkType()}
        textColor={textColor&&textColor()}
        fontSize={fontSize&&fontSize()}
        text={text&&text()}
    />
})
export default GenericPropertyDisplayer;
