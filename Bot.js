const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

// Configuração do Bot
const bot = mineflayer.createBot({
  host: 'kamaga321.aternos.me',
  port: 11324,
  username: 'SimpleBot'
});

bot.loadPlugin(pathfinder);

// Inicialização
bot.on('spawn', () => {
  console.log('Bot conectado!');
  cicloPrincipal();
});

// Ciclo Principal
async function cicloPrincipal() {
  while (true) {
    const acao = gerarAcao();
    const sucesso = await executarAcao(acao);
    if (sucesso) {
      bot.chat(`Ação realizada com sucesso: ${acao.verbo} ${acao.objeto}`);
    } else {
      bot.chat(`Falha na ação: ${acao.verbo} ${acao.objeto}`);
    }
    await new Promise(resolve => setTimeout(resolve, 5000)); // Pausa para evitar sobrecarga
  }
}

// Gera Ações Simples
function gerarAcao() {
  const verbos = ['andar', 'construir', 'coletar'];
  const objetos = ['madeira', 'pedra', 'casa'];
  const verbo = verbos[Math.floor(Math.random() * verbos.length)];
  const objeto = objetos[Math.floor(Math.random() * objetos.length)];

  return { verbo, objeto };
}

// Executa Ações
async function executarAcao(acao) {
  try {
    switch (acao.verbo) {
      case 'andar':
        bot.pathfinder.setGoal(new goals.GoalNear(bot.entity.position.x + 5, bot.entity.position.y, bot.entity.position.z, 1));
        return true;

      case 'construir':
        await construirBloco(acao.objeto);
        return true;

      case 'coletar':
        return coletarItem(acao.objeto);

      default:
        return false;
    }
  } catch (erro) {
    console.log(`Erro ao executar ação: ${erro.message}`);
    return false;
  }
}

// Função para Construir Blocos Simples
async function construirBloco(bloco) {
  const blocoId = bot.registry.blocksByName[bloco]?.id;
  if (blocoId) {
    const blocoPos = bot.findBlock({ matching: blocoId });
    if (blocoPos) {
      await bot.placeBlock(blocoPos, bot.entity.position.offset(0, 1, 0));
    }
    return true;
  }
  return false;
}

// Função para Coletar Itens
async function coletarItem(item) {
  const itemEntity = bot.nearestEntity((entity) => entity.name === item);
  if (itemEntity) {
    bot.chat(`Coletando ${itemEntity.displayName}`);
    return true;
  }
  return false;
}

// Comunicação simples entre bots
bot.on('chat', (username, message) => {
  if (username !== bot.username) {
    bot.chat(`Recebido de ${username}: ${message}`);
  }
});
