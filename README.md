# Simulados UNIPAR

Aplicação web para estudar as matérias do curso. Cada matéria é uma aba separada, com perguntas, histórias e jogos próprios.

## Matérias

| Aba | Matéria | Conteúdo |
|---|---|---|
| Programação | Programação de Computadores | 33 perguntas, 2 histórias, 3 jogos |
| Requisitos | Engenharia de Requisitos | 20 perguntas, 2 histórias, 3 jogos |
| Design | Design Front-End | 16 perguntas, 2 histórias, 3 jogos |
| Redes | Redes de Computadores | 18 perguntas, 2 histórias, 3 jogos |
| Testes e QA | Testing, Compliance e QA | 20 perguntas, 2 histórias, 3 jogos |
| Eng. de Software | Engenharia de Software | Ainda sem conteúdo |

## Como cada matéria funciona

- **Perguntas:** simulado com escolha de tema e de quantidade, cronômetro, explicação de cada resposta, nota e gráfico de evolução. Uma rodada nunca repete questão.
- **Histórias:** uma situação em cenas, em que você decide o que fazer e recebe o retorno de cada escolha.
- **Jogos:** "classificar", em que cada item vai para a categoria certa, e "ordenar", em que você monta uma sequência.

As notas de cada matéria ficam separadas, salvas no próprio navegador.

## Como abrir

O app precisa de um servidor local, porque o navegador bloqueia a leitura dos arquivos JSON quando a página é aberta com dois cliques.

1. Abra a pasta do projeto no VS Code.
2. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

Sem o Live Server, rode `python -m http.server 8080` na pasta do projeto e abra `http://localhost:8080`.

## Estrutura do projeto

- `index.html`: telas e lógica principal do simulado
- `materias/index.json`: lista de abas, com título, cores e temas de cada matéria
- `materias/<id>.json`: perguntas, histórias e jogos de uma matéria
- `js/historias.js`: tela de histórias
- `js/jogos.js`: tela de jogos
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
