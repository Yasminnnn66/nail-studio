const express = require('express')
const router = express.Router()
const { queries } = require('../database')

const TODOS_HORARIOS = [
  '09:00', '10:00', '11:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
]

// Converte "HH:MM" em minutos
function toMin(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// Retorna todos os horários da lista que um serviço ocupa
// dado o horário de início e duração em minutos
function horariosOcupados(horaInicio, duracaoMin) {
  const inicio = toMin(horaInicio)
  const fim = inicio + duracaoMin
  return TODOS_HORARIOS.filter(h => {
    const t = toMin(h)
    return t >= inicio && t < fim
  })
}

// Calcula quais horários estão bloqueados considerando a duração dos serviços
function calcularOcupados(agendamentos, bloqueados) {
  const ocupados = new Set(bloqueados)
  for (const ag of agendamentos) {
    const durMin = parseInt((ag.duracao || '60').replace(/\D/g, '')) || 60
    horariosOcupados(ag.hora, durMin).forEach(h => ocupados.add(h))
  }
  return ocupados
}

router.get('/horarios/:data', async (req, res) => {
  try {
    const { data } = req.params
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return res.status(400).json({ erro: 'Formato de data inválido. Use YYYY-MM-DD' })
    }
    const agendamentos = await queries.getByData(data)
    const bloqueados   = (await queries.getBloqueados(data)).map(r => r.hora)
    const ocupados     = calcularOcupados(agendamentos, bloqueados)
    const horarios     = TODOS_HORARIOS.map(hora => ({ hora, disponivel: !ocupados.has(hora) }))
    res.json({ data, horarios })
  } catch (err) {
    console.error('Erro ao buscar horários:', err)
    res.status(500).json({ erro: 'Erro interno' })
  }
})

router.post('/agendar', async (req, res) => {
  try {
    const { nome, telefone, servico, preco, duracao, data, hora, obs } = req.body
    if (!nome || !telefone || !servico || !data || !hora) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' })
    }
    const agendamentos = await queries.getByData(data)
    const bloqueados   = (await queries.getBloqueados(data)).map(r => r.hora)
    const ocupados     = calcularOcupados(agendamentos, bloqueados)

    // Verifica se o novo agendamento conflita com os existentes
    const duracaoMin = parseInt((duracao || '60').replace(/\D/g, '')) || 60
    const novosHorarios = horariosOcupados(hora, duracaoMin)
    const temConflito = novosHorarios.some(h => ocupados.has(h))

    if (temConflito) {
      return res.status(409).json({ erro: 'Horário não está mais disponível' })
    }
    const resultado = await queries.inserir({
      nome: nome.trim(), telefone: telefone.trim(),
      servico, preco: preco || '', duracao: duracao || '',
      data, hora, obs: obs || ''
    })
    res.json({ ok: true, id: resultado.lastInsertRowid, mensagem: `Agendado! ${nome}, te esperamos dia ${data} às ${hora}.` })
  } catch (err) {
    console.error('Erro ao agendar:', err)
    res.status(500).json({ erro: 'Erro interno ao salvar agendamento' })
  }
})

router.delete('/agendar/:id', async (req, res) => {
  try {
    await queries.cancelar(req.params.id)
    res.json({ ok: true, mensagem: 'Agendamento cancelado' })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cancelar' })
  }
})

module.exports = router
