import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Stat from './common/Stat'
import Reflection from './common/Reflection'
import Empty from './common/Empty'
import { icon } from '../App'

export default function Dashboard({ data, onNavigateJournal }) {
  const summary = data.summary
  const dist = data.distribution?.dominant_counts || {}
  const leading = summary?.most_frequent_emotion

  return (
    <>
      <section className="welcome">
        <div>
          <p className="eyebrow">TODAY'S CHECK-IN</p>
          <h2>How are you feeling, really?</h2>
          <p>There is no right answer. A few honest words are enough.</p>
          <button className="primary" onClick={onNavigateJournal}>Write a reflection →</button>
        </div>
        <div className="welcome-mood">
          <span>{leading ? icon(leading) : '🌿'}</span>
          <b>{leading ? `${leading} has been showing up` : 'A calm moment for you'}</b>
          <small>{summary?.total_entries ? `${summary.total_entries} reflections recorded` : 'Your journey starts with one check-in.'}</small>
        </div>
      </section>
      
      <section className="stats">
        <Stat value={summary?.streak_days ?? '–'} label="Day streak" detail="Keep showing up" />
        <Stat value={summary?.total_entries ?? '–'} label="Reflections" detail="Moments of clarity" />
        <Stat value={leading ? icon(leading) : '–'} label="Common feeling" detail={leading || 'Not enough data yet'} />
        <Stat value={summary?.trend === 'improving' ? '↗' : summary?.trend === 'declining' ? '↘' : '→'} label="Recent trend" detail={summary?.trend || 'steady'} />
      </section>
      
      <section className="grid-two">
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">MOOD RHYTHM</p>
              <h3>Your last 30 days</h3>
            </div>
            <span className="badge">valence</span>
          </div>
          <div className="chart">
            {data.trends.length ? (
              <ResponsiveContainer>
                <AreaChart data={data.trends}>
                  <defs>
                    <linearGradient id="mood" x1="0" x2="0" y1="0" y2="1">
                      <stop stopColor="#7566ee" stopOpacity=".32"/>
                      <stop offset="1" stopColor="#7566ee" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#edf0f7"/>
                  <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tickLine={false} axisLine={false}/>
                  <YAxis domain={[-1, 1]} tickLine={false} axisLine={false}/>
                  <Tooltip/>
                  <Area type="monotone" dataKey="avg_valence" stroke="#6956e8" strokeWidth={3} fill="url(#mood)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty text="Your mood rhythm will appear after your first reflection." />
            )}
          </div>
        </article>
        
        <article className="panel">
          <p className="eyebrow">EMOTIONAL MIX</p>
          <h3>What has been present</h3>
          <div className="emotion-list">
            {Object.keys(dist).length ? (
              Object.entries(dist)
                .sort((a,b) => b[1]-a[1])
                .slice(0,5)
                .map(([name, count]) => (
                  <div key={name}>
                    <span>{icon(name)} {name}</span>
                    <div className="meter">
                      <i style={{ width: `${count / Math.max(...Object.values(dist)) * 100}%` }} />
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
      
      <article className="panel recent">
        <div className="panel-head">
          <div>
            <p className="eyebrow">RECENT REFLECTIONS</p>
            <h3>Moments you have named</h3>
          </div>
        </div>
        {data.history.length ? (
          data.history.map(entry => <Reflection key={entry.id} entry={entry} />)
        ) : (
          <Empty text="Your reflections will live here, privately." />
        )}
      </article>
    </>
  )
}
