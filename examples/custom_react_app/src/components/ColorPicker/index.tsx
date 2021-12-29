import React, {useState} from 'react'
import { SketchPicker } from 'react-color'
import { EditableInput } from 'react-color/lib/components/common'

export const ColorPicker = (props) => {
    const { defaultColor, value="#000000", onChange } = props;
    const [visible, setVisible] = useState(false);
    const [color, setColor] = useState(defaultColor||value);

    const handleClick = () => {
        setVisible(!visible);
    };

    const handleClose = () => {
        setVisible(false);
        triggerChange(color);
    };

    const triggerChange = (color) => {
        if (onChange) {
            onChange(color);
        }
    };

    const handleChange = (color) => {
        if(typeof color=='string'){
            setColor(color);
            return;
        }
        setColor(color.hex);
    };
    const styles = {
        input: {
            height: 32,
            minHeight: 32,
            border: `1px solid var(--color-fill-2)`,
            width: '100%',
            paddingLeft: 40,
            backgroundColor: 'var(--color-fill-2)',
        },
        swatch: {
            position: "absolute",
            width: 20,
            height: 20,
            background: color,
            left: 8,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
        },
        container:{
            display: 'flex',
            position: 'relative',
            alignItems: "center",
            width: '100%',
        },
        popover: {
            position: 'fixed',
            zIndex: '2',
            right: 300,
            top: 150,
            textAlign: "center",
        },
        cover: {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        },
    }
    return (
        <span>
      <div style={styles.container}>
        <EditableInput
            style={{ input: styles.input }}
            value={ color }
            onChange={ handleChange }
        />
        <span style={ styles.swatch } onClick={handleClick} />
      </div>
            {visible ? (
                <div style={styles.popover}>
                    <div style={styles.cover} onClick={handleClose} />
                    <SketchPicker
                        color={color}
                        onChangeComplete={handleChange}
                    />
                </div>
            ) : null}
    </span>
    )
}

export default ColorPicker;
