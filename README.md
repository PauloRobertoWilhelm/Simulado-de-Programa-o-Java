# Simulados UNIPAR

Aplicação web para estudar as matérias do curso de ADS. Cada matéria é uma aba separada, com livro, perguntas, histórias, jogos e treinos próprios.

## Matérias

| Aba | Perguntas | 2º bimestre | Livro | Treinos | Histórias | Jogos |
|---|---|---|---|---|---|---|
| Design Front End | 404 | ainda não | não | não | 2 | 4 |
| Programação de Computadores | 747 | 639 (Aulas 8 a 16) | 10 capítulos | 14 termos e 20 práticas | 7 | 9 |
| Provas de Programação | 278 (30 oficiais + 248 variações) | só o que caiu na 1ª e na 2ª prova | 1 capítulo | não | 0 | 0 |
| Engenharia de Requisitos | 579 | 557 (só slides 05 e 06 e o resumão) | 9 capítulos | 16 termos e 11 práticas | 10 | 9 |
| Fundamentos de Redes | 1.098 + contas sorteadas | 1.080 | 15 capítulos | 25 termos e 25 práticas | 11 | 10 |
| Testing, Compliance e QA | 344 | ainda não | não | não | 2 | 4 |
| Cybersegurança | 252 | 1º período (Aula 08) | 5 capítulos | 5 práticas | 2 | 5 |
| Ambientação Tech | 387 | 1º período (Aulas 06 a 09) | 4 capítulos | 6 práticas | 2 | 5 |
| Linguagem e Interação, Direito Digital e Desenvolvimento para Internet | 0 | aguardam material | não | não | 0 | 0 |
| Pensamento Computacional | 582 | 1º período | 2 capítulos | não | 0 | 1 |

## Como cada matéria funciona

- **Revisão:** resumo da prova por assunto, com pegadinhas, perguntas rápidas e treino. Só nas matérias com o campo `revisao`.
- **Livro:** capítulos curtos, explicados com comparações do dia a dia. O botão "Ouvir o capítulo" lê as páginas em voz alta e vira sozinho. Os capítulos lidos ficam marcados.
- **Perguntas:** simulado com temas separados por bimestre e por conteúdo (como TTL ou substring), rodadas de 5, 10, 15, 20, 30, 50, 100 ou todas, cronômetro, explicação de cada resposta, nota e gráfico. Uma rodada nunca repete questão, e a letra certa é sorteada sem se repetir em seguida.
  - **Rodízio:** cada rodada traz primeiro as perguntas que você viu menos vezes.
  - **Repetir mesma prova:** as mesmas perguntas, em outra ordem e com as letras certas sorteadas de novo.
  - **🔁 Só as que errei:** treina só as perguntas erradas ou puladas; cada uma sai da lista quando você acerta.
  - **Níveis:** toda pergunta é Fácil, Médio ou Difícil. No **🤖 Automático** (o padrão), a rodada começa no nível em que você parou (na primeira vez, Fácil), sobe um nível a cada 3 acertos seguidos e desce a cada 2 erros seguidos; o medidor no alto mostra o nível e a 🔥 sequência. Também dá para escolher só Fácil, só Médio ou só Difícil.
  - **📝 Estilo da prova:** perguntas no formato das 1ª provas de cada professor: afirmativas I, II e III, verdadeiro ou falso, associação de colunas, asserção-razão ("I PORQUE II"), completar a lacuna do código e "qual análise corresponde à situação".
  - **🎲 Contas novas (Redes):** TTL, sub-rede, máscara, CIDR, IP privado, classe, ACK do TCP e IPv6 com números sorteados na hora. A resposta muda a cada rodada, então só dá para acertar fazendo a conta.
- **Histórias:** uma situação em cenas, em que você decide o que fazer e recebe o retorno de cada escolha. No fim, um resumo “Para guardar”. Em Redes e Requisitos, as histórias cobrem todos os capítulos do 2º bimestre.
- **Jogos:** "classificar", em que cada item vai para a categoria certa, e "ordenar", em que você monta uma sequência. O "Certo ou errado?" é montado sozinho a partir das perguntas: aparece uma resposta só, e você diz se ela é a certa, sem poder comparar tamanhos.
- **Praticar:** "Falar os termos" pergunta em voz alta, escuta a resposta, corrige o termo técnico, ensina a pronúncia e explica para que serve. "Digitar a resposta" traz contas e respostas sem alternativas.
- **Pug:** o mascote zoa quando você erra e faz elogio irônico quando acerta, com piadas de cada matéria. Aparece dentro da explicação, no resultado e no canto da tela nas histórias, jogos e treinos.
- **Visual, pug e animações:** a caixa "🎨 Visual, pug e animações" troca o visual (Futurista, Ouro, Grafite, Neon e Claro), o pug (3D, desenho ou sem pug) e liga "Menos animação". A escolha fica salva no navegador.
- **Voz nas perguntas:** "Ler em voz alta" lê a pergunta e a explicação. "Responder falando" marca a alternativa quando você fala a letra ("letra B").

A voz funciona no Chrome e no Edge; o microfone precisa de internet e de permissão no navegador. As notas de cada matéria ficam separadas, salvas no próprio navegador.

## Não perder conteúdo

O arquivo `CONTEUDO.md` lista tudo o que o app tem. Nada é apagado: pergunta que sai do simulado vai para `materias/arquivo/`. Antes de cada commit, a trava `.githooks/pre-commit` roda `node ferramentas/inventario.js` e bloqueia o commit se algo diminuiu ou sumiu. Num clone novo, ative a trava com `git config core.hooksPath .githooks`. As regras para o Claude ficam em `CLAUDE.md`.

## Material (PDFs)

Todo PDF recebido fica em `material/<matéria>/`, com o PDF original e um `.md` com o texto, e a lista do que foi criado a partir de cada um em `material/README.md`. A pasta fica fora do GitHub (`.gitignore`), porque o repositório é público e as provas têm dados pessoais.

## Conferir o conteúdo

Depois de mexer em `materias/`, rode:

```
node ferramentas/validar-questoes.js
```

Ele barra pergunta repetida, resposta certa repetida, tema inexistente, pergunta sem nível e história sem opção certa. Também barra resposta certa mais de 10% maior que a maior errada (nas perguntas e nas histórias) e matéria em que a certa é a opção mais longa em mais de 35% das perguntas.

## Como abrir

O app precisa de um servidor local, porque o navegador bloqueia a leitura dos arquivos JSON quando a página é aberta com dois cliques.

1. Abra a pasta do projeto no VS Code.
2. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

Sem o Live Server, rode `python -m http.server 8080` na pasta do projeto e abra `http://localhost:8080`.

## Estrutura do projeto

- `index.html`: telas e lógica principal do simulado
- `materias/index.json`: lista de abas, com título, cores, temas (com bimestre) e o que estudar para a próxima prova
- `materias/<id>.json`: perguntas, livro, histórias, jogos, termos e práticas de uma matéria
- `js/voz.js`: fala e escuta (leitura em voz alta e microfone)
- `js/revisao.js`: tela da revisão
- `js/livro.js`: tela do livro
- `js/historias.js`: tela de histórias
- `js/jogos.js`: tela de jogos
- `js/pratica.js`: tela de treinos (falar os termos e digitar respostas)
- `js/geradores.js`: perguntas de conta com números sorteados (Redes)
- `js/pug.js` e `css/pug.css`: o pug, com as frases e as animações; figuras em `img/pug/` (10 expressões em 3D e 10 em desenho)
- `js/temas.js` e `css/temas.css`: a caixa "Visual, pug e animações" e a troca de visual (o script curto no `<head>` do index.html liga o visual salvo antes de a página aparecer)
- `js/efeitos.js` e `css/niveis.css`: níveis, afirmativas do estilo da prova, confete, tremida no erro e aviso de nível
- `css/base.css`: peças que precisam de forma em todos os visuais (núcleo, circuito, abas em grupo, seletor de conteúdo, barra de cima da prova)
- `css/tema-neon.css` e `css/tema-claro.css`: os visuais Neon e Claro
- `ferramentas/validar-questoes.js`: confere o conteúdo das matérias
- `ferramentas/classificar-niveis.js`: dá o nível (1, 2 ou 3) a cada pergunta
- `css/styles.css`: visual geral
- `css/materias.css`: visual das abas, histórias e jogos
- `css/moderno.css`: a forma de todos os visuais (fundo neutro, fonte Geist); sozinho, é o visual Grafite, com a cor de cada matéria
- `css/futuro.css` e `js/futuro.js`: camada futurista (vidro e luz do mouse); o circuito e o núcleo aparecem em todos os visuais, com as cores de cada um
- `css/ouro.css`: visual "tecnologia em ouro", ligado nos visuais Ouro e Futurista
- `css/estudo.css`: acabamento (painel de progresso, temas, código colorido, resultado)
- `js/visual.js`: código Java colorido e painel de progresso
- `sw.js`: service worker, que permite usar o app sem internet
- `manifest.json`: configuração para instalar como aplicativo
- `script.js`: cópia antiga da lógica, que não é carregada pela página

## Como adicionar conteúdo

**Nova pergunta:** adicione um item em `questoes`, no arquivo da matéria. O campo `topic` precisa ser o `id` de um tema da matéria em `materias/index.json`. Se o tema tiver `assuntos`, o campo `assunto` precisa ser o `id` de um deles. O campo `code` é opcional. Use 4 opções. O campo `correct` é a posição da resposta certa, começando em 0. O campo `nivel` (1 Fácil, 2 Médio, 3 Difícil) é obrigatório: depois de acrescentar perguntas, rode `node ferramentas/classificar-niveis.js --gravar`. Pergunta no formato de prova leva `"estilo": "prova"` e, quando tem afirmativas, o campo `bloco`, com uma afirmativa por item (`["I. ...", "II. ..."]`).

```json
{
  "topic": "modelos",
  "statement": "Qual camada do modelo OSI usa o endereço IP?",
  "options": ["Física", "Enlace", "Rede", "Sessão"],
  "correct": 2,
  "explain": "<b>Rede:</b> é a camada que encaminha pacotes usando o endereço IP."
}
```

**Nova matéria:**

1. Adicione a matéria em `materias/index.json`.
2. Crie `materias/<id>.json` com os campos `questoes`, `historias` e `jogos`.
3. Inclua o arquivo novo na lista `urlsToCache` de `sw.js`.

## Observação

Este projeto é uma aplicação estática em HTML, CSS e JavaScript, sem backend. As perguntas das matérias novas foram escritas a partir das provas oficiais e dos gabaritos dos professores.
