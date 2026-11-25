# Simulados UNIPAR

Aplicação web para estudar as matérias do curso de ADS. Cada matéria é uma aba separada, com livro, perguntas, histórias, jogos e treinos próprios.

## Matérias

| Aba | Perguntas | 2º bimestre | Livro | Treinos | Histórias | Jogos |
|---|---|---|---|---|---|---|
| Design Front End | 103 | ainda não | não | não | 2 | 4 |
| Programação de Computadores | 627 | 571 (Aulas 8 a 16) | 10 capítulos | 14 termos e 20 práticas | 7 | 9 |
| Engenharia de Requisitos | 531 | 517 (só slides 05 e 06 e o resumão) | 9 capítulos | 16 termos e 11 práticas | 10 | 9 |
| Fundamentos de Redes | 550 + contas sorteadas | 532 | 15 capítulos | 25 termos e 25 práticas | 11 | 10 |
| Testing, Compliance e QA | 107 | ainda não | não | não | 2 | 4 |
| Pensamento Computacional | 582 | 1º período | 2 capítulos | não | 0 | 1 |

## Como cada matéria funciona

- **Livro:** capítulos curtos, explicados com comparações do dia a dia. O botão "Ouvir o capítulo" lê as páginas em voz alta e vira sozinho. Os capítulos lidos ficam marcados.
- **Perguntas:** simulado com temas separados por bimestre, rodadas de 5, 10, 15, 20, 30, 50, 100 ou todas, cronômetro, explicação de cada resposta, nota e gráfico. Uma rodada nunca repete questão, e a letra certa é sorteada sem se repetir em seguida.
  - **Rodízio:** cada rodada traz primeiro as perguntas que você viu menos vezes.
  - **Repetir mesma prova:** as mesmas perguntas, em outra ordem e com as letras certas sorteadas de novo.
  - **🔁 Só as que errei:** treina só as perguntas erradas ou puladas; cada uma sai da lista quando você acerta.
  - **🎲 Contas novas (Redes):** TTL, sub-rede, máscara, CIDR, IP privado, classe, ACK do TCP e IPv6 com números sorteados na hora. A resposta muda a cada rodada, então só dá para acertar fazendo a conta.
- **Histórias:** uma situação em cenas, em que você decide o que fazer e recebe o retorno de cada escolha. No fim, um resumo “Para guardar”. Em Redes e Requisitos, as histórias cobrem todos os capítulos do 2º bimestre.
- **Jogos:** "classificar", em que cada item vai para a categoria certa, e "ordenar", em que você monta uma sequência. O "Certo ou errado?" é montado sozinho a partir das perguntas: aparece uma resposta só, e você diz se ela é a certa, sem poder comparar tamanhos.
- **Praticar:** "Falar os termos" pergunta em voz alta, escuta a resposta, corrige o termo técnico, ensina a pronúncia e explica para que serve. "Digitar a resposta" traz contas e respostas sem alternativas.
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

Ele barra pergunta repetida, resposta certa repetida, tema inexistente e história sem opção certa. Também barra resposta certa mais de 10% maior que a maior errada (nas perguntas e nas histórias) e matéria em que a certa é a opção mais longa em mais de 35% das perguntas.

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
- `js/livro.js`: tela do livro
- `js/historias.js`: tela de histórias
- `js/jogos.js`: tela de jogos
- `js/pratica.js`: tela de treinos (falar os termos e digitar respostas)
- `js/geradores.js`: perguntas de conta com números sorteados (Redes)
- `ferramentas/validar-questoes.js`: confere o conteúdo das matérias
- `css/styles.css`: visual geral
- `css/materias.css`: visual das abas, histórias e jogos
- `css/moderno.css`: visual atual (fundo neutro, uma cor por matéria, fonte Geist); apagar a linha dele no index.html volta ao visual antigo
- `css/estudo.css`: acabamento (painel de progresso, temas, código colorido, resultado); apagar a linha dele no index.html volta ao visual anterior
- `js/visual.js`: código Java colorido e painel de progresso
- `sw.js`: service worker, que permite usar o app sem internet
- `manifest.json`: configuração para instalar como aplicativo
- `script.js`: cópia antiga da lógica, que não é carregada pela página

## Como adicionar conteúdo

**Nova pergunta:** adicione um item em `questoes`, no arquivo da matéria. O campo `topic` precisa ser o `id` de um tema da matéria em `materias/index.json`. O campo `code` é opcional. Use 4 opções. O campo `correct` é a posição da resposta certa, começando em 0.

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
