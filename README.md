# Simulados UNIPAR

Aplicação web para estudar as matérias do curso de ADS. Cada matéria é uma aba separada, com livro, perguntas, histórias, jogos e treinos próprios.

## Matérias

| Aba | Perguntas | 2º bimestre | Livro | Treinos | Histórias | Jogos |
|---|---|---|---|---|---|---|
| Programação | 33 | ainda não | não | não | 2 | 3 |
| Requisitos | 124 | 110 (só slides 05 e 06) | 8 capítulos | 16 termos e 8 práticas | 3 | 7 |
| Design | 16 | ainda não | não | não | 2 | 3 |
| Redes | 181 | 163 | 14 capítulos | 25 termos e 20 práticas | 3 | 7 |
| Testes e QA | 20 | ainda não | não | não | 2 | 3 |

## Como cada matéria funciona

- **Livro:** capítulos curtos, explicados com comparações do dia a dia. O botão "Ouvir o capítulo" lê as páginas em voz alta e vira sozinho. Os capítulos lidos ficam marcados.
- **Perguntas:** simulado com temas separados por bimestre, rodadas de 5, 10, 30, 50, 100 ou todas, cronômetro, explicação de cada resposta, nota e gráfico. Uma rodada nunca repete questão, e a letra certa é sorteada sem se repetir em seguida.
- **Histórias:** uma situação em cenas, em que você decide o que fazer e recebe o retorno de cada escolha.
- **Jogos:** "classificar", em que cada item vai para a categoria certa, e "ordenar", em que você monta uma sequência.
- **Praticar:** "Falar os termos" pergunta em voz alta, escuta a resposta, corrige o termo técnico, ensina a pronúncia e explica para que serve. "Digitar a resposta" traz contas e respostas sem alternativas.
- **Voz nas perguntas:** "Ler em voz alta" lê a pergunta e a explicação. "Responder falando" marca a alternativa quando você fala a letra ("letra B").

A voz funciona no Chrome e no Edge; o microfone precisa de internet e de permissão no navegador. As notas de cada matéria ficam separadas, salvas no próprio navegador.

## Conferir o conteúdo

Depois de mexer em `materias/`, rode:

```
node ferramentas/validar-questoes.js
```

Ele barra pergunta repetida, resposta certa repetida, resposta certa visivelmente maior que as outras, tema inexistente e história sem opção certa.

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
- `ferramentas/validar-questoes.js`: confere o conteúdo das matérias
- `css/styles.css`: visual geral
- `css/materias.css`: visual das abas, histórias e jogos
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
