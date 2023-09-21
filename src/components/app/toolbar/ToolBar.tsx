import styles from "./Toolbar.module.css";
import CursorButton from "@/components/app/toolbar/CursorButton";
import {useMutation, useSelf} from "../../../../liveblocks.config";
import {CanvasMode, CanvasState, CursorState, Polygon} from "@/types";
import LayerButton from "@/components/app/toolbar/LayerButton";
import ResizeButton from "@/components/app/toolbar/ResizeButton";
import GridButton from "@/components/app/toolbar/GridButton";
import {useCallback, useState} from "react";
import LayerMenu from "@/components/app/toolbar/layers/LayerMenu";
import FogOfWarButton from "@/components/app/toolbar/FogOfWarButton";
import FowOpacityButton from "@/components/app/toolbar/FowOpacityButton";
import DungeonMasterButton from "@/components/app/toolbar/DungeonMasterButton";

type Props = {
  snapToGrid: boolean,
  switchSnapToGrid: () => void,
  showResize: boolean,
  switchShowResize: () => void,
  canvasState: CanvasState,
  setCanvasState: (state: CanvasState) => void,
  updateFogOfWar: (polygon: Polygon, adding: boolean) => void,
  fowOpacity: number,
  setFowOpacity: (opacity: number) =>  void,
  dungeonMaster: boolean,
  setDungeonMaster: (dungeonMaster: boolean) =>  void,
  setDmLayersOpacity: (value: number) => void,
}

export default function ToolBar(props: Props) {
  const cursorState = useSelf((me) => me.presence.state);
  const [layerMenuOpen, setLayerMenuOpen] = useState<boolean>(false);

  const onCursorButtonClick = useMutation(({setMyPresence}) => {
    switch (cursorState) {
      case CursorState.SHOWN:
        setMyPresence({
          state: CursorState.HIDDEN,
        });
        break;
      case CursorState.HIDDEN:
        setMyPresence({
          state: CursorState.SHOWN,
        });
        break;
      default:
        break;
    }
  }, [cursorState]);

  const switchDungeonMaster = useCallback(() => {
    if (props.dungeonMaster) {
      setLayerMenuOpen(false);
      props.setFowOpacity(1.0);
      if (props.showResize) {
        props.switchShowResize();
      }
    }
    props.setDungeonMaster(!props.dungeonMaster);
  }, [props]);

  const switchLayerMenuOpen = useCallback(() => {
    setLayerMenuOpen(!layerMenuOpen);
  }, [layerMenuOpen, setLayerMenuOpen]);

  const switchFogOfWar = useCallback(() => {
    if (props.canvasState.mode === CanvasMode.FogOfWar) {
      const region = props.canvasState.region;
      const polygon = {
        regions: [region],
        inverted: false,
      }
      props.updateFogOfWar(polygon, false);

      props.setCanvasState({
        mode: CanvasMode.None,
      });
    } else if (props.canvasState.mode === CanvasMode.None) {
      props.setCanvasState({
        mode: CanvasMode.FogOfWar,
        region: [],
      });
    }
  }, [props]);

  const switchFowOpacity = useCallback(() => {
    if (props.fowOpacity <= 0.1) {
      props.setFowOpacity(1.0);
    } else if (props.fowOpacity <= 0.3) {
      props.setFowOpacity(0.1);
    } else if (props.fowOpacity <= 1.0) {
      props.setFowOpacity(0.3);
    }
  }, [props]);

  return (
    <>
      <div
        className={styles.tool_bar}
      >
        <CursorButton isActive={cursorState === CursorState.SHOWN} onClick={onCursorButtonClick} />
        <DungeonMasterButton isActive={props.dungeonMaster} onClick={switchDungeonMaster}/>
        {props.dungeonMaster && <>
          <LayerButton isActive={layerMenuOpen} onClick={switchLayerMenuOpen} />
          <div className={styles.separator}></div>
          <ResizeButton isActive={props.showResize} onClick={props.switchShowResize} />
          <GridButton isActive={props.snapToGrid} onClick={props.switchSnapToGrid} />
          <div className={styles.separator}></div>
          <FogOfWarButton isActive={props.canvasState.mode === CanvasMode.FogOfWar} onClick={switchFogOfWar} />
          <FowOpacityButton isActive={props.fowOpacity < 1.0} onClick={switchFowOpacity} />
        </>}
      </div>
      {layerMenuOpen && <LayerMenu setDmLayersOpacity={props.setDmLayersOpacity} />}
    </>
  );
}