import { DraggableItemProps } from './interface';
declare function Item(props: DraggableItemProps): JSX.Element;
declare namespace Item {
    var defaultProps: {
        droppable: boolean;
    };
}
export default Item;
