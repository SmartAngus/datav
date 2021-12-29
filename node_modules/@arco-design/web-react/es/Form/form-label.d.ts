import React from 'react';
import { FormItemProps } from './interface';
interface FormItemLabelProps extends Pick<FormItemProps, 'label' | 'requiredSymbol' | 'required' | 'rules'> {
    showColon: boolean;
    prefix: string;
    htmlFor?: string;
}
declare const FormItemLabel: React.FC<FormItemLabelProps>;
export default FormItemLabel;
