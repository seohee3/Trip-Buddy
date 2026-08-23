import { memo } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import {
  getRegionMascotLook,
  type MascotBadgeStyle,
  type MascotHatStyle,
  type MascotPatternStyle,
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
      return <G><Ellipse cx="80" cy="38" rx="31" ry="14" fill={fill} stroke={line} strokeWidth="3" transform="rotate(-8 80 38)" /><Path d="M78 24 Q80 17 87 21" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" /></G>;
    case 'lighthouse':
      return <G><Path d="M65 47 L69 25 H91 L96 47Z" fill={fill} stroke={line} strokeWidth="3" /><Rect x="66" y="31" width="28" height="7" rx="2" fill={accent} /><Path d="M64 25 H96 L89 18 H71Z" fill={accent} stroke={line} strokeWidth="3" strokeLinejoin="round" /></G>;
    case 'garden':
      return <G><Path d="M80 47 Q58 40 57 22 Q77 22 80 43 Q83 22 103 22 Q102 40 80 47Z" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Line x1="80" y1="44" x2="80" y2="24" stroke={accent} strokeWidth="3" /></G>;
    case 'lake':
      return <G><Path d="M50 45 Q60 37 70 45 T90 45 T110 45 V51 H50Z" fill={fill} stroke={line} strokeWidth="3" /><Path d="M65 41 Q80 24 95 41" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" /></G>;
    case 'trail':
      return <G><Path d="M58 44 L63 24 H97 L102 44Z" fill={fill} stroke={line} strokeWidth="3" /><Ellipse cx="80" cy="46" rx="34" ry="8" fill={accent} stroke={line} strokeWidth="3" /><Path d="M69 28 Q80 36 91 28" fill="none" stroke={line} strokeWidth="3" /></G>;
    case 'sunset':
      return <G><Path d="M55 47 A25 25 0 0 1 105 47Z" fill={fill} stroke={line} strokeWidth="3" /><Line x1="80" y1="17" x2="80" y2="25" stroke={accent} strokeWidth="4" strokeLinecap="round" /><Line x1="52" y1="26" x2="59" y2="31" stroke={accent} strokeWidth="4" strokeLinecap="round" /><Line x1="108" y1="26" x2="101" y2="31" stroke={accent} strokeWidth="4" strokeLinecap="round" /></G>;
    case 'hanok':
      return <G><Path d="M45 47 Q57 50 65 42 Q80 29 95 42 Q103 50 115 47 Q106 56 96 51 H64 Q54 56 45 47Z" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Rect x="71" y="31" width="18" height="15" rx="3" fill={accent} /></G>;
    case 'archipelago':
      return <G><Circle cx="62" cy="39" r="10" fill={fill} stroke={line} strokeWidth="3" /><Circle cx="82" cy="30" r="13" fill={accent} stroke={line} strokeWidth="3" /><Circle cx="102" cy="40" r="9" fill={fill} stroke={line} strokeWidth="3" /><Path d="M50 49 Q60 44 70 49 T90 49 T110 49" fill="none" stroke={line} strokeWidth="4" strokeLinecap="round" /></G>;
    case 'heritage':
      return <G><Path d="M48 45 Q62 50 70 39 Q80 25 90 39 Q98 50 112 45" fill={fill} stroke={line} strokeWidth="7" strokeLinecap="round" /><Circle cx="50" cy="44" r="5" fill={accent} stroke={line} strokeWidth="2" /><Circle cx="110" cy="44" r="5" fill={accent} stroke={line} strokeWidth="2" /></G>;
    case 'island-garden':
      return <G><Path d="M52 47 Q63 30 76 43 Q88 23 106 47Z" fill={fill} stroke={line} strokeWidth="3" /><Circle cx="81" cy="25" r="7" fill={accent} /><Circle cx="74" cy="31" r="7" fill={accent} /><Circle cx="88" cy="31" r="7" fill={accent} /><Circle cx="81" cy="32" r="5" fill={fill} /></G>;
    case 'oreum':
      return <G><Path d="M49 47 Q61 27 80 31 Q99 27 111 47Z" fill={fill} stroke={line} strokeWidth="3" /><Path d="M57 24 Q71 16 85 24 T109 22" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" /></G>;
    case 'fortress':
      return <G><Path d="M54 48 V25 H64 V33 H75 V25 H86 V33 H97 V25 H107 V48Z" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Path d="M70 48 V39 Q80 30 90 39 V48" fill={accent} /></G>;
  }
}

function TravelProp({ style, fill, accent, line, left }: ColorProps & { style: MascotPropStyle; left: boolean }) {
  const transform = left ? 'translate(0 0)' : 'translate(160 0) scale(-1 1)';

  return <G transform={transform}>{(() => {
    switch (style) {
      case 'sign': return <G><Line x1="31" y1="78" x2="31" y2="130" stroke={line} strokeWidth="5" strokeLinecap="round" /><Path d="M12 80 H43 L51 89 L43 98 H12Z" fill={fill} stroke={line} strokeWidth="3" /><Line x1="20" y1="89" x2="39" y2="89" stroke={accent} strokeWidth="3" strokeLinecap="round" /></G>;
      case 'compass': return <G><Circle cx="29" cy="103" r="18" fill={fill} stroke={line} strokeWidth="4" /><Polygon points="29,89 35,104 29,117 23,102" fill={accent} /><Circle cx="29" cy="103" r="3" fill={line} /></G>;
      case 'telescope': return <G><Path d="M13 85 L43 100 L38 110 L8 95Z" fill={fill} stroke={line} strokeWidth="3" /><Circle cx="42" cy="105" r="9" fill={accent} stroke={line} strokeWidth="3" /><Line x1="29" y1="107" x2="23" y2="132" stroke={line} strokeWidth="4" /></G>;
      case 'lantern': return <G><Path d="M17 87 Q29 75 41 87" fill="none" stroke={line} strokeWidth="4" /><Rect x="15" y="88" width="28" height="33" rx="7" fill={fill} stroke={line} strokeWidth="3" /><Path d="M22 96 L36 114 M36 96 L22 114" stroke={accent} strokeWidth="3" /></G>;
      case 'brush': return <G><Line x1="15" y1="121" x2="42" y2="82" stroke={line} strokeWidth="7" strokeLinecap="round" /><Path d="M40 83 Q48 72 51 78 Q52 86 43 91Z" fill={accent} stroke={line} strokeWidth="2" /></G>;
      case 'beacon': return <G><Path d="M17 124 L21 84 H39 L43 124Z" fill={fill} stroke={line} strokeWidth="3" /><Rect x="19" y="98" width="22" height="8" fill={accent} /><Path d="M17 84 H43 L37 76 H23Z" fill={accent} stroke={line} strokeWidth="3" /></G>;
      case 'flower': return <G><Line x1="31" y1="103" x2="31" y2="131" stroke={line} strokeWidth="4" /><Circle cx="31" cy="93" r="7" fill={accent} /><Circle cx="22" cy="95" r="7" fill={fill} /><Circle cx="40" cy="95" r="7" fill={fill} /><Circle cx="31" cy="84" r="7" fill={fill} /><Circle cx="31" cy="96" r="5" fill={line} /></G>;
      case 'map': return <G><Path d="M9 88 L23 82 L36 88 L49 82 V119 L36 125 L23 119 L9 125Z" fill={fill} stroke={line} strokeWidth="3" strokeLinejoin="round" /><Line x1="23" y1="84" x2="23" y2="118" stroke={accent} strokeWidth="3" /><Line x1="36" y1="89" x2="36" y2="123" stroke={accent} strokeWidth="3" /></G>;
      case 'staff': return <G><Path d="M34 75 Q19 74 22 88" fill="none" stroke={line} strokeWidth="5" strokeLinecap="round" /><Line x1="33" y1="78" x2="20" y2="134" stroke={line} strokeWidth="5" strokeLinecap="round" /><Line x1="18" y1="117" x2="29" y2="117" stroke={accent} strokeWidth="4" /></G>;
      case 'stamp': return <G><Rect x="12" y="104" width="37" height="25" rx="5" fill={fill} stroke={line} strokeWidth="3" /><Path d="M22 104 Q20 88 31 84 Q42 88 39 104Z" fill={accent} stroke={line} strokeWidth="3" /><Circle cx="31" cy="116" r="6" fill="none" stroke={accent} strokeWidth="3" /></G>;
      case 'fan': return <G><Path d="M10 112 Q25 77 49 96 L31 122Z" fill={fill} stroke={line} strokeWidth="3" /><Line x1="31" y1="122" x2="25" y2="92" stroke={accent} strokeWidth="2" /><Line x1="31" y1="122" x2="37" y2="92" stroke={accent} strokeWidth="2" /></G>;
      case 'sail': return <G><Line x1="30" y1="78" x2="30" y2="128" stroke={line} strokeWidth="4" /><Path d="M28 82 L9 111 H28Z" fill={fill} stroke={line} strokeWidth="3" /><Path d="M33 88 L47 112 H33Z" fill={accent} stroke={line} strokeWidth="3" /><Path d="M12 130 Q30 122 47 130" fill="none" stroke={line} strokeWidth="5" strokeLinecap="round" /></G>;
      case 'scroll': return <G><Rect x="14" y="87" width="31" height="38" rx="5" fill={fill} stroke={line} strokeWidth="3" /><Circle cx="15" cy="91" r="5" fill={accent} stroke={line} strokeWidth="2" /><Circle cx="44" cy="121" r="5" fill={accent} stroke={line} strokeWidth="2" /><Path d="M22 99 H38 M22 107 H35 M22 115 H39" stroke={line} strokeWidth="2" strokeLinecap="round" /></G>;
      case 'pinwheel': return <G><Line x1="29" y1="100" x2="23" y2="134" stroke={line} strokeWidth="4" /><Polygon points="29,98 29,79 40,88" fill={fill} stroke={line} strokeWidth="2" /><Polygon points="29,98 48,98 39,109" fill={accent} stroke={line} strokeWidth="2" /><Polygon points="29,98 29,117 18,108" fill={fill} stroke={line} strokeWidth="2" /><Polygon points="29,98 10,98 19,87" fill={accent} stroke={line} strokeWidth="2" /><Circle cx="29" cy="98" r="4" fill={line} /></G>;
    }
  })()}</G>;
}

function BodyPattern({ style, color }: { style: MascotPatternStyle; color: string }) {
  switch (style) {
    case 'dots': return <G><Circle cx="68" cy="112" r="3" fill={color} /><Circle cx="80" cy="118" r="3" fill={color} /><Circle cx="92" cy="112" r="3" fill={color} /></G>;
    case 'stripes': return <G><Line x1="65" y1="109" x2="95" y2="109" stroke={color} strokeWidth="4" strokeLinecap="round" /><Line x1="68" y1="119" x2="92" y2="119" stroke={color} strokeWidth="4" strokeLinecap="round" /></G>;
    case 'checks': return <G><Rect x="68" y="108" width="8" height="8" rx="2" fill={color} /><Rect x="84" y="108" width="8" height="8" rx="2" fill={color} /><Rect x="76" y="116" width="8" height="8" rx="2" fill={color} /></G>;
    case 'waves': return <G><Path d="M64 111 Q72 105 80 111 T96 111" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" /><Path d="M68 121 Q74 116 80 121 T92 121" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" /></G>;
  }
}

function SignatureMarks({ value, color }: { value: number; color: string }) {
  return (
    <G>
      {[0, 1, 2, 3, 4].map((bit) => (
        <Circle
          key={bit}
          cx={68 + bit * 6}
          cy="131"
          r="1.8"
          fill={(value & (1 << bit)) !== 0 ? color : 'none'}
          stroke={color}
          strokeWidth="1.2"
        />
      ))}
    </G>
  );
}

function Badge({ style, fill, line }: { style: MascotBadgeStyle; fill: string; line: string }) {
  const mark = <Path d="M80 91 L83 96 L89 97 L85 101 L86 107 L80 104 L74 107 L75 101 L71 97 L77 96Z" fill={line} />;
  switch (style) {
    case 'round': return <G><Circle cx="80" cy="99" r="13" fill={fill} stroke={line} strokeWidth="3" />{mark}</G>;
    case 'diamond': return <G><Polygon points="80,84 95,99 80,114 65,99" fill={fill} stroke={line} strokeWidth="3" />{mark}</G>;
    case 'star': return <G><Polygon points="80,83 85,92 96,94 88,102 90,113 80,108 70,113 72,102 64,94 75,92" fill={fill} stroke={line} strokeWidth="3" />{mark}</G>;
    case 'ticket': return <G><Rect x="63" y="87" width="34" height="24" rx="6" fill={fill} stroke={line} strokeWidth="3" />{mark}</G>;
  }
}

function RegionMascotComponent({ areaCode, sigunguCode, sigunguName, regionName, unlocked, size = 112 }: RegionMascotProps) {
  const look = getRegionMascotLook(areaCode, sigunguCode, sigunguName);
  const primary = unlocked ? look.primary : '#96919F';
  const secondary = unlocked ? look.secondary : '#85808E';
  const accent = unlocked ? look.accent : '#AAA5B0';
  const pale = unlocked ? look.pale : '#E7E5EA';
  const line = unlocked ? '#403A52' : '#77727E';
  const face = unlocked ? '#332E40' : '#77727E';

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      accessible
      accessibilityLabel={`${regionName} ${unlocked ? '획득한 컬러 마스코트' : '잠긴 마스코트 실루엣'}`}
      role="img"
    >
      <Circle cx="80" cy="80" r="75" fill={pale} />
      <Path d="M18 125 Q45 111 72 124 T142 120" fill="none" stroke={unlocked ? accent : '#D2CFD6'} strokeWidth="5" strokeLinecap="round" opacity="0.45" />
      <TravelProp style={look.prop} fill={secondary} accent={accent} line={line} left={look.propOnLeft} />
      <Ellipse cx="80" cy="139" rx="43" ry="9" fill={unlocked ? '#493F6A' : '#77727E'} opacity="0.18" />
      <Path d="M51 96 Q52 78 65 75 H95 Q108 78 109 96 L113 128 Q101 139 80 139 Q59 139 47 128Z" fill={primary} stroke={line} strokeWidth="4" strokeLinejoin="round" />
      <Circle cx="57" cy="116" r="12" fill={primary} stroke={line} strokeWidth="4" />
      <Circle cx="103" cy="116" r="12" fill={primary} stroke={line} strokeWidth="4" />
      <Path d="M58 128 Q60 142 70 141 M102 128 Q100 142 90 141" fill="none" stroke={line} strokeWidth="5" strokeLinecap="round" />
      <BodyPattern style={look.pattern} color={unlocked ? accent : '#B7B2BC'} />
      <SignatureMarks value={look.signature} color={unlocked ? secondary : '#B7B2BC'} />
      <Path d="M58 78 Q80 88 102 78 L98 90 Q80 97 62 90Z" fill={unlocked ? '#5C3DFF' : secondary} stroke={line} strokeWidth="3" />
      <Circle cx="80" cy="62" r="36" fill={primary} stroke={line} strokeWidth="4" />
      <Hat style={look.hat} fill={secondary} accent={accent} line={line} />
      {unlocked ? <G><Circle cx="67" cy="62" r="4" fill={face} /><Circle cx="93" cy="62" r="4" fill={face} /><Path d="M72 72 Q80 80 88 72" fill="none" stroke={face} strokeWidth="4" strokeLinecap="round" /><Circle cx="59" cy="72" r="5" fill={accent} opacity="0.45" /><Circle cx="101" cy="72" r="5" fill={accent} opacity="0.45" /></G> : null}
      <Badge style={look.badge} fill={unlocked ? '#FFF9E8' : '#C3BFC8'} line={line} />
    </Svg>
  );
}

export const RegionMascot = memo(RegionMascotComponent);
