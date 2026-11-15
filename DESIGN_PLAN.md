# Plano de Design e Arquitetura - Contato Seguro Slim

## 1. Entendimento do Produto (PRD)

O sistema atual do **Contato Seguro Slim** cobre operações de empresas e relato mas há uma falta de funcionalidade crítica para a condução de investigações: **identificar e rastrear as pessoas envolvidas em cada caso**.

O objetivo desta entrega é implementar no front-end os dois épicos definidos no `MINI_PRD.md`:
1. **Épico 1 (Pessoa):** Criar um módulo para cadastro, listagem, edição e exclusão de pessoas (CRUD). As pessoas pertencem ao sistema global (independentes de empresas específicas) e possuem o CPF como identificador único.
2. **Épico 2 (Envolvimento):** Permitir a associação entre pessoas e relatos existentes, atribuindo a cada vínculo um tipo de envolvimento (Relatante:`whistleblower`, Testemunha:`witness`, Vítima:`victim`, Denunciado:`denounced`). O sistema deve calcular e exibir dinamicamente se o relato é anônimo.

A princípio a etapa é que nenhuma linha do back-end (`server/`) pode ser alterada; toda a lógica de negócio de interface, tratamento de estados, validações e consumo da API ocorrerá estritamente em `client/`.

---

## 2. Análise da API (`API.md`)

### 2.1. Endpoints de Pessoas (`/people`)
* `GET /people`: Retorna lista de pessoas cadastradas.
* `GET /people/{id}`: Detalhes de uma pessoa.
* `POST /people`: Cadastra nova pessoa. Campos obrigatórios: `name` (string), `cpf` (string), `email` (string), `birth_date` (YYYY-MM-DD).
* `PUT /people/{id}`: Atualiza dados de uma pessoa existente.
* `DELETE /people/{id}`: Remove a pessoa do sistema.

### 2.2. Endpoints de Envolvimento (`/records/{recordId}/involvements`)
* `GET /records/{recordId}/involvements`: Retorna todos os envolvidos no relato especificado, trazendo os dados da pessoa vinculada e o tipo do envolvimento.
* `POST /records/{recordId}/involvements`: Vincula uma pessoa ao relato.
* `DELETE /records/{recordId}/involvements/{personId}`: Remove o envolvimento da pessoa naquele relato.

---

## 3. Modelagem por DDD (Domain-Driven Design)

Para manter a consistência com o padrão existente do projeto, as novas funcionalidades serão estruturadas pelos seus respectivos domínios de negócio:

### 3.1. Domínio: Pessoa (`domain/person`)
* Entidade: `Person` (Nome, CPF único, E-mail, Data de Nascimento).
* Responsabilidade: Gerenciar o cadastro de pessoas no sistema (cadastro, consulta, edição e remoção), garantindo regras como a unicidade do CPF.
* Componentes: Tabela de listagem, modais de criação/edição e contexto de estado (`PeopleContext`).

### 3.2. Domínio: Envolvimento (`domain/involvement`)
* Entidade/Vínculo: `Involvement` (Vínculo entre `Record` e `Person`).
* Tipos (Enum): Relatante (`whistleblower`), Testemunha (`witness`), Vítima (`victim`), Denunciado (`denounced`).
* Regras de Negócio do Domínio: 
  * Uma pessoa só pode ter um vínculo por relato.
  * O relato é considerado anônimo se não possuir nenhum envolvido do tipo `whistleblower`.
* Componentes: Drawer/Modal de gestão de envolvidos, tags visuais de identificação e formulário de associação.

---

## 4. Design da Interface do Usuário (UI/UX)

### 4.1. Navegação (`MainLayout.tsx`)
* Adição do item Pessoas no menu lateral (`Layout.Sider`) com o ícone `<UserOutlined />`, direcionando para a rota `/people`.

### 4.2. Tela de Gestão de Pessoas (`/people`)
* Tabela (`Table`):
  * Colunas: ID, Nome, CPF (formatado `000.000.000-00`), E-mail, Data de Nascimento (formatada `DD/MM/YYYY`) e Ações (Editar e Excluir com confirmação popconfirm).
* Modal de Cadastro e Edição (`CreatePersonModal` / `EditPersonModal`):
  * Input de Nome (obrigatório).
  * Input de CPF com máscara e validação estrita de 11 dígitos numéricos (apenas dígitos são enviados à API).
  * Input de E-mail com validação de formato.
  * DatePicker para Data de Nascimento (`YYYY-MM-DD`).
  * Tratamento de feedback visual com `message.success` e captura de erro da API (ex.: alerta claro caso o CPF já esteja cadastrado).

### 4.3. Aprimoramento da Tela de Relatos (`/records`)
* Coluna de Identificação/Anonimato:
  * Tag visual destacando o status do relato:
    * Anônimo: Tag cinza/laranja suave indicando que não há relatante identificado.
    * Identificado: Tag verde/azul indicando que possui relatante vinculado.
* Coluna de Ações de Relato:
  * Inclusão do botão/ícone "Envolvidos" (`<TeamOutlined />`) ao lado dos botões de editar e deletar.
* Modal/Drawer de Gestão de Envolvidos (`InvolvementsModal`):
  * Exibe o título do relato e a lista atual de pessoas vinculadas com seus respectivos papéis.
  * Cada tipo possui distinção visual por cores:
    * Relatante (`whistleblower`): Azul
    * Vítima (`victim`): Laranja
    * Testemunha (`witness`): Ciano / Verde
    * Denunciado (`denounced`): Vermelho
  * Permite desvincular uma pessoa com confirmação rápida.
  * Seção integrada para vincular uma nova pessoa:
    * Select de Pessoas (com busca por nome/CPF).
    * Select do Tipo de Envolvimento.
    * Botão "Vincular Envolvido".
    * Pessoas já vinculadas ao relato são desabilitadas na lista de seleção para evitar duplicação.

---

## 5. Riscos e Pontos de Atenção

* Formato do CPF na API: A API não aceita pontos ou traços no CPF e exige exatamente 11 dígitos. Vou exibir formatado na tela para facilitar a leitura, mas limpar a pontuação (`replace(/\D/g, '')`) antes de enviar na requisição.
* CPF já cadastrado (erro 409): Se o usuário tentar cadastrar um CPF repetido, a API retorna erro `409`. Vou tratar esse retorno para mostrar um aviso claro na tela em vez de uma mensagem genérica.
* Mesma pessoa duas vezes no mesmo relato: Para evitar que o usuário tente vincular alguém que já está na lista (o que também gera erro `409`), vou desabilitar ou filtrar no `<Select>` as pessoas que já fazem parte daquele relato.
* Atualização do status de anonimato: Quando um relatante (`whistleblower`) for adicionado ou removido, a tabela de relatos precisa atualizar na hora para mudar entre Anônimo e Identificado sem depender de F5 na página.
* Formato da data de nascimento: O `DatePicker` do Ant Design trabalha com objetos do `dayjs`, enquanto a API espera uma string `YYYY-MM-DD`. Vou converter essa data tanto ao enviar o formulário quanto ao preencher o modal de edição.

---

## 6. Critérios de Sucesso e Validação

1. Épico 1:
   * Usuário consegue listar todas as pessoas cadastradas.
   * Usuário consegue cadastrar nova pessoa com dados válidos.
   * Sistema impede o cadastro caso o CPF seja inválido ou já exista no banco.
   * Usuário consegue editar e remover pessoas.
2. Épico 2:
   * Usuário consegue abrir os envolvidos de qualquer relato.
   * Sistema exibe claramente a lista de envolvidos com seus papéis diferenciados.
   * Usuário consegue vincular novas pessoas a um relato e desvincular existentes.
   * A indicação visual de Anônimo vs Identificado é atualizada corretamente baseada na presença do papel `whistleblower`.

