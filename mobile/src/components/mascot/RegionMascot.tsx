import { memo } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import {
  getRegionMascotLook,
  type MascotHatStyle,
} from '@/src/data/regionMascotThemes';

type RegionMascotProps = {
  areaCode: string;
  sigunguCode: string;
  sigunguName: string;
  regionName: string;
  unlocked: boolean;
  size?: number;
};

type ColorProps = {
  fill: string;
  accent: string;
  line: string;
};

function Hat({ style, fill, accent, line }: ColorProps & { style: MascotHatStyle }) {
  switch (style) {
    case 'roof':
      return <G><Path d="M47 47 Q80 21 113 47 Q103 45 98 51 H62 Q57 45 47 47Z" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Line x1="80" y1="28" x2="80" y2="50" stroke={accent} strokeWidth="3" /></G>;
    case 'islands':
      return <G><Path d="M48 48 Q58 35 68 43 Q78 25 91 42 Q101 34 112 48Z" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Path d="M51 51 Q61 46 71 51 T91 51 T109 51" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" /></G>;
    case 'orbit':
      return <G><Path d="M57 47 Q59 26 80 25 Q101 26 103 47Z" fill={fill} stroke={line} strokeWidth="3" /><Ellipse cx="80" cy="34" rx="31" ry="10" fill="none" stroke={accent} strokeWidth="3" transform="rotate(-12 80 34)" /><Circle cx="109" cy="28" r="4" fill={accent} /></G>;
    case 'peak':
      return <G><Polygon points="48,48 68,27 77,35 87,20 113,48" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Path d="M78 34 L87 20 L96 35 L90 32 L86 37Z" fill={accent} /></G>;
    case 'art':
      return <G><Ellipse cx="80" cy="38" rx="31" ry="14" fill={fill} stroke={line} strokeWidth="3" transform="rotate(-8 80 38)" /><Path d="M78 24 Q80 17 87 21" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" /></G>;
    case 'lighthouse':
      return <G><Path d="M65 47 L69 25 H91 L96 47Z" fill={fill} stroke={line} strokeWidth="3" /><Rect x="66" y="31" width="28" height="7" rx="2" fill={accent} /><Path d="M64 25 H96 L89 18 H71Z" fill={accent} stroke={line} strokeWidth="3" strokeLinejoin="round" /></G>;
    case 'garden':
      return <G><Path d="M80 47 Q58 40 57 22 Q77 22 80 43 Q83 22 103 22 Q102 40 80 47Z" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Line x1="80" y1="44" x2="80" y2="24" stroke={accent} strokeWidth="3" /></G>;
    case 'lake':
      return <G><Path d="M50 45 Q60 37 70 45 T90 45 T110 45 V51 H50Z" fill={fill} stroke={line} strokeWidth="3" /><Path d="M65 41 Q80 24 95 41" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" /></G>;
    case 'trail':
      return <G><Path d="M58 44 L63 24 H97 L102 44Z" fill={fill} stroke={line} strokeWidth="3" /><Ellipse cx="80" cy="46" rx="34" ry="8" fill={accent} stroke={line} strokeWidth="3" /><Path d="M69 28 Q80 36 91 28" fill="none" stroke={line} strokeWidth="3" /></G>;
    case 'sunset':
      return <G><Path d="M55 47 A25 25 0 0 1 105 47Z" fill={fill} stroke={line} strokeWidth="3" /><Line x1="80" y1="17" x2="80" y2="25" stroke={accent} strokeWidth="3" strokeLinecap="round" /><Line x1="52" y1="26" x2="59" y2="31" stroke={accent} strokeWidth="3" strokeLinecap="round" /><Line x1="108" y1="26" x2="101" y2="31" stroke={accent} strokeWidth="3" strokeLinecap="round" /></G>;
    case 'hanok':
      return <G><Path d="M45 47 Q57 50 65 42 Q80 29 95 42 Q103 50 115 47 Q106 56 96 51 H64 Q54 56 45 47Z" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Rect x="71" y="31" width="18" height="15" rx="3" fill={accent} /></G>;
    case 'archipelago':
      return <G><Circle cx="62" cy="39" r="10" fill={fill} stroke={line} strokeWidth="3" /><Circle cx="82" cy="30" r="13" fill={accent} stroke={line} strokeWidth="3" /><Circle cx="102" cy="40" r="9" fill={fill} stroke={line} strokeWidth="3" /><Path d="M50 49 Q60 44 70 49 T90 49 T110 49" fill="none" stroke={line} strokeWidth="3" strokeLinecap="round" /></G>;
    case 'heritage':
      return <G><Path d="M48 45 Q62 50 70 39 Q80 25 90 39 Q98 50 112 45" fill={fill} stroke={line} strokeWidth="3" strokeLinecap="round" /><Circle cx="50" cy="44" r="5" fill={accent} stroke={line} strokeWidth="2" /><Circle cx="110" cy="44" r="5" fill={accent} stroke={line} strokeWidth="2" /></G>;
    case 'island-garden':
      return <G><Path d="M52 47 Q63 30 76 43 Q88 23 106 47Z" fill={fill} stroke={line} strokeWidth="3" /><Circle cx="81" cy="25" r="7" fill={accent} /><Circle cx="74" cy="31" r="7" fill={accent} /><Circle cx="88" cy="31" r="7" fill={accent} /><Circle cx="81" cy="32" r="5" fill={fill} /></G>;
    case 'oreum':
      return <G><Path d="M49 47 Q61 27 80 31 Q99 27 111 47Z" fill={fill} stroke={line} strokeWidth="3" /><Path d="M57 24 Q71 16 85 24 T109 22" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" /></G>;
    case 'fortress':
      return <G><Path d="M54 48 V25 H64 V33 H75 V25 H86 V33 H97 V25 H107 V48Z" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Path d="M70 48 V39 Q80 30 90 39 V48" fill={accent} /></G>;
  }
}

function RegionMascotComponent({ areaCode, sigunguCode, sigunguName, regionName, unlocked, size = 112 }: RegionMascotProps) {
  const look = getRegionMascotLook(areaCode, sigunguCode, sigunguName);
  // A shared travel uniform, neutral face, and one regional symbol.
  const primary = unlocked ? look.primary : '#C3C5CB';
  const pale = unlocked ? look.pale : '#F0F1F3';
  const line = unlocked ? '#45404E' : '#A7AAB3';
  const paper = unlocked ? '#FFFCF6' : '#DADCE1';

  return (
    <Svg width={size} height={size} viewBox="0 0 160 160"
      accessibilityLabel={regionName + (unlocked ? ' 수집한 지역 친구' : ' 미해금 캐릭터')}
      role="img">
      <Circle cx="80" cy="80" r="69" fill={pale} />
      <Ellipse cx="80" cy="141" rx="34" ry="4" fill={line} opacity="0.08" />
      <G stroke={line} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M57 105 Q44 105 43 118 Q44 124 51 120 L60 115 M103 105 Q116 105 117 118 Q116 124 109 120 L100 115" fill={primary} />
        <Path d="M61 127 V137 Q65 142 72 137 V130 M88 130 V137 Q95 142 99 137 V127" fill={paper} />
        <Rect x="54" y="84" width="52" height="48" rx="19" fill={primary} />
        <Path d="M61 91 L99 124" fill="none" stroke={paper} />
        <Rect x="82" y="110" width="20" height="15" rx="4" fill={paper} />
        <Rect x="44" y="39" width="72" height="57" rx="27" fill={paper} />
      </G>
      <Hat style={look.hat} fill={primary} accent={paper} line={line} />
      {unlocked && <G fill={line}>
        <Circle cx="67" cy="65" r="2.8" /><Circle cx="93" cy="65" r="2.8" />
        <Path d="M74 76 Q80 81 86 76" fill="none" stroke={line} strokeWidth="2.5" strokeLinecap="round" />
      </G>}
      {!unlocked && <G stroke={line} strokeWidth="2.5" fill="none">
        <Path d="M75 73 V69 A5 5 0 0 1 85 69 V73" />
        <Rect x="72" y="73" width="16" height="12" rx="3" />
      </G>}
    </Svg>
  );
}

export const RegionMascot = memo(RegionMascotComponent);
