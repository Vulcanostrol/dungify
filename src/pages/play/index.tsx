import {RoomProvider} from "liveblocks.config";
import {CursorState, Identifier, Layer, LayerGroup, LayerObject, LayerType, Polygon} from "@/types";
import {LiveList, LiveMap, LiveObject} from "@liveblocks/client";
import Loading from "@/components/app/Loading";
import DungifyApp from "@/components/app/DungifyApp";
import {ClientSideSuspense} from "@liveblocks/react";
import styles from "@/styles/Play.module.css";

export default function Play() {
  return (
    <RoomProvider
      id="my-room-id"
      initialPresence={{
        cursor: null,
        state: CursorState.HIDDEN,
        selection: null,
      }}
      initialStorage={{
        objects: new LiveMap<string, LiveObject<LayerObject>>(),
        topLevelGroup: new LiveObject<{type: "GROUP", name: string, id: Identifier, locked: boolean, layers: LiveList<LayerType>}>({
          type: "GROUP",
          name: "Top-level Group",
          id: "top-level-group",
          locked: false,
          layers: new LiveList<LayerType>([new LiveObject({
            type: "DM_BOUNDARY",
            locked: true,
          })]),
        }),
        dmLayerStart: 0,
        fogOfWar: new LiveObject<Polygon>({
          regions: [
            [[0, 0], [0, 5000], [5000, 5000], [5000, 0]],
          ],
          inverted: false,
        }),
      }}
    >
      <div className={styles.container}>
        <ClientSideSuspense fallback={<Loading />}>
          {() => <DungifyApp />}
        </ClientSideSuspense>
      </div>
    </RoomProvider>
  )
}
