import { memo } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import {
  getRegionMascotLook,
  type MascotHatStyle,
  type MascotOutfitStyle,
  type MascotPropStyle,
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

function Outfit({ style, fill, accent, line }: ColorProps & { style: MascotOutfitStyle }) {
  switch (style) {
    case 'vest':
      return <G stroke={line} strokeWidth="2.5" strokeLinejoin="round">
        <Path d="M59 94 L73 99 V129 H57 V107Z M101 94 L87 99 V129 H103 V107Z" fill={accent} />
        <Path d="M61 116 H69 M91 116 H99" fill="none" strokeLinecap="round" />
      </G>;
    case 'scarf':
      return <G stroke={line} strokeWidth="2.5" strokeLinejoin="round">
        <Path d="M95 96 L117 102 L111 112 L94 103Z" fill={accent} />
        <Path d="M56 91 Q80 101 104 91 L99 101 Q80 108 61 101Z" fill={accent} />
        <Circle cx="80" cy="117" r="7" fill="none" stroke={accent} />
      </G>;
    case 'sailor':
      return <G fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M58 92 L80 106 L102 92" strokeWidth="6" />
        <Path d="M64 115 H96 M64 123 H96" />
        <Path d="M77 106 L80 114 L83 106" fill={fill} stroke={line} strokeWidth="2" />
      </G>;
    case 'robe':
      return <G stroke={line} strokeWidth="2.5" strokeLinejoin="round">
        <Path d="M60 92 L95 110 L100 97 L82 92Z" fill={accent} />
        <Path d="M57 115 H103 V122 H57Z" fill={accent} />
        <Path d="M80 116 L87 113 L91 118 L87 123 L80 119 L74 124 L70 119 L74 114Z" fill={fill} />
      </G>;
  }
}

function TravelProp({ style, fill, accent, line }: ColorProps & { style: MascotPropStyle }) {
  // Same 36px accessory box and 3px outline for every regional prop.
  return <G stroke={line} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    {(() => {
      switch (style) {
        case 'sign': return <G><Path d="M28 96 V131" /><Path d="M12 88 H38 L45 98 L38 108 H12Z" fill={fill} /><Path d="M20 98 H33" stroke={accent} /></G>;
        case 'compass': return <G><Circle cx="28" cy="110" r="17" fill={accent} /><Path d="M28 96 L35 112 L28 123 L21 108Z" fill={fill} /><Circle cx="28" cy="110" r="2" fill={line} /></G>;
        case 'telescope': return <G><Path d="M29 110 L19 132 M29 110 L39 132" /><Path d="M11 95 L17 85 L44 103 L38 113Z" fill={fill} /><Path d="M14 95 L20 90" stroke={accent} /></G>;
        case 'lantern': return <G><Path d="M19 96 V90 Q28 78 37 90 V96" fill="none" /><Rect x="14" y="96" width="28" height="31" rx="7" fill={accent} /><Path d="M28 103 V119 M19 127 H37" stroke={fill} /></G>;
        case 'brush': return <G><Path d="M17 130 L35 103" stroke={fill} strokeWidth="8" /><Path d="M32 104 Q31 94 44 87 Q49 100 40 110Z" fill={accent} /></G>;
        case 'beacon': return <G><Path d="M15 130 L19 96 H37 L41 130Z" fill={accent} /><Path d="M19 107 H37 M17 119 H39" stroke={fill} strokeWidth="5" /><Path d="M15 96 L28 86 L41 96Z" fill={fill} /></G>;
        case 'flower': return <G><Path d="M28 110 V133" /><Path d="M28 127 Q13 126 15 118 Q26 117 28 127" fill={fill} /><G fill={accent}><Circle cx="28" cy="91" r="7" /><Circle cx="18" cy="101" r="7" /><Circle cx="38" cy="101" r="7" /><Circle cx="28" cy="111" r="7" /></G><Circle cx="28" cy="101" r="5" fill={fill} /></G>;
        case 'map': return <G><Path d="M10 98 L22 92 L34 98 L46 92 V123 L34 129 L22 123 L10 129Z" fill={accent} /><Path d="M22 95 V121 M34 100 V126" stroke={fill} /></G>;
        case 'staff': return <G><Path d="M24 132 L34 89 Q30 81 22 89" fill="none" strokeWidth="5" /><Path d="M33 95 L44 98 L38 108 L30 105Z" fill={accent} /><Path d="M21 120 H30" stroke={fill} /></G>;
        case 'stamp': return <G><Rect x="12" y="115" width="32" height="17" rx="4" fill={fill} /><Path d="M21 114 V105 Q15 91 28 89 Q41 91 35 105 V114Z" fill={accent} /><Path d="M18 125 H38" stroke={accent} /></G>;
        case 'fan': return <G><Path d="M28 127 L8 102 Q28 76 48 102Z" fill={accent} /><Path d="M28 127 V94 M28 127 L17 98 M28 127 L39 98" stroke={fill} strokeWidth="2" /></G>;
        case 'sail': return <G><Path d="M28 87 V119 M28 90 L43 114 H28Z" fill={accent} /><Path d="M24 95 L12 114 H24Z" fill={fill} /><Path d="M10 120 H46 L38 131 H18Z" fill={fill} /></G>;
        case 'scroll': return <G><Rect x="15" y="91" width="26" height="37" rx="4" fill={accent} /><Path d="M12 92 H43 M13 128 H45" stroke={fill} strokeWidth="5" /><Path d="M22 103 H34 M22 111 H31 M22 119 H34" strokeWidth="2" /></G>;
        case 'pinwheel': return <G><Path d="M28 106 V133" /><Path d="M28 103 V84 L41 93Z M28 103 H47 L38 116Z" fill={fill} /><Path d="M28 103 V122 L15 113Z M28 103 H9 L18 90Z" fill={accent} /><Circle cx="28" cy="103" r="3" fill={line} /></G>;
      }
    })()}
  </G>;
}

function RegionMascotComponent({ areaCode, sigunguCode, sigunguName, regionName, unlocked, size = 112 }: RegionMascotProps) {
  const look = getRegionMascotLook(areaCode, sigunguCode, sigunguName);
  const primary = unlocked ? look.primary : '#BEC6CB';
  const secondary = unlocked ? look.secondary : '#DCE1E3';
  const pale = unlocked ? look.pale : '#F0F2F3';
  const line = unlocked ? '#45404E' : '#99A4AC';
  const paper = unlocked ? '#FFFCF6' : '#E4E7E9';

  return (
    <Svg width={size} height={size} viewBox="0 0 160 160"
      accessibilityLabel={regionName + (unlocked ? ' 수집한 지역 친구' : ' 미해금 캐릭터')}
      role="img">
      <Circle cx="80" cy="80" r="69" fill={pale} />
      <Ellipse cx="80" cy="143" rx="37" ry="4" fill={line} opacity="0.08" />
      <G opacity={unlocked ? 1 : 0.72}>
        <G stroke={line} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {look.outfit === 'vest' && <Rect x="103" y="92" width="19" height="34" rx="8" fill={secondary} />}
          <Path d="M57 105 Q44 105 43 118 Q44 124 51 120 L60 115 M103 105 Q116 105 117 118 Q116 124 109 120 L100 115" fill={primary} />
          <Path d="M61 127 V137 Q65 142 72 137 V130 M88 130 V137 Q95 142 99 137 V127" fill={paper} />
          <Rect x="54" y="84" width="52" height="48" rx="19" fill={primary} />
        </G>
        <Outfit style={look.outfit} fill={primary} accent={secondary} line={line} />
        <Rect x="44" y="39" width="72" height="57" rx="27" fill={paper} stroke={line} strokeWidth="3" />
        <Hat style={look.hat} fill={primary} accent={secondary} line={line} />
        <TravelProp style={look.prop} fill={primary} accent={secondary} line={line} />
        {unlocked && <G fill={line}>
          <Circle cx="67" cy="65" r="2.8" /><Circle cx="93" cy="65" r="2.8" />
          <Path d="M74 76 Q80 81 86 76" fill="none" stroke={line} strokeWidth="2.5" strokeLinecap="round" />
        </G>}
      </G>
      {!unlocked && <G stroke={line} strokeWidth="2.5" fill="none">
        <Path d="M75 73 V69 A5 5 0 0 1 85 69 V73" />
        <Rect x="72" y="73" width="16" height="12" rx="3" fill={paper} />
      </G>}
    </Svg>
  );
}

export const RegionMascot = memo(RegionMascotComponent);
