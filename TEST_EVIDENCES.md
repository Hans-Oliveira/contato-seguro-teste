# Evidências de Testes Manuais - Contato Seguro Slim

Abaixo estão os testes que rodei manualmente na aplicação (`http://localhost:5100` com a API em `http://localhost:8080`).

**Observação sobre os dados de teste:** Como os formulários de Pessoas e Empresas validam dígitos verificadores reais de CPF e CNPJ no front-end, utilizei números válidos gerados para testes através dos sites abaixo:
* Gerador de CPF: https://www.4devs.com.br/gerador_de_cpf *(acessar o site e clicar em "Gerar CPF")*
* Gerador de CNPJ: https://www.4devs.com.br/gerador_de_cnpj *(acessar o site e clicar em "Gerar CNPJ")*

---

## Épico 1: Pessoas

### 1. Listagem inicial
* O que foi testado: Carregamento da tela de Pessoas (`/people`) e formatação dos dados na tabela.
* Como foi testado: Abri o menu "Pessoas" e conferi os registros que já estavam gravados.
* Resultado esperado: Listar ID, Nome, CPF com pontos e traço, E-mail, Data de Nascimento (`DD/MM/YYYY`) e os botões de ação.
* Resultado obtido: As 3 pessoas iniciais (Ana Silva, Bruno Costa e Carla Mendes) carregaram corretamente com o CPF e a data formatados.

### 2. Cadastro de nova pessoa
* O que foi testado: Criação de uma pessoa nova e digitação da data de nascimento sem barras.
* Como foi testado: Cliquei em "Cadastrar", preenchi nome, um CPF válido, e-mail e digitei `02061997` direto no campo de data apertando Enter em seguida.
* Resultado esperado: O campo converter `02061997` para `02/06/1997`, enviar `1997-06-02` para a API e mostrar a pessoa na tabela.
* Resultado obtido: data foi convertida.

### 3. Validações do formulário (CPF, pontuação e data futura)
* O que foi testado: Travas de digitação e validação antes do envio.
* Como foi testado: Tentei colar um CPF com pontuação (`123.456.789-01`), depois coloquei um CPF inválido (`12345678900`), tentei escolher uma data futura no calendário/teclado e enviar campos em branco.
* Resultado esperado: Remover pontos e traços sozinho, avisar que o CPF é inválido, bloquear datas futuras e cobrar os campos obrigatórios.
* Resultado obtido: O campo limpou a pontuação automático, mostrou "CPF inválido." para o número falso, bloqueou dias futuros no calendário e avisou caso digitasse data no futuro.

### 4. CPF duplicado (pessoa ativa)
* O que foi testado: Retorno `409 Conflict` ao tentar cadastrar alguém com CPF já existente.
* Como foi testado: Abri o modal de cadastro e tentei salvar usando o CPF de uma pessoa que já estava cadastrada e ativa na tabela.
* Resultado esperado: A API barra e a tela mostrar uma mensagem clara em vez de erro genérico.
* Resultado obtido: Exibiu a notificação "Já existe uma pessoa cadastrada com este CPF." e manteve o modal aberto para correção.

### 5. Edição e exclusão
* O que foi testado: Alteração (`PUT /people/{id}`) e remoção (`DELETE /people/{id}`).
* Como foi testado: Editei o nome de uma pessoa que tinha acabado de criar e logo depois cliquei no ícone da lixeira confirmando a exclusão.
* Resultado esperado: Atualizar o nome na tabela ao salvar e remover a linha ao confirmar a exclusão.
* Resultado obtido: Tudo funcionou normalmente nos dois fluxos.

### 6. Recadastro de CPF após exclusão (Soft Delete)
* O que foi testado: Excluir uma pessoa e tentar cadastrar ela de novo com o mesmo CPF.
* Como foi testado: Apaguei uma pessoa e tentei criar outra usando exatamente o mesmo CPF da excluída.
* Resultado esperado: Tratar o erro `500` (`Duplicate entry`) que o MySQL devolve por causa do `Soft Delete` + `UNIQUE` no back-end.
* Resultado obtido: O front-end trocou o recebimento do erro técnico do banco mostrando o aviso: "Este CPF pertence a um cadastro excluído anteriormente e não pode ser reutilizado."

---

## Épico 2: Envolvimentos e Relatos

### 7. Tag de Anônimo vs Identificado na tabela
* O que foi testado: Coluna "Identificação" na tela de Relatos (`/records`).
* Como foi testado: Acessei a aba "Relatos" e olhei o status dos 3 relatos iniciais.
* Resultado esperado: Relatos com pelo menos um Relatante (`whistleblower`) aparecerem como "Identificado" e os demais como "Anônimo".
* Resultado obtido: O Relato #1 veio como "Identificado" (tem a Ana Silva como relatante) e os Relatos #2 e #3 vieram como "Anônimo".

### 8. Vincular pessoa ao relato
* O que foi testado: Abrir o modal de envolvidos e adicionar uma pessoa com um papel.
* Como foi testado: Cliquei no botão "Envolvidos" de um relato, escolhi uma pessoa no select, selecionei o papel (ex: Testemunha) e cliquei em "Vincular".
* Resultado esperado: Salvar o vínculo na API e listar a pessoa no modal com a tag colorida do papel.
* Resultado obtido: Salvou e já listou a pessoa com CPF formatado e com a tag na cor correta.

### 9. Bloqueio de pessoa repetida no mesmo relato
* O que foi testado: Garantir que a mesma pessoa não seja vinculada duas vezes no mesmo relato.
* Como foi testado: Com o modal de um relato aberto, abri o select de "Pessoa" para tentar selecionar alguém que já estava na lista.
* Resultado esperado: Pessoas que já estão no relato ficarem desabilitadas no select.
* Resultado obtido: Os nomes já vinculados apareceram desabilitados e não clicáveis.

### 10. Atualização do anonimato em tempo real
* O que foi testado: Mudança automática entre Anônimo e Identificado ao mexer no Relatante.
* Como foi testado: Peguei um relato marcado como "Anônimo", vinculei uma pessoa como "Relatante" conferi a tabela e depois entrei de novo e removi esse Relatante.
* Resultado esperado: Mudar para "Identificado" ao adicionar o Relatante e voltar para "Anônimo" ao remover.
* Resultado obtido: Tanto o cabeçalho do modal quanto a coluna na tabela atualizaram automaticamente.

### 11. Revincular pessoa removida do relato (Soft Delete)
* O que foi testado: Desvincular uma pessoa de um relato e tentar vincular ela de novo.
* Como foi testado: Removi uma pessoa na lixeira dentro do modal de envolvidos e logo depois tentei vinculá-la novamente no mesmo relato.
* Resultado esperado: Tratar o erro `500` (`Duplicate entry`) do `Soft Delete` do back-end com uma mensagem clara.
* Resultado obtido: Apareceu a notificação explicando: "Esta pessoa já foi vinculada e removida anteriormente deste relato, não podendo ser revinculada.".

---

## Extras

### 12. CNPJ em Empresas (incluindo Soft Delete) e Dashboard
* O que foi testado: Formatação, validação, tratamento de CNPJ duplicado/excluído na aba Empresas e os indicadores da tela inicial (`/dashboard`).
* Como foi testado: Acessei Empresas para checar a máscara na tabela, tentativa de CNPJ inválido/pontuado e recadastro de CNPJ excluído depois abri o Dashboard para conferir os totais.
* Resultado esperado: CNPJ formatado e validado igual ao CPF, erros `409`/`500` de Soft Delete tratados com aviso para o usuário e os cards/barras do Dashboard batendo com os dados da API.
* Resultado obtido: Exibição correta dos números reais do banco e os erros de duplicidade exibindo mensagens claras.

### 13. TypeScript e Vitest
* O que foi testado: Checagem de tipos (`tsc --noEmit`) e os testes unitários (`pnpm test`) dentro do container.
* Como foi testado: Rodei `docker exec contato-seguro-slim-front-end-frontend-1 pnpm run lint:tsc` e `pnpm test`.
* Resultado esperado: Nenhum erro de compilação e todos os testes passando.
* Resultado obtido: `tsc --noEmit` saiu com 0 erros e o Vitest passou os 15 testes nos 3 arquivos (`service.helper.test.ts`, `person.services.test.ts` e `involvement.services.test.ts`).
