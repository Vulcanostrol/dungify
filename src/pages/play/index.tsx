import {RoomProvider} from "liveblocks.config";
import {CursorState, Identifier, Layer, LayerGroup, LayerObject} from "@/types";
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
      }}
      initialStorage={{
        objects: new LiveMap<string, LiveObject<LayerObject>>(),
        topLevelGroup: new LiveObject<{type: "GROUP", id: Identifier; name: string; layers: LiveList<Layer | LayerGroup>}>({
          type: "GROUP",
          id: "top-level-group",
          name: "Top-level Group",
          layers: new LiveList<Layer | LayerGroup>(),
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
