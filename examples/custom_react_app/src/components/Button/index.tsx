import React from "react";
import PropTypes from "prop-types";
import './style.less'

const Button = ({title})=>{
    return <button className="btn">{title}</button>
}

Button.defaultProps = {
    title: 'majy'
}

Button.propTypes = {
    title: PropTypes.string
}

export default Button;