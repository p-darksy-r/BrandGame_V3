# Progresso e recordes

A versão 3.3.0 introduz `progressSchema: 2`. A normalização conserva os pontos acumulados, níveis desbloqueados, definições e salas de versões anteriores. Os saves antigos não continham estrelas nem resultados individuais: esses resultados ficam desconhecidos até voltares a jogar, com uma indicação no menu e nos níveis.

`levelResults` guarda por categoria, número do nível e dificuldade: tentativas, conclusões aprovadas, melhores estrelas, melhor pontuação e menor tempo de jogo numa conclusão aprovada. `customResults` guarda o equivalente por identificador de sala; salas antigas sem ID usam um identificador derivado da posição existente. As melhores pontuações e os melhores tempos são métricas independentes e podem vir de partidas diferentes.

- Menos de 75% de acertos, ou partida não concluída: zero estrelas.
- Pelo menos 75%: uma estrela.
- Pelo menos 90%: duas estrelas.
- Todos os acertos: três estrelas.

O HUD soma o melhor número de estrelas de cada nível/sala, contando cada um apenas uma vez entre dificuldades. Criar uma sala não atribui estrelas. Uma repetição pior ou uma derrota não apaga um recorde anterior. Os pontos acumulados continuam a somar conclusões aprovadas, como nas versões anteriores; não são apresentados como se fossem o recorde do nível.

O tempo registado soma as rondas e exclui carregamento do logótipo, pausas e espera nos painéis de resposta. A gravação da conclusão é protegida contra chamadas repetidas. Campos inválidos de saves são normalizados e limitados antes de serem usados na interface.
