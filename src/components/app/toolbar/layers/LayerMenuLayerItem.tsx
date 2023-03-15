import {ToImmutable} from "@liveblocks/core";
import {Draggable, DraggingStyle, NotDraggingStyle} from "react-beautiful-dnd";
import {Layer} from "@/types";
import React, {CSSProperties} from "react";
import {useMutation, useStorage} from "../../../../../liveblocks.config";
import DeleteButton from "@/components/app/toolbar/DeleteButton";
import LockButton from "@/components/app/toolbar/LockButton";

type Props = {
  item: ToImmutable<Layer>,
  index: number,
}

export default function LayerMenuLayerItem({item, index}: Props) {
  const layerLocked = useStorage((root) => root.topLevelGroup.layers[index].locked);

  const grid = 8;

  const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined): CSSProperties | undefined => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle
  });

  const onChange = useMutation(({storage}, e: React.ChangeEvent) => {
    const layerObject = storage.get("topLevelGroup").get("layers").get(index);
    if (!layerObject) return;
    layerObject.update({
      name: (e.target as HTMLInputElement).value,
    });
  }, [index]);

  const deleteThisLayer = useMutation(({storage}) => {
    storage.get("topLevelGroup").get("layers").delete(index);
  }, [index]);

  const lockThisLayer = useMutation(({storage}) => {
    storage.get("topLevelGroup").get("layers").get(index)?.update({
      locked: !layerLocked,
    });
  }, [index, layerLocked]);

  return (
    <Draggable draggableId={item.object} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
          snapshot.isDragging,
          provided.draggableProps.style
          )}
        >
          <input type="text" value={item.name} onChange={onChange} />
          <DeleteButton isActive={false} onClick={deleteThisLayer} />
          <LockButton isActive={layerLocked} onClick={lockThisLayer} />
        </div>
      )}
    </Draggable>
  );
}