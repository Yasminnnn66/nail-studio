const express = require('express')
const path = require('path')
const { iniciarLembretes } = require('./lembretes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '..', 'frontend')))

app.use('/api', require('./routes/agendamentos'))
app.use('/api/painel', require('./routes/painel'))

app.get('/painel', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'painel.html'))
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`\n💅 Nail Studio — Servidor rodando!`)
  console.log(`   Site:    http://localhost:${PORT}`)
  console.log(`   Painel:  http://localhost:${PORT}/painel\n`)
  iniciarLembretes()
})
