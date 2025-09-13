import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import 'chart.js/auto'

export default function App(){
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        <MainDashboard />
      </div>
    </div>
  )
}

function Header(){
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold">AV</div>
          <div>
            <h1 className="text-2xl font-semibold">AgroVista — Prototype</h1>
            <p className="text-sm text-slate-600">AI-powered crop, soil & pest monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select className="border rounded px-2 py-1">
            <option>English</option>
            <option>Tamil</option>
            <option>Hindi</option>
          </select>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded">Connect Sensors</button>
        </div>
      </div>
    </header>
  )
}

function MainDashboard(){
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    fetchSummary()
  }, [])

  async function fetchSummary(){
    setLoading(true)
    try{
      const res = await axios.get('http://localhost:4000/api/summary')
      setSummary(res.data)
    }catch(err){
      console.error(err)
      alert('Could not fetch data. Start backend with: node server/index.js')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8 space-y-6">
        <OverviewCard summary={summary} loading={loading} />
        <SensorTrends />   {/* ✅ New Chart Component */}
      </div>
      <div className="col-span-4">
        <InsightsCard summary={summary} />
      </div>
    </div>
  )
}

function OverviewCard({summary, loading}){
  return (
    <section className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Overview</h2>
      {loading && <div>Loading...</div>}
      {!loading && summary && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Crop Health" value={summary.cropHealth.status} hint={summary.cropHealth.scoreText} color={summary.cropHealth.color} />
          <StatCard title="Soil" value={summary.soil.health} hint={summary.soil.summary} color={summary.soil.color} />
          <StatCard title="Pest Risk" value={summary.pest.risk} hint={summary.pest.probText} color={summary.pest.color} />
          <StatCard title="Weather" value={`${summary.weather.temp}°C`} hint={summary.weather.desc} color="bg-slate-200" />
        </div>
      )}
    </section>
  )
}

function StatCard({title, value, hint, color}){
  return (
    <div className="p-3 rounded border"> 
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-bold">{value}</div>
        <div className={`badge ${color==='green'? 'bg-green-100 text-green-800' : color==='yellow'? 'bg-yellow-100 text-yellow-800' : color==='red'? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>{hint}</div>
      </div>
    </div>
  )
}

function InsightsCard({summary}){
  return (
    <section className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="font-semibold mb-2">Recommendations</h3>
      {!summary && <div>Loading...</div>}
      {summary && (
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-semibold">Irrigation</div>
            <div>{summary.recommendations.irrigation}</div>
          </div>
          <div>
            <div className="font-semibold">Fertilization</div>
            <div>{summary.recommendations.fertilization}</div>
          </div>
          <div>
            <div className="font-semibold">Pest Management</div>
            <div>{summary.recommendations.pest}</div>
          </div>
        </div>
      )}
    </section>
  )
}

function SensorTrends(){
  const [data, setData] = useState(null)

  useEffect(() => {
    axios.get("http://localhost:4000/api/trends")
      .then(res => setData(res.data))
      .catch(err => console.error(err))
  }, [])

  if(!data) return (
    <section className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Sensor Trends</h3>
      <div>Loading...</div>
    </section>
  )

  // Extract arrays from CSV rows
  const labels = data.map(row => row.date)
  const moisture = data.map(row => parseFloat(row.moisture))
  const ph = data.map(row => parseFloat(row.ph))
  const pest = data.map(row => parseFloat(row.pest_prob) * 100)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Soil Moisture %',
        data: moisture,
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.2)',
        yAxisID: 'y'
      },
      {
        label: 'Soil pH',
        data: ph,
        borderColor: 'rgb(59,130,246)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        yAxisID: 'y1'
      },
      {
        label: 'Pest Probability %',
        data: pest,
        borderColor: 'rgb(239,68,68)',
        backgroundColor: 'rgba(239,68,68,0.2)',
        yAxisID: 'y2'
      }
    ]
  }

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Moisture (%)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Soil pH' }
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Pest Probability (%)' }
      }
    }
  }

  return (
    <section className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Sensor Trends</h3>
      <Line data={chartData} options={options} />
    </section>
  )
}

