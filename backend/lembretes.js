const cron = require('node-cron')
const { queries } = require('./database')

function iniciarLembretes() {
  cron.schedule('0 18 * * *', async () => {
    console.log('\n📅 [CRON] Verificando agendamentos de amanhã...')
    const amanha = await queries.getAmanha()
    if (amanha.length === 0) {
      console.log('   Nenhum agendamento amanhã.')
      return
    }
    amanha.forEach(ag => {
      const mensagem =
        `Olá ${ag.nome}! \n` +
        `Lembrando do seu agendamento amanhã:\n\n` +
        `📌 Serviço: ${ag.servico}\n` +
        `🕐 Horário: ${ag.hora}\n\n` +
        `Te esperamos! Para cancelar, responda esta mensagem.`

      // Integrar WhatsApp aqui (Baileys ou Meta API)
      console.log(` Lembrete para ${ag.nome} (${ag.telefone}): ${ag.hora}`)
    })
    console.log(`   Total: ${amanha.length} lembrete(s).\n`)
  }, { timezone: 'America/Sao_Paulo' })

  console.log('Lembretes automáticos ativados (todo dia às 18h)')
}

module.exports = { iniciarLembretes }
