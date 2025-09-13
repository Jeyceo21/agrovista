const express = require('express')
const cors = require('cors')
const fs = require('fs')
const csv = require('csv-parser')

const app = express()
const port = 4000

app.use(cors())
app.use(express.json())

// Home page route
app.get('/', (req, res) => {
    res.send(`
        <h1>AgroVista API Server</h1>
        <p>Server is running successfully!</p>
        <p>API endpoint: <a href="http://localhost:${port}/api/summary">/api/summary</a></p>
        <p>Trends endpoint: <a href="http://localhost:${port}/api/trends">/api/trends</a></p>
    `)
})

// ✅ Dynamic summary: reads latest row from CSV
app.get('/api/summary', (req, res) => {
    const results = []
    fs.createReadStream('data.csv')
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => {
        if (results.length === 0) {
            return res.json({ error: "No data in CSV" })
        }

        const latest = results[results.length - 1]  // last row
        const moisture = parseFloat(latest.moisture)
        const ph = parseFloat(latest.ph)
        const pestProb = parseFloat(latest.pest_prob)
        const temp = parseFloat(latest.temp)

        const summary = {
            cropHealth: { 
                status: moisture > 25 ? 'Healthy' : 'Stressed', 
                scoreText: `NDVI ${latest.ndvi}`, 
                color: moisture > 25 ? 'green' : 'red' 
            },
            soil: { 
                health: ph >= 6 && ph <= 7 ? 'Good' : 'Poor', 
                summary: `Moisture ${moisture}%, pH ${ph}`, 
                color: ph >= 6 && ph <= 7 ? 'green' : 'yellow' 
            },
            pest: { 
                risk: pestProb > 0.5 ? 'High' : pestProb > 0.3 ? 'Medium' : 'Low', 
                probText: `${(pestProb*100).toFixed(0)}%`, 
                color: pestProb > 0.5 ? 'red' : pestProb > 0.3 ? 'yellow' : 'green' 
            },
            weather: { 
                temp: temp, 
                desc: temp > 33 ? 'Hot' : temp < 25 ? 'Cool' : 'Normal' 
            },
            recommendations: {
                irrigation: moisture < 25 ? 'Irrigation recommended' : 'No irrigation needed',
                fertilization: ph < 6 ? 'Apply lime to raise pH' : ph > 7 ? 'Apply sulfur to lower pH' : 'Balanced',
                pest: pestProb > 0.5 ? 'Take immediate action' : 'Scout weekly'
            }
        }

        res.json(summary)
      })
})

// ✅ Endpoint: full sensor trends from CSV
app.get('/api/trends', (req, res) => {
    const results = []
    fs.createReadStream('data.csv')
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => {
        res.json(results)
      })
})

app.listen(port, () => console.log(`AgroVista server running at http://localhost:${port}`))
