# Cartão do conteúdo

Tudo o que o app tem. Nada desta lista pode sumir sem o Paulo pedir.

## Regras

1. **Nada é apagado sem o Paulo pedir.** Isso vale para perguntas, histórias, jogos, capítulos, termos, práticas, temas, matérias, botões e partes da tela.
2. **Para tirar uma pergunta do simulado, ela é guardada, não apagada.** Ela vai para `materias/arquivo/<matéria>.json`. Sai da prova, mas continua no projeto e pode voltar.
3. **Antes de cada commit, a trava confere tudo.** Ela roda sozinha (`.githooks/pre-commit`) e bloqueia o commit se alguma coisa diminuiu ou sumiu, ou se o verificador de perguntas achou erro.
4. **Conteúdo novo atualiza este cartão.** Depois de acrescentar, rode `node ferramentas/inventario.js --atualizar` e commite junto o `CONTEUDO.md` e o `ferramentas/inventario.json`.
5. **Perguntas só do material que o Paulo mandou.** Matéria sem PDF fica como está até o material chegar.
6. **Todo PDF novo vira `.md` antes de qualquer coisa.** Ele é salvo em `material/<matéria>/` (PDF + `.md`) e registrado em `material/README.md`, com o que foi criado a partir dele.

## O que cada matéria tem

<!-- inventario:inicio -->
_Contagem de 25/11/2026, gerada por `node ferramentas/inventario.js --atualizar`._

| Matéria | Perguntas no simulado | Guardadas (fora do simulado) | Revisão | Livro | Histórias | Jogos | Termos | Práticas |
|---|---|---|---|---|---|---|---|---|
| Design Front End | 396 | 0 | 0 | 0 | 2 | 3 | 0 | 0 |
| Programação de Computadores | 733 | 0 | 10 | 10 | 7 | 8 | 14 | 20 |
| Engenharia de Requisitos | 531 | 0 | 7 | 9 | 10 | 8 | 16 | 11 |
| Fundamentos de Redes | 1031 | 0 | 16 | 15 | 11 | 9 | 25 | 25 |
| Testing, Compliance e QA | 336 | 0 | 0 | 0 | 2 | 3 | 0 | 0 |
| Pensamento Computacional | 582 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| Linguagem e Interação | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Cybersegurança | 252 | 0 | 0 | 5 | 2 | 4 | 0 | 5 |
| Direito Digital | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Desenvolvimento para Internet | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Ambientação Tech | 387 | 0 | 0 | 4 | 2 | 4 | 0 | 6 |

Perguntas por tema:

- **Design Front End:** ihc 33, heuristicas 123, norman 79, visual 140, avaliacao 21
- **Programação de Computadores:** logica 17, selecao 31, operadores 60, repeticao 66, for 64, dowhile 68, strings 105, arrays 71, matrizes 79, classes 51, metodos 65, parametros 56
- **Engenharia de Requisitos:** processo 4, tipos 5, metodologias 5, casosdeuso 298, historias 40, validacao 179
- **Fundamentos de Redes:** modelos 6, arquitetura 6, enlace 3, meios 3, rede 458, transporte 287, aplicacao 163, integradora 7, status 98
- **Testing, Compliance e QA:** tipos 106, tecnicas 130, praticas 46, qualidade 15, principios 18, compliance 21
- **Pensamento Computacional:** portugol 312, fluxo 61, logica 166, pc 43
- **Linguagem e Interação:** 
- **Cybersegurança:** firewall 14, regras 83, waf 23, dmz 7, lateral 37, ids 10, desafios 53, profundidade 25
- **Direito Digital:** 
- **Desenvolvimento para Internet:** 
- **Ambientação Tech:** arquivos 11, metadados 103, alocacao 61, vm 9, recursos 24, snapshot 46, redeip 39, diag 60, revredes 34
<!-- inventario:fim -->

## Material recebido (PDFs)

- **Onde fica:** todo PDF que o Paulo manda fica em `material/<matéria>/`, com o PDF original e um `.md` com o texto. A lista do que foi criado a partir de cada um está em `material/README.md`.
- **Fora do GitHub:** a pasta fica fora do GitHub, porque o repositório é público e as provas têm nome e notas. O OneDrive guarda uma cópia, e a trava do commit confere que nenhum desses arquivos sumiu.
- **O que tem:** 45 PDFs (provas oficiais, slides, aulas, trabalhos, exercícios e os 2 resumos de 24/11) e as 3 aulas de Redes do portal do Prof. Patrick.
- **Conserto de 25/11/2026:** os 43 PDFs de 20/11 estavam com 0 byte e foram devolvidos. A trava do commit agora acusa arquivo vazio.

## Telas e botões que existem

- **Topo:** uma aba para cada matéria, separadas em 2º período e 1º período.
- **Tela inicial da matéria:**
  - professor e título;
  - núcleo com a porcentagem já vista;
  - painel de estudo (perguntas já vistas, para revisar e melhor nota);
  - caixa "O que estudar para a próxima prova";
  - botão "Ler em voz alta";
  - as partes: Revisão (Programação, Requisitos e Redes), Livro, Perguntas, Histórias, Jogos e Praticar.
- **Perguntas:**
  - chips "Com Cronômetro", "Dashboard de Notas" e "Sons Interativos";
  - temas especiais: Tudo misturado, Só as que errei (aparece quando há erros) e Contas novas (só em Redes);
  - temas por bimestre;
  - caixa "Qual conteúdo?", com as partes de cada tema (168 no total), como TTL, NAT, substring ou Include e extend;
  - rodadas de 5, 10, 15, 20, 30, 50, 100 ou todas;
  - barra com o resumo da rodada e o botão "Iniciar prova";
  - quantidade de perguntas e barrinha do já visto em cada tema.
- **Durante a prova:**
  - contador e cronômetro, com a barra de progresso;
  - botões "Ouvir a pergunta" e "Responder falando";
  - explicação depois de responder;
  - botões Próxima, Pular, Início e Abandonar.
- **Resultado:**
  - nota, acertos, erros e tempo;
  - gráfico da evolução, progresso por tema e revisão dos erros;
  - botões Compartilhar, Revisar erros, Repetir mesma prova, Nova rodada e Voltar ao menu.
- **Revisão:** assuntos da prova que abrem e fecham, com tabelas, códigos, "Cuidado na prova", perguntas rápidas com resposta escondida, botão "Treinar este assunto" (até 10 perguntas), caixinha "Já sei" e "Simulado da revisão" de 20 questões.
- **Jogos:** "Certo ou errado?", montado sozinho a partir das perguntas, mais os jogos de classificar e de ordenar de cada matéria.
- **Praticar:** "Falar os termos" (com voz) e "Digitar a resposta".
- **Sem internet:** o app funciona offline e se atualiza sozinho quando sai versão nova.

## Matérias

- **Abas atuais:** as 5 do 2º bimestre (Design Front End, Programação de Computadores, Engenharia de Requisitos, Fundamentos de Redes e Testing, Compliance e QA) e Pensamento Computacional (1º período).
- **Pensamento Computacional:** veio da "Plataforma de Estudos ADS" (`Documents/plataforma-estudos`, setembro de 2026), sem mudar o texto. São 577 perguntas, mais as 5 da revisão da prova anterior (também como capítulo do livro) e as 6 dicas (capítulo do livro). As 12 perguntas de Java desse app entraram em Programação. As perguntas importadas têm o campo `origem`.
- **Variações (21/11/2026):** para Programação, Redes e Requisitos chegarem a 500, como Pensamento, entraram perguntas do mesmo tipo com valores trocados, só com os assuntos do material. **Programação:** 332 de "o que este código imprime?" (Aulas 8 a 16), todas compiladas e executadas no Java antes de entrar. **Redes:** 319 contas fixas, das mesmas que a rodada "contas" sorteia (sub-rede, TTL, IPv6, TCP). **Requisitos:** 376 com os conceitos dos slides 05 e 06 (include, extend, exceção, cenário principal, generalização e as 7 técnicas) aplicados a 19 sistemas de exemplo. Os sistemas das atividades do Classroom ficaram de fora. Design e Testing seguem como estão até chegar o material do 2º bimestre.
- **Conteúdo de 25/11/2026:** 127 perguntas em Programação (conceito, sintaxe e os códigos dos slides, executados no Java), 50 em Redes (26 no tema novo “Grupos HTTP · 1xx a 5xx”) e 31 em Requisitos (figuras e pegadinhas do resumão). Mais um capítulo de livro em cada uma, 8 jogos e 16 práticas.
- **Fora por pedido do Paulo (20/11/2026):** Labs Tools I, Diversidade Cultural e Extensão II.
- **Variações de 25/11/2026:** 1.589 perguntas novas com os conceitos do material e situações ou números novos: Redes +481, Design +293, Ambientação Tech +297, Testing +229, Cybersegurança +183 e Programação +106 (executadas no Java).
- **1º período (25/11/2026):** Cybersegurança (Aula 08 do portal) e Ambientação Tech (Aulas 06 a 09 do portal) com conteúdo. Linguagem e Interação, Direito Digital e Desenvolvimento para Internet têm aba, mas aguardam o material do Paulo: sem perguntas inventadas.

## Histórico de remoções

| Data | O que saiu | Onde está agora |
|---|---|---|
| 05/11/2026 | Aba "Engenharia de Software" (vazia, sem perguntas: é o nome do curso, não uma matéria) | Apagada a pedido do Paulo |
| 20/11/2026 | 18 perguntas de Programação que cobravam assuntos fora dos slides | Voltaram para o simulado no mesmo dia, a pedido do Paulo ("era criar mais, não deletar o que já tinha") |
| 20/11/2026 | (nada saiu) Entraram a aba Pensamento Computacional e 12 perguntas de Java, vindas da Plataforma de Estudos ADS | `materias/pensamento.json` e `materias/programacao.json` |
| 25/11/2026 | (nada saiu) Entraram 1.589 perguntas (variações) em seis matérias | `materias/*.json` |
| 25/11/2026 | (nada saiu) Entraram 5 abas do 1º período e o visual futurista | `materias/*.json`, `css/futuro.css` |
| 25/11/2026 | (nada saiu) Cada pergunta ganhou o campo `assunto` (168 conteúdos) e o app ganhou o visual dourado | `materias/*.json`, `css/ouro.css` |
| 25/11/2026 | (nada saiu) Entrou a aba Revisão em Programação (10 assuntos), Requisitos (7) e Redes (16, com números diferentes dos do trabalho) | campo `revisao` em `materias/*.json` |
| 25/11/2026 | (nada saiu) Entraram 208 perguntas, 3 capítulos, 8 jogos e 16 práticas em Programação, Redes e Requisitos | `materias/programacao.json`, `materias/redes.json` e `materias/requisitos.json` |
| 21/11/2026 | (nada saiu) Entraram 332 perguntas em Programação, 319 em Redes e 376 em Requisitos (variações; cada uma chegou a 500) | `materias/programacao.json`, `materias/redes.json` e `materias/requisitos.json` |
