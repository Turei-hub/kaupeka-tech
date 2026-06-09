export default function RootsBg() {
  const teal = '#1D9E75'
  const blue = '#185FA5'

  /* Dot at a junction or endpoint */
  const Dot = ({ cx, cy, r = 4, color = teal }) => (
    <circle cx={cx} cy={cy} r={r} fill={color} />
  )

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none select-none"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.09 }}
      viewBox="0 0 1440 960"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
    >
      {/* ══════════════════════════════════════════
          TRUNK
      ══════════════════════════════════════════ */}
      <line x1="720" y1="980" x2="720" y2="580" stroke={teal} strokeWidth="5" />
      <Dot cx={720} cy={580} r={7} />

      {/* ══════════════════════════════════════════
          LEVEL 1  —  first major fork at y=580
      ══════════════════════════════════════════ */}
      {/* Left arm */}
      <line x1="720" y1="580" x2="440" y2="580" stroke={teal} strokeWidth="4" />
      <line x1="440" y1="580" x2="440" y2="440" stroke={teal} strokeWidth="4" />
      <Dot cx={440} cy={440} r={6} />
      {/* Right arm */}
      <line x1="720" y1="580" x2="1000" y2="580" stroke={teal} strokeWidth="4" />
      <line x1="1000" y1="580" x2="1000" y2="440" stroke={teal} strokeWidth="4" />
      <Dot cx={1000} cy={440} r={6} />

      {/* ══════════════════════════════════════════
          LEVEL 2  —  fork at y=440
      ══════════════════════════════════════════ */}
      {/* Left-left */}
      <line x1="440" y1="440" x2="240" y2="440" stroke={teal} strokeWidth="3" />
      <line x1="240" y1="440" x2="240" y2="300" stroke={teal} strokeWidth="3" />
      <Dot cx={240} cy={300} r={5} />
      {/* Left-right */}
      <line x1="440" y1="440" x2="600" y2="440" stroke={teal} strokeWidth="3" />
      <line x1="600" y1="440" x2="600" y2="320" stroke={teal} strokeWidth="3" />
      <Dot cx={600} cy={320} r={5} />
      {/* Right-left */}
      <line x1="1000" y1="440" x2="840" y2="440" stroke={teal} strokeWidth="3" />
      <line x1="840" y1="440" x2="840" y2="320" stroke={teal} strokeWidth="3" />
      <Dot cx={840} cy={320} r={5} />
      {/* Right-right */}
      <line x1="1000" y1="440" x2="1200" y2="440" stroke={teal} strokeWidth="3" />
      <line x1="1200" y1="440" x2="1200" y2="300" stroke={teal} strokeWidth="3" />
      <Dot cx={1200} cy={300} r={5} />

      {/* ══════════════════════════════════════════
          LEVEL 3
      ══════════════════════════════════════════ */}
      {/* From 240,300 → far-left branch */}
      <line x1="240" y1="300" x2="120" y2="300" stroke={teal} strokeWidth="2" />
      <line x1="120" y1="300" x2="120" y2="180" stroke={teal} strokeWidth="2" />
      <Dot cx={120} cy={180} r={4} />
      {/* From 240,300 → inner-left branch */}
      <line x1="240" y1="300" x2="320" y2="300" stroke={teal} strokeWidth="2" />
      <line x1="320" y1="300" x2="320" y2="200" stroke={teal} strokeWidth="2" />
      <Dot cx={320} cy={200} r={4} />

      {/* From 600,320 → left tip */}
      <line x1="600" y1="320" x2="500" y2="320" stroke={teal} strokeWidth="2" />
      <line x1="500" y1="320" x2="500" y2="200" stroke={teal} strokeWidth="2" />
      <Dot cx={500} cy={200} r={4} />
      {/* From 600,320 → right tip */}
      <line x1="600" y1="320" x2="680" y2="320" stroke={teal} strokeWidth="2" />
      <line x1="680" y1="320" x2="680" y2="200" stroke={teal} strokeWidth="2" />
      <Dot cx={680} cy={200} r={4} />

      {/* From 840,320 → left tip */}
      <line x1="840" y1="320" x2="760" y2="320" stroke={teal} strokeWidth="2" />
      <line x1="760" y1="320" x2="760" y2="200" stroke={teal} strokeWidth="2" />
      <Dot cx={760} cy={200} r={4} />
      {/* From 840,320 → right tip */}
      <line x1="840" y1="320" x2="920" y2="320" stroke={teal} strokeWidth="2" />
      <line x1="920" y1="320" x2="920" y2="200" stroke={teal} strokeWidth="2" />
      <Dot cx={920} cy={200} r={4} />

      {/* From 1200,300 → inner-right branch */}
      <line x1="1200" y1="300" x2="1120" y2="300" stroke={teal} strokeWidth="2" />
      <line x1="1120" y1="300" x2="1120" y2="200" stroke={teal} strokeWidth="2" />
      <Dot cx={1120} cy={200} r={4} />
      {/* From 1200,300 → far-right branch */}
      <line x1="1200" y1="300" x2="1320" y2="300" stroke={teal} strokeWidth="2" />
      <line x1="1320" y1="300" x2="1320" y2="180" stroke={teal} strokeWidth="2" />
      <Dot cx={1320} cy={180} r={4} />

      {/* ══════════════════════════════════════════
          LEVEL 4 — fine tips
      ══════════════════════════════════════════ */}
      {/* Far-left tips from 120,180 */}
      <line x1="120" y1="180" x2="60" y2="180" stroke={teal} strokeWidth="1.5" />
      <line x1="60" y1="180" x2="60" y2="100" stroke={teal} strokeWidth="1.5" />
      <Dot cx={60} cy={100} r={3} />
      <line x1="120" y1="180" x2="180" y2="180" stroke={teal} strokeWidth="1.5" />
      <line x1="180" y1="180" x2="180" y2="100" stroke={teal} strokeWidth="1.5" />
      <Dot cx={180} cy={100} r={3} />

      {/* Inner-left tips from 320,200 */}
      <line x1="320" y1="200" x2="280" y2="200" stroke={teal} strokeWidth="1.5" />
      <line x1="280" y1="200" x2="280" y2="120" stroke={teal} strokeWidth="1.5" />
      <Dot cx={280} cy={120} r={3} />
      <line x1="320" y1="200" x2="380" y2="200" stroke={teal} strokeWidth="1.5" />
      <line x1="380" y1="200" x2="380" y2="120" stroke={teal} strokeWidth="1.5" />
      <Dot cx={380} cy={120} r={3} />

      {/* Centre-left tips from 500,200 */}
      <line x1="500" y1="200" x2="460" y2="200" stroke={teal} strokeWidth="1.5" />
      <line x1="460" y1="200" x2="460" y2="120" stroke={teal} strokeWidth="1.5" />
      <Dot cx={460} cy={120} r={3} />
      <line x1="500" y1="200" x2="540" y2="200" stroke={teal} strokeWidth="1.5" />
      <line x1="540" y1="200" x2="540" y2="100" stroke={teal} strokeWidth="1.5" />
      <Dot cx={540} cy={100} r={3} />

      {/* Centre tips from 680/760,200 */}
      <line x1="680" y1="200" x2="640" y2="200" stroke={blue} strokeWidth="1.5" />
      <line x1="640" y1="200" x2="640" y2="110" stroke={blue} strokeWidth="1.5" />
      <Dot cx={640} cy={110} r={3} color={blue} />
      <line x1="680" y1="200" x2="720" y2="200" stroke={blue} strokeWidth="1.5" />
      <line x1="720" y1="200" x2="720" y2="100" stroke={blue} strokeWidth="1.5" />
      <Dot cx={720} cy={100} r={3} color={blue} />
      <line x1="760" y1="200" x2="800" y2="200" stroke={blue} strokeWidth="1.5" />
      <line x1="800" y1="200" x2="800" y2="110" stroke={blue} strokeWidth="1.5" />
      <Dot cx={800} cy={110} r={3} color={blue} />

      {/* Centre-right tips from 920,200 */}
      <line x1="920" y1="200" x2="880" y2="200" stroke={teal} strokeWidth="1.5" />
      <line x1="880" y1="200" x2="880" y2="100" stroke={teal} strokeWidth="1.5" />
      <Dot cx={880} cy={100} r={3} />
      <line x1="920" y1="200" x2="960" y2="200" stroke={teal} strokeWidth="1.5" />
      <line x1="960" y1="200" x2="960" y2="120" stroke={teal} strokeWidth="1.5" />
      <Dot cx={960} cy={120} r={3} />

      {/* Inner-right tips from 1120,200 */}
      <line x1="1120" y1="200" x2="1060" y2="200" stroke={teal} strokeWidth="1.5" />
      <line x1="1060" y1="200" x2="1060" y2="120" stroke={teal} strokeWidth="1.5" />
      <Dot cx={1060} cy={120} r={3} />
      <line x1="1120" y1="200" x2="1160" y2="200" stroke={teal} strokeWidth="1.5" />
      <line x1="1160" y1="200" x2="1160" y2="120" stroke={teal} strokeWidth="1.5" />
      <Dot cx={1160} cy={120} r={3} />

      {/* Far-right tips from 1320,180 */}
      <line x1="1320" y1="180" x2="1260" y2="180" stroke={teal} strokeWidth="1.5" />
      <line x1="1260" y1="180" x2="1260" y2="100" stroke={teal} strokeWidth="1.5" />
      <Dot cx={1260} cy={100} r={3} />
      <line x1="1320" y1="180" x2="1380" y2="180" stroke={teal} strokeWidth="1.5" />
      <line x1="1380" y1="180" x2="1380" y2="100" stroke={teal} strokeWidth="1.5" />
      <Dot cx={1380} cy={100} r={3} />

      {/* ══════════════════════════════════════════
          HORIZONTAL ROOTS at the base
      ══════════════════════════════════════════ */}
      {/* Left root */}
      <line x1="720" y1="760" x2="200" y2="760" stroke={teal} strokeWidth="2.5" />
      <line x1="200" y1="760" x2="200" y2="840" stroke={teal} strokeWidth="2.5" />
      <Dot cx={200} cy={840} r={5} />
      <line x1="200" y1="760" x2="60" y2="760" stroke={teal} strokeWidth="1.5" />
      <Dot cx={60} cy={760} r={4} />
      <line x1="400" y1="760" x2="400" y2="860" stroke={teal} strokeWidth="1.5" />
      <Dot cx={400} cy={860} r={4} />
      <Dot cx={400} cy={760} r={4} />

      {/* Right root */}
      <line x1="720" y1="760" x2="1240" y2="760" stroke={teal} strokeWidth="2.5" />
      <line x1="1240" y1="760" x2="1240" y2="840" stroke={teal} strokeWidth="2.5" />
      <Dot cx={1240} cy={840} r={5} />
      <line x1="1240" y1="760" x2="1400" y2="760" stroke={teal} strokeWidth="1.5" />
      <Dot cx={1400} cy={760} r={4} />
      <line x1="1040" y1="760" x2="1040" y2="860" stroke={teal} strokeWidth="1.5" />
      <Dot cx={1040} cy={860} r={4} />
      <Dot cx={1040} cy={760} r={4} />

      {/* Junction dots at key intersections */}
      <Dot cx={720} cy={760} r={5} />
      <Dot cx={720} cy={980} r={6} />
    </svg>
  )
}
