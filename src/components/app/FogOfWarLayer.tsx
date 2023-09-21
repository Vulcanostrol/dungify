import styles from "./FogOfWarLayer.module.css";
import React, {memo, useMemo} from "react";
import {Polygon, Region} from "@/types";

type Props = {
  polygon: Polygon,
  fowOpacity: number,
}

function makePathString(polygon: Polygon) {
  return polygon.regions.map((region: Region) => {
    let result = `M${region[0][0]} ${region[0][1]} `
    for (let i = 1; i < region.length; i++) {
      result += `L${region[i][0]} ${region[i][1]} `
    }
    return `${result} Z`;
  })
}

export default memo(function FogOfWarLayer({polygon, fowOpacity}: Props) {

  const polygonPath = useMemo(() => makePathString(polygon), [polygon]);

  return (
    <>
      <defs>
        <filter id="filter" x="-100%" y="-100%" width="300%" height="300%">
          <feOffset result="offOut" in="SourceAlpha" dx="0" dy="0" />
          <feGaussianBlur result="blurOut1" in="offOut" stdDeviation="2" />
          <feGaussianBlur result="blurOut2" in="offOut" stdDeviation="5" />
          <feGaussianBlur result="blurOut3" in="offOut" stdDeviation="10" />
          <feGaussianBlur result="blurOut4" in="offOut" stdDeviation="20" />
          <feGaussianBlur result="blurOut5" in="offOut" stdDeviation="40" />
          <feGaussianBlur result="blurOut6" in="offOut" stdDeviation="80" />
          <feGaussianBlur result="blurOut7" in="offOut" stdDeviation="120" />
          <feGaussianBlur result="blurOut8" in="offOut" stdDeviation="160" />
          <feBlend result="blurOutA" in="blurOut1" in2="blurOut2" mode="normal" />
          <feBlend result="blurOutB" in="blurOut3" in2="blurOut4" mode="normal" />
          <feBlend result="blurOutC" in="blurOut5" in2="blurOut6" mode="normal" />
          <feBlend result="blurOutD" in="blurOut7" in2="blurOut8" mode="normal" />
          <feBlend result="blurOutE" in="blurOutA" in2="blurOutB" mode="normal" />
          <feBlend result="blurOutF" in="blurOutC" in2="blurOutD" mode="normal" />
          <feBlend result="blurOutG" in="blurOutE" in2="blurOutF" mode="normal" />
          <feBlend in="SourceGraphic" in2="blurOutG" mode="normal" />
        </filter>
      </defs>
      {polygonPath.map((regionPath, idx: number) => {
        return <g key={`fow-${idx}`} filter="url(#filter)">
          <path
            style={{
              fill: `rgba(0, 0, 0, ${fowOpacity})`,
              pointerEvents: "none",
            }}
            className={styles.region}
            d={regionPath}
          />
        </g>
      })}
    </>
  );
})