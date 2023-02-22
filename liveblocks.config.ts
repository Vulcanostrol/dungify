import {createClient, LiveMap, LiveObject} from "@liveblocks/client";
import {createRoomContext} from "@liveblocks/react";
import {CursorState, Identifier, LayerGroup, LayerObject, Point} from "@/types";

const client = createClient({
  publicApiKey: "pk_dev_F3tAb9PLM0NotKwJ_1aV4_9fvzlJhkQQkdTmey6AJwsS9XbIW6he5jwAimzF9-Uz",
});

type Presence = {
  cursor: Point | null;
  state: CursorState,
};

type Storage = {
  objects: LiveMap<Identifier, LiveObject<LayerObject>>;
  topLevelGroup: LayerGroup;
};

export const {
  suspense: {
    RoomProvider,
    useCanRedo,
    useCanUndo,
    useHistory,
    useMutation,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useRoom,
    useSelf,
    useStorage,
    useUpdateMyPresence,
  },
} = createRoomContext<Presence, Storage>(client);
