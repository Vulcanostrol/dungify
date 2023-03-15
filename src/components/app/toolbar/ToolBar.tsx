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
}

export default function ToolBar({
                                  snapToGrid,
                                  switchSnapToGrid,
                                  showResize,
                                  switchShowResize,
                                  canvasState,
                                  setCanvasState,
                                  updateFogOfWar,
                                  fowOpacity,
                                  setFowOpacity}: Props) {
  const cursorState = useSelf((me) => me.presence.state);
  const [layerMenuOpen, setLayerMenuOpen] = useState<boolean>(false);
  const [dungeonMaster, setDungeonMaster] = useState<boolean>(false);

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
    if (dungeonMaster) {
      setLayerMenuOpen(false);
      setFowOpacity(1.0);
      if (showResize) {
        switchShowResize();
      }
    }
    setDungeonMaster(!dungeonMaster);
  }, [dungeonMaster, setDungeonMaster, setFowOpacity, setLayerMenuOpen, showResize, switchShowResize]);

  const switchLayerMenuOpen = useCallback(() => {
    setLayerMenuOpen(!layerMenuOpen);
  }, [layerMenuOpen, setLayerMenuOpen]);

  const switchFogOfWar = useCallback(() => {
    if (canvasState.mode === CanvasMode.FogOfWar) {
      const region = canvasState.region;
      const polygon = {
        regions: [region],
        inverted: false,
      }
      updateFogOfWar(polygon, false);

      setCanvasState({
        mode: CanvasMode.None,
      });
    } else if (canvasState.mode === CanvasMode.None) {
      setCanvasState({
        mode: CanvasMode.FogOfWar,
        region: [],
      });
    }
  }, [canvasState, setCanvasState, updateFogOfWar])

  const switchFowOpacity = useCallback(() => {
    if (fowOpacity < 0.3) {
      setFowOpacity(1.0);
    } else if (fowOpacity < 0.6) {
      setFowOpacity(0.2);
    } else if (fowOpacity < 1.0) {
      setFowOpacity(0.3);
    } else {
      setFowOpacity(0.6);
    }
  }, [fowOpacity, setFowOpacity])

  return (
    <>
      <div
        className={styles.tool_bar}
      >
        <CursorButton isActive={cursorState === CursorState.SHOWN} onClick={onCursorButtonClick} />
        <DungeonMasterButton isActive={dungeonMaster} onClick={switchDungeonMaster}/>
        {dungeonMaster && <>
          <LayerButton isActive={layerMenuOpen} onClick={switchLayerMenuOpen} />
          <div className={styles.separator}></div>
          <ResizeButton isActive={showResize} onClick={switchShowResize} />
          <GridButton isActive={snapToGrid} onClick={switchSnapToGrid} />
          <div className={styles.separator}></div>
          <FogOfWarButton isActive={canvasState.mode === CanvasMode.FogOfWar} onClick={switchFogOfWar} />
          <FowOpacityButton isActive={fowOpacity < 1.0} onClick={switchFowOpacity} />
        </>}
      </div>
      {layerMenuOpen && <LayerMenu />}
    </>
  );
}