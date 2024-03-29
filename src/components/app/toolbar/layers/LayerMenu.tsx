import styles from "./LayerMenu.module.css";
import {DragDropContext, Droppable, DropResult} from 'react-beautiful-dnd';
import {useMutation, useStorage} from "../../../../../liveblocks.config";
import {ToImmutable} from "@liveblocks/core";
import {DmLayerBoundary, Layer, LayerGroup, LayerListType, LayerType} from "@/types";
import LayerMenuLayerItem from "@/components/app/toolbar/layers/LayerMenuLayerItem";
import LayerMenuDmBoundaryItem from "@/components/app/toolbar/layers/LayerMenuDmBoundaryItem";

type Props = {
  setDmLayersOpacity: (value: number) => void,
}

export default function LayerMenu(props: Props) {
  const topLevelGroup = useStorage((root) => root.topLevelGroup);

  const onDragEnd = useMutation(({storage}, result: DropResult) => {
    if (result.reason !== "DROP" || !result.destination) return;
    const layerList = storage.get("topLevelGroup").get("layers");
    layerList.move(result.source.index, result.destination.index);
  }, []);

  const grid = 8;

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
  });

  return (
    <div
      className={styles.layer_menu}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={topLevelGroup.id}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {topLevelGroup.layers.map((item: ToImmutable<Layer> | ToImmutable<LayerGroup> | ToImmutable<DmLayerBoundary>, idx: number) => {
                switch (item.type) {
                  case "LAYER":
                    return <LayerMenuLayerItem key={item.object} item={item} index={idx} />;
                  case "DM_BOUNDARY":
                    return <LayerMenuDmBoundaryItem key="dm-layer-boundary" index={idx} setDmLayersOpacity={props.setDmLayersOpacity} />;
                  default:
                    return null;
                }
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}