import React, {useCallback} from "react";
import {Polygon, Region} from "@/types";

type Props = {
  polygon: Polygon,
  fowOpacity: number,
}

export default function FogOfWarLayer({polygon, fowOpacity}: Props) {

  const makePathString = useCallback((region: Region) => {
    let result = `M${region[0][0]} ${region[0][1]} `
    for (let i = 1; i < region.length; i++) {
      result += `L${region[i][0]} ${region[i][1]} `
    }
    return `${result} Z`;
  }, []);

  return (
    <>
      {polygon.regions.map((region: Region) => (
        <>
          <path
            style={{
              filter: "blur(128px)",
              fill: `rgba(0, 0, 0, ${fowOpacity})`,
              pointerEvents: "none",
            }}
            d={makePathString(region)}
          />
          <path
            style={{
              filter: "blur(64px)",
              fill: `rgba(0, 0, 0, ${fowOpacity})`,
              pointerEvents: "none",
            }}
            d={makePathString(region)}
          />
          <path
            style={{
              filter: "blur(32px)",
              fill: `rgba(0, 0, 0, ${fowOpacity})`,
              pointerEvents: "none",
            }}
            d={makePathString(region)}
          />
          <path
            style={{
              filter: "blur(16px)",
              fill: `rgba(0, 0, 0, ${fowOpacity})`,
              pointerEvents: "none",
            }}
            d={makePathString(region)}
          />
          <path
            style={{
              filter: "blur(8px)",
              fill: `rgba(0, 0, 0, ${fowOpacity})`,
              pointerEvents: "none",
            }}
            d={makePathString(region)}
          />
          <path
            style={{
              fill: `rgba(0, 0, 0, ${fowOpacity})`,
              pointerEvents: "none",
            }}
            d={makePathString(region)}
          />
        </>
      ))}
    </>
  );
}