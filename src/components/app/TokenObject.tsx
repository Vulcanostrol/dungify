export default function TokenObject(props: { width: any, height: any, object: any, x: any, y: any, selectedBySelf: boolean }) {
  return <image
      x={0}
      y={0}
      width={props.width}
      height={props.height}
      href={props.object.href}
      style={{
        transform: `translate(${props.x}px, ${props.y}px)`,
        transition: props.selectedBySelf ? "none" : "transform 120ms ease-in-out",
      }}
      preserveAspectRatio="none"
    />
);
}