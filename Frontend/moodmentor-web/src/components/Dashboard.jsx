import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Stat from './common/Stat'
import Reflection from './common/Reflection'
import Empty from './common/Empty'
import { icon } from '../App'

export default function Dashboard({ data, onNavigateJournal }) {
  const summary = data.summary
  const dist = data.distribution?.dominant_counts || {}
  const leading = summary?.most_frequent_emotion

  // Preview data shown only before the first real reflection
 const sampleTrends = [
  { date: '2026-08-01', avg_valence: 0.2 },
  { date: '2026-08-04', avg_valence: -0.15 },
  { date: '2026-08-07', avg_valence: 0.35 },
  { date: '2026-08-10', avg_valence: 0.05 },
  { date: '2026-08-13', avg_valence: 0.55 },
  { date: '2026-08-16', avg_valence: -0.1 },
  { date: '2026-08-19', avg_valence: 0.4 },
  { date: '2026-08-22', avg_valence: 0.7 },
  { date: '2026-08-25', avg_valence: 0.25 },
  { date: '2026-08-28', avg_valence: 0.6 },
]

  return (
    <>
      <section className="welcome">
        <div>
          <p className="eyebrow">TODAY'S CHECK-IN</p>
          <h2>How are you feeling, really?</h2>
          <p>There is no right answer. A few honest words are enough.</p>
          <button className="primary" onClick={onNavigateJournal}>
            Write a reflection →
          </button>
        </div>

        <div className="welcome-mood">
          <img
            src="/images/employee-hero.svg"
            alt="Employee wellness"
            className="employee-hero"
          />

          <div className="welcome-mood-text">
            <span>{leading ? icon(leading) : '🌿'}</span>
            <b>
              {leading ? `${leading} has been showing up` : 'A calm moment for you'}
            </b>
          </div>
        </div>
      </section>

      <section className="stats">
        <Stat
          value={summary?.streak_days ?? '–'}
          label="🔥 Day streak"
          detail="Keep showing up"
        />

        <Stat
          value={summary?.total_entries ?? '–'}
          label="📝 Reflections"
          detail="Moments of clarity"
        />

        <Stat
          value={leading ? icon(leading) : '–'}
          label="💜 Common feeling"
          detail={leading || 'Not enough data yet'}
        />

        <Stat
          value={
            summary?.trend === 'improving'
              ? '↗'
              : summary?.trend === 'declining'
                ? '↘'
                : '→'
          }
          label="📈 Recent trend"
          detail={summary?.trend || 'steady'}
        />
      </section>

      <section className="grid-two">

        {/* MOOD RHYTHM */}
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">MOOD RHYTHM</p>
              <h3>Your last 30 days</h3>
            </div>

            <span className="badge">valence</span>
          </div>

          <div className="chart">

            {/* REAL ANALYZED DATA */}
            {data.trends.length ? (
              <ResponsiveContainer>
                <AreaChart data={data.trends}>
                  <defs>
                    <linearGradient
                      id="mood"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        stopColor="#7566ee"
                        stopOpacity=".32"
                      />
                      <stop
                        offset="1"
                        stopColor="#7566ee"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    stroke="#edf0f7"
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={d => d.slice(5)}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={[-1, 1]}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="avg_valence"
                    stroke="#6956e8"
                    strokeWidth={3}
                    fill="url(#mood)"
                    
                  />
                </AreaChart>
              </ResponsiveContainer>

            ) : (

              /* SAMPLE PREVIEW */
              <div className="mood-preview">
                <div className="preview-label">
                  Preview · Your mood rhythm
                </div>

                <ResponsiveContainer>
                  <AreaChart data={sampleTrends}>
                    <defs>
                      <linearGradient
                        id="sampleMood"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          stopColor="#7566ee"
                          stopOpacity=".25"
                        />
                        <stop
                          offset="1"
                          stopColor="#7566ee"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      vertical={false}
                      stroke="#edf0f7"
                    />

                    <XAxis
                      dataKey="date"
                      tick={false}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: "Time",
                        position: "insideBottom",
                        offset: -5,
                        style: { fill: "#8b7ed8", fontSize: 12 }
                       }}
                      />

                    <YAxis
                      domain={[-1, 1]}
                      tick={false}
                      tickLine={false}
                      axisLine={false}
                      label={{
                         value: "Mood",
                         angle: -90,
                         position: "insideLeft",
                         style: { fill: "#8b7ed8", fontSize: 12 }
                        }}
                     />
                    

                    <Area
                      type="monotone"
                      dataKey="avg_valence"
                      stroke="#6956e8"
                      strokeWidth={3}
                      fill="url(#sampleMood)"
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                
              </div>
            )}

          </div>
        </article>

        {/* EMOTIONAL MIX */}
        <article className="panel">
          <p className="eyebrow">EMOTIONAL MIX</p>
          <h3>What has been present</h3>

          <div className="emotion-list">
            {Object.keys(dist).length ? (
              Object.entries(dist)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => (
                  <div key={name}>
                    <span>
                      {icon(name)} {name}
                    </span>

                    <div className="meter">
                      <i
                        style={{
                          width: `${count / Math.max(...Object.values(dist)) * 100}%`
                        }}
                      />
                    </div>

                    <b>{count}</b>
                  </div>
                ))
            ) : (
              <Empty text="Your emotional mix will grow with each check-in." />
            )}
          </div>
        </article>

      </section>

      {/* RECENT REFLECTIONS */}
      <article className="panel recent">
        <div className="panel-head">
          <div>
            <p className="eyebrow">RECENT REFLECTIONS</p>
            <h3>Moments you have named</h3>
          </div>
        </div>

        {data.history.length ? (
          data.history.map(entry => (
            <Reflection
              key={entry.id}
              entry={entry}
            />
          ))
        ) : (
          <Empty text="Your reflections will live here, privately." />
        )}
      </article>
    </>
  )
}