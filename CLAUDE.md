# Regras obrigatórias deste projeto

Simulados UNIPAR: app de estudo do Paulo (ADS, iniciante), uma aba por matéria do 2º bimestre. Estas regras valem para toda sessão neste projeto.

## Antes de mexer

- Leia `CONTEUDO.md`: ele lista tudo o que o app tem e o histórico de remoções.

## Nunca perder conteúdo

- **Não apague nem esconda nada sem o Paulo pedir com essas palavras.** Isso inclui perguntas, histórias, jogos, capítulos, termos, práticas, temas, matérias, botões, chips e partes da tela, inclusive via CSS (`display: none`).
- **Para tirar pergunta do simulado, mova-a para `materias/arquivo/<matéria>.json`.** O formato é `{ "materia", "guardadoEm", "motivo", "questoes": [...] }`. Nunca a apague.
- **Antes de cada commit, rode `node ferramentas/inventario.js` e `node ferramentas/validar-questoes.js`.** A trava `.githooks/pre-commit` roda os dois e bloqueia o commit se algo diminuiu, sumiu ou tem erro. Num clone novo, ative a trava com `git config core.hooksPath .githooks`.
- **Ao acrescentar conteúdo, atualize a base.** Rode `node ferramentas/inventario.js --atualizar` e commite junto `CONTEUDO.md` e `ferramentas/inventario.json`.
- **Se o Paulo disser que algo sumiu, confira antes de responder.** Use o histórico do git (`git log`, `git show <commit>:arquivo`) e o `CONTEUDO.md`.

## Material (PDFs) do Paulo

- **Todo PDF que o Paulo mandar vira `.md` ANTES de qualquer conteúdo.** Salve o PDF original e um `.md` com o texto em `material/<matéria>/` e registre em `material/README.md` o que foi criado a partir dele.
- **`material/` fica fora do GitHub** (está no `.gitignore`): o repositório é público e as provas têm nome e notas. Não publique sem o Paulo pedir.
- **Consulta:** para refazer ou conferir conteúdo, leia primeiro os `.md` de `material/`.

## Conteúdo

- **Perguntas, histórias e livro só do material que o Paulo mandou** (PDFs e provas). Matéria sem material fica como está até ele mandar.
- **Toda pergunta passa pelo verificador.** A certa não pode ser visivelmente maior que as erradas, não pode haver resposta certa repetida na mesma matéria, e as escolhas das histórias seguem a mesma regra.
- **Código Java das perguntas é compilado e executado antes de entrar.** O JDK fica em `C:/Program Files/Apache NetBeans/jdk/bin`.
- **"Engenharia de Software" é o nome do curso, não uma matéria.** Não crie aba para ela.

## Código e entrega

- **Código comentado linha a linha, em português** (o Paulo está aprendendo).
- **Commit e push no `main` a cada alteração testada, com mensagem em português.** O Paulo confere pelo site: https://paulorobertowilhelm.github.io/Simulado-de-Programa-o-Java/
- **Ao mudar arquivos do app, acrescente o caminho novo em `sw.js` e suba a versão do cache.**
