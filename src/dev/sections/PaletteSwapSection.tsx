import { useMemo } from 'react';
import { NIGHT_CSS_FILTER, REGIONS, type Region } from '../../config';
import { getAllAssets } from '../../render/assets';
import { getAssetRegionPalette, getDistantBgId } from '../../render/region';
import { PixelSprite } from '../../render/PixelSprite';
import { getTerrainAssetsByRegion } from '../../render/terrainAssets';
import { MOB_ITEM_PAIRS } from '../common';

type Props = {
  isNight: boolean;
};

const SPRITE_SIZE = 52;

const REGION_LABEL: Record<Region, string> = {
  warm: 'warm (TS평원)',
  desert: 'desert (Java사막)',
  cold: 'cold (JS설원)',
};

const MOB_SHORT_LABEL: Record<string, string> = {
  'mob-grass-slime-64': '슬라임',
  'mob-moss-golem-64': '골렘',
  'mob-stone-shell-turtle-64': '거북',
  'mob-field-boar-64': '멧돼지',
  'mob-mist-fox-64': '여우',
  'mob-nightshade-wolf-64': '늑대',
  'mob-blood-bat-swarm-64': '박쥐',
  'mob-wandering-skeleton-64': '해골',
  'mob-mimic-64': '미믹',
};

const ITEM_SHORT_LABEL: Record<string, string> = {
  'item-jelly-64': '젤리',
  'item-stone-griddle-64': '돌판',
  'item-shell-shard-64': '등껍질',
  'item-boar-tusk-64': '엄니',
  'item-fox-tail-fur-64': '꼬리털',
  'item-wolf-fang-64': '송곳니',
  'item-bat-wing-64': '날개',
  'item-bone-fragment-64': '뼛조각',
  'item-mimic-lock-64': '자물쇠',
};

const MISSION_ORDER = [
  'mission-jelly-128',
  'mission-stone-griddle-128',
  'mission-shell-shard-128',
  'mission-boar-tusk-128',
  'mission-fox-tail-fur-128',
  'mission-wolf-fang-128',
  'mission-bat-wing-128',
  'mission-bone-fragment-128',
  'mission-mimic-lock-128',
];

type ColumnDef = {
  key: string;
  group: '배경' | '몹' | '아이템' | '지형';
  label: string;
  getAssetId: (region: Region) => string | null;
  usePaletteSwap: boolean;
};

export function PaletteSwapSection({ isNight }: Props) {
  const { columns, missionAssets } = useMemo(() => {
    const terrainByRegion = {
      warm: getTerrainAssetsByRegion('warm'),
      desert: getTerrainAssetsByRegion('desert'),
      cold: getTerrainAssetsByRegion('cold'),
    };
    const maxTerrainCount = Math.max(
      terrainByRegion.warm.length,
      terrainByRegion.desert.length,
      terrainByRegion.cold.length,
    );

    const cols: ColumnDef[] = [
      {
        key: 'distant-bg',
        group: '배경',
        label: '원경',
        getAssetId: (r) => getDistantBgId(r),
        usePaletteSwap: false,
      },
      {
        key: 'field-path',
        group: '배경',
        label: '길 바닥',
        getAssetId: () => 'bg-field-path-128',
        usePaletteSwap: true,
      },
      ...MOB_ITEM_PAIRS.map(([mobId]) => ({
        key: mobId,
        group: '몹' as const,
        label: MOB_SHORT_LABEL[mobId] ?? mobId,
        getAssetId: () => mobId,
        usePaletteSwap: true,
      })),
      ...MOB_ITEM_PAIRS.map(([, itemId]) => ({
        key: itemId,
        group: '아이템' as const,
        label: ITEM_SHORT_LABEL[itemId] ?? itemId,
        getAssetId: () => itemId,
        usePaletteSwap: true,
      })),
      ...Array.from({ length: maxTerrainCount }, (_, idx) => ({
        key: `terrain-${idx}`,
        group: '지형' as const,
        label: `지형 ${idx + 1}`,
        getAssetId: (r: Region) => terrainByRegion[r][idx]?.id ?? null,
        usePaletteSwap: false,
      })),
    ];

    const missions = getAllAssets()
      .filter((a) => a.id.startsWith('mission-'))
      .sort((a, b) => {
        const ia = MISSION_ORDER.indexOf(a.id);
        const ib = MISSION_ORDER.indexOf(b.id);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.id.localeCompare(b.id);
      });

    return { columns: cols, missionAssets: missions };
  }, []);

  const cellStyle: React.CSSProperties = {
    border: '1px solid #cbd5e1',
    padding: '6px',
    textAlign: 'center',
    verticalAlign: 'middle',
    minWidth: '68px',
    background: '#1e293b',
  };

  return (
    <section style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>
        에셋 팔레트 스왑 &amp; 지역별 비교 ({isNight ? '밤' : '낮'})
      </h2>
      <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
        행 순서: <strong>warm → desert → cold</strong> / 열 순서: 배경(2) · 몹(9) ·
        아이템(9) · 지형지물(10) = 총 {columns.length}열. 미션 에셋({missionAssets.length}종)은
        맨 아래 한 줄에 배치했습니다.
      </p>

      {/* 가로로 긴 지역 비교 테이블 */}
      <div
        style={{
          overflowX: 'auto',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          marginBottom: '28px',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            fontSize: '11px',
            width: 'max-content',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  background: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  padding: '8px 10px',
                  minWidth: '116px',
                  textAlign: 'left',
                }}
              >
                지역 / 분류
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    padding: '6px 4px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {col.group}
                  </div>
                  <div>{col.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REGIONS.map((region) => (
              <tr key={region}>
                <th
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    background: '#f8fafc',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    padding: '8px 10px',
                    textAlign: 'left',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {REGION_LABEL[region]}
                </th>
                {columns.map((col) => {
                  const assetId = col.getAssetId(region);
                  if (!assetId) {
                    return (
                      <td key={col.key} style={cellStyle}>
                        <span style={{ color: '#64748b' }}>-</span>
                      </td>
                    );
                  }
                  const palette = col.usePaletteSwap
                    ? getAssetRegionPalette(assetId, region)
                    : undefined;
                  return (
                    <td key={col.key} style={cellStyle} title={assetId}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          filter: isNight ? NIGHT_CSS_FILTER : undefined,
                        }}
                      >
                        <PixelSprite
                          id={assetId}
                          palette={palette}
                          width={SPRITE_SIZE}
                          height={SPRITE_SIZE}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 미션 에셋 한 줄 배치 */}
      <div>
        <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>
          미션 장면 에셋 ({missionAssets.length}종 · 단일 팔레트)
        </h3>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            padding: '12px',
            background: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          {missionAssets.map((asset) => (
            <div
              key={asset.id}
              title={asset.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
                padding: '6px',
                background: '#0f172a',
                borderRadius: '6px',
                border: '1px solid #334155',
              }}
            >
              <PixelSprite
                id={asset.id}
                width={SPRITE_SIZE}
                height={SPRITE_SIZE}
              />
              <span
                style={{
                  fontSize: '10px',
                  color: '#cbd5e1',
                  whiteSpace: 'nowrap',
                }}
              >
                {asset.id.replace(/^mission-/, '').replace(/-128$/, '')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
