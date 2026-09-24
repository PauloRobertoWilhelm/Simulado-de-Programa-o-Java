# Simulado de Programação Java

Simulado interativo de Java com interface moderna, cronômetro, seleção de temas e quantidade de questões, além de histórico de desempenho e tela final com resultado visual refinado.

## Descrição

Este projeto é uma aplicação web de simulado para estudo de lógica e conceitos básicos de Java. O usuário pode escolher o tema da revisão, a quantidade de questões da rodada e responder ao teste em sequência. Ao final, o sistema calcula o percentual de acertos, a nota equivalente, o tempo gasto e exibe um gráfico com o histórico recente de desempenho.

## Funcionalidades

- Seleção de tema da revisão
- Escolha da quantidade de questões
- Cronômetro durante a prova
- Questões com múltipla escolha
- Feedback imediato de resposta correta ou incorreta
- Cálculo de nota e desempenho final
- Gráfico de evolução com histórico local
- Compartilhamento do resultado
- Repetição da mesma prova ou nova rodada
- Navegação de retorno ao menu e abandono da prova
- Interface responsiva e visual premium

## Como usar

1. Abra o arquivo `index.html` em um navegador moderno.
2. Escolha o tema que deseja treinar.
3. Selecione quantas questões deseja responder.
4. Clique em iniciar e responda as questões.
5. Ao final da prova, visualize o resultado e o gráfico de histórico.
6. Você pode compartilhar o resultado, repetir a mesma prova ou começar uma nova rodada.

## Estrutura do projeto

- `index.html` — estrutura da interface e lógica principal
- `questoes.json` — banco de questões em Java
- `sw.js` — service worker para cache offline
- `manifest.json` — configuração para instalação como PWA
- `README.md` — documentação do projeto

## Checklist de funcionalidades finalizadas

- [x] Tela inicial com seleção de tema e quantidade de questões
- [x] Carregamento do banco de questões
- [x] Cronômetro por rodada
- [x] Navegação entre questões
- [x] Validação de respostas
- [x] Cálculo de porcentagem e nota final
- [x] Tela de resultado com dados resumidos
- [x] Histórico de desempenho em gráfico
- [x] Compartilhamento do resultado
- [x] Repetição da mesma prova
- [x] Nova rodada e retorno ao menu
- [x] Botões de voltar e sair na navegação
- [x] Visual premium com painel final refinado
- [x] Layout responsivo e elegante
- [x] Cache/offline com Service Worker

## Observação

Este projeto foi desenvolvido como uma aplicação estática em HTML, CSS e JavaScript, sem backend, sendo ideal para uso local e estudo.

