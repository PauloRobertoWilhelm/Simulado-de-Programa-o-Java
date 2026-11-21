# Cartão do conteúdo

Tudo o que o app tem. Nada desta lista pode sumir sem o Paulo pedir.

## Regras

1. **Nada é apagado sem o Paulo pedir.** Isso vale para perguntas, histórias, jogos, capítulos, termos, práticas, temas, matérias, botões e partes da tela.
2. **Para tirar uma pergunta do simulado, ela é guardada, não apagada.** Ela vai para `materias/arquivo/<matéria>.json`. Sai da prova, mas continua no projeto e pode voltar.
3. **Antes de cada commit, a trava confere tudo.** Ela roda sozinha (`.githooks/pre-commit`) e bloqueia o commit se alguma coisa diminuiu ou sumiu, ou se o verificador de perguntas achou erro.
4. **Conteúdo novo atualiza este cartão.** Depois de acrescentar, rode `node ferramentas/inventario.js --atualizar` e commite junto o `CONTEUDO.md` e o `ferramentas/inventario.json`.
5. **Perguntas só do material que o Paulo mandou.** Matéria sem PDF fica como está até o material chegar.

## O que cada matéria tem

<!-- inventario:inicio -->
_Contagem de 20/11/2026, gerada por `node ferramentas/inventario.js --atualizar`._

| Matéria | Perguntas no simulado | Guardadas (fora do simulado) | Livro | Histórias | Jogos | Termos | Práticas |
|---|---|---|---|---|---|---|---|
| Design Front End | 103 | 0 | 0 | 2 | 3 | 0 | 0 |
| Programação de Computadores | 156 | 0 | 9 | 7 | 3 | 14 | 12 |
| Engenharia de Requisitos | 124 | 0 | 8 | 10 | 7 | 16 | 8 |
| Fundamentos de Redes | 181 | 0 | 14 | 11 | 7 | 25 | 20 |
| Testing, Compliance e QA | 107 | 0 | 0 | 2 | 3 | 0 | 0 |

Perguntas por tema:

- **Design Front End:** ihc 18, heuristicas 22, norman 20, visual 22, avaliacao 21
- **Programação de Computadores:** logica 17, selecao 14, operadores 16, repeticao 12, for 14, dowhile 10, strings 14, arrays 12, matrizes 12, classes 12, metodos 13, parametros 10
- **Engenharia de Requisitos:** processo 4, tipos 5, metodologias 5, casosdeuso 43, historias 18, validacao 49
- **Fundamentos de Redes:** modelos 6, arquitetura 6, enlace 3, meios 3, rede 54, transporte 42, aplicacao 60, integradora 7
- **Testing, Compliance e QA:** tipos 18, tecnicas 18, praticas 17, qualidade 15, principios 18, compliance 21
<!-- inventario:fim -->

## Telas e botões que existem

- **Topo:** uma aba para cada matéria.
- **Tela inicial da matéria:**
  - professor e título;
  - caixa "O que estudar para a próxima prova";
  - botão "Ler em voz alta";
  - as cinco partes: Livro, Perguntas, Histórias, Jogos e Praticar.
- **Perguntas:**
  - chips "Com Cronômetro", "Dashboard de Notas" e "Sons Interativos";
  - temas especiais: Tudo misturado, Só as que errei (aparece quando há erros) e Contas novas (só em Redes);
  - temas por bimestre;
  - rodadas de 5, 10, 15, 20, 30, 50, 100 ou todas;
  - botão "Iniciar prova".
- **Durante a prova:**
  - contador e cronômetro, com a barra de progresso;
  - botões "Ouvir a pergunta" e "Responder falando";
  - explicação depois de responder;
  - botões Próxima, Pular, Início e Abandonar.
- **Resultado:**
  - nota, acertos, erros e tempo;
  - gráfico da evolução, progresso por tema e revisão dos erros;
  - botões Compartilhar, Revisar erros, Repetir mesma prova, Nova rodada e Voltar ao menu.
- **Jogos:** "Certo ou errado?", montado sozinho a partir das perguntas, mais os jogos de classificar e de ordenar de cada matéria.
- **Praticar:** "Falar os termos" (com voz) e "Digitar a resposta".
- **Sem internet:** o app funciona offline e se atualiza sozinho quando sai versão nova.

## Matérias

- **Abas atuais:** as 5 do 2º bimestre (Design Front End, Programação de Computadores, Engenharia de Requisitos, Fundamentos de Redes e Testing, Compliance e QA).
- **Fora por pedido do Paulo (20/11/2026):** Labs Tools I, Diversidade Cultural e Extensão II.
- **Planejadas em 05/11/2026, nunca criadas:** Cybersegurança, DevOps Tools e Ambientação Tech (portal do Prof. Patrick) e as do 1º período. Não existem em nenhuma versão salva do app.

## Histórico de remoções

| Data | O que saiu | Onde está agora |
|---|---|---|
| 05/11/2026 | Aba "Engenharia de Software" (vazia, sem perguntas: é o nome do curso, não uma matéria) | Apagada a pedido do Paulo |
| 20/11/2026 | 18 perguntas de Programação que cobravam assuntos fora dos slides | Voltaram para o simulado no mesmo dia, a pedido do Paulo ("era criar mais, não deletar o que já tinha") |
