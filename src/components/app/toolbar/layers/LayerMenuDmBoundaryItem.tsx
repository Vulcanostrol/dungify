import styles from "./LayerMenu.module.css";
import {Draggable, DraggingStyle, NotDraggingStyle} from "react-beautiful-dnd";
import React, {CSSProperties} from "react";

type Props = {
  index: number,
  setDmLayersOpacity: (value: number) => void,
}

export default function LayerMenuDmBoundaryItem(props: Props) {
  const grid = 8;

  const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined): CSSProperties | undefined => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle
  });

  const onValueChange = React.useCallback((e: React.ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    props.setDmLayersOpacity(parseFloat(target.value));
  }, [props]);

  return (
    <Draggable draggableId="dm-layer-boundary" index={props.index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={styles.layer_dm_boundary_item}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          DM Layers
          <input onChange={onValueChange} type="range" min="0" max="1" step="0.01" />
        </div>
      )}
    </Draggable>
  );
}