import {Identifier, TokenLayerObject} from "@/types";
import {preSignedImageLocationFromKey} from "@/cloud";
import {useMutation} from "../../../liveblocks.config";

type Props = {
  x: number,
  y: number,
  width: number,
  height: number,
  object: TokenLayerObject,
  objectId: Identifier,
  selectedBySelf: boolean,
  opacity: number,
};

export default function TokenObject(props: Props) {
  const renewImageHref = useMutation(async ({ storage}) => {
    const objectLocationResult = await preSignedImageLocationFromKey(props.object.key);
    if (objectLocationResult.result === "ERROR") return; // TODO: Silent failure.
    const liveObject = storage.get("objects").get(props.objectId);
    console.log("Reloaded.");
    liveObject?.update({
      href: objectLocationResult.url,
    })
  }, [props]);

  return <image
    x={0}
    y={0}
    width={props.width}
    height={props.height}
    href={props.object.href}
    opacity={props.opacity}
    style={{
      transform: `translate(${props.x}px, ${props.y}px)`,
      transition: props.selectedBySelf ? "none" : "transform 120ms ease-in-out",
    }}
    onError={renewImageHref}
    preserveAspectRatio="none"
  />
}
