import {ToImmutable} from "@liveblocks/core";
import {Layer, LayerGroup} from "@/types";
import React from "react";
import Object from "@/components/app/Object";
import {layerGroupToLayerList} from "@/utils";

type Props = {
  topLevelGroup: ToImmutable<LayerGroup>,
  dungeonMaster: boolean,
  dmLayersOpacity: number,
}

export default function ObjectRenderer(props: Props) {
  return <>
    {layerGroupToLayerList(props.topLevelGroup, props.dungeonMaster).map(({layer, dm}) => {
      return <Object key={layer.object} objectId={layer.object} opacity={dm ? props.dmLayersOpacity : 1.0}/>
    })}
  </>;
}