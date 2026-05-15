# Importação de Produtos via CSV

## Visão Geral

O sistema agora possui funcionalidade de importação em massa de produtos via CSV. O botão **"Import CSV"** foi adicionado no painel admin de produtos.

## Como Usar

### 1. Acessar o Painel Admin

1. Faça login como admin no sistema
2. Navegue até a página de produtos (`/admin/products`)

### 3. Exportar CSV do Google Sheets

1. Abra sua planilha no Google Sheets
2. Vá em `Arquivo` → `Fazer download` → `Valores separados por vírgula (.csv)`
3. Salve o arquivo CSV

### 4. Importar CSV

1. No painel de produtos admin, clique no botão **"Import CSV"** (verde)
2. Selecione o arquivo CSV ou arraste para a área indicada
3. Visualize o conteúdo para confirmar
4. Clique em **"Importar Produtos"**
5. Aguarhe a confirmação da importação

## Formato do CSV

O CSV deve seguir o formato exportado do Google Sheets com múltiplas plataformas:

```csv
XBOX,STEAM/PC,NINTENDO E-SHOP,PLAYSTATION
Carimbo de data/hora,Nome do jogo,preço de venda,Carimbo de data/hora,Nome do jogo,preço de venda,...
07/12/2025 15:01:53,Final fantasy xvi(xbox-europa),R$200,00,17/12/2025 21:49:01,cuphead(steam-global),R$100,00
```

### Estrutura

- **Linha 1**: Nomes das plataformas (XBOX, STEAM/PC, NINTENDO E-SHOP, PLAYSTATION)
- **Linha 2**: Cabeçalhos das colunas (Carimbo de data/hora, Nome do jogo, preço de venda)
- **Linhas subsequentes**: Dados dos produtos

### Formatos de Preço Suportados

- `R$200,00`
- `R$ 200,00`
- `R$1.200,00`
- `200,00`

### Regiões Suportadas

O sistema extrai automaticamente a região do nome do jogo se estiver entre parênteses:

- `br` - Brasil/Brazil
- `ar` - Argentina
- `eu` - Europa
- `latam` - América Latina
- `global` - Global
- `conta` - Conta

## Funcionalidades do Modal

### Upload por Drag & Drop

- Arraste o arquivo CSV diretamente para a área indicada
- Ou clique para selecionar o arquivo

### Pré-visualização

- O modal exibe as primeiras 5 linhas do CSV para confirmação
- Ajuda a garantir que o formato está correto antes de importar

### Tratamento de Erros

- Validação de tipo de arquivo (apenas CSV)
- Mensagens de erro claras em caso de falha
- Feedback visual durante o carregamento

## Exemplo de Arquivo

Veja o arquivo `exemplo-produtos.csv` na raiz do backend para um exemplo completo.

## API Endpoint

- **URL**: `POST /products/import`
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "csvContent": "XBOX,STEAM/PC\nCarimbo de data/hora,Nome do jogo,preço de venda\n07/12/2025 15:01:53,Final fantasy xvi(xbox-europa),R$200,00",
    "categoryId": "uuid-opcional",
    "isActive": true
  }
  ```

## Resposta da API

```json
{
  "imported": 10,
  "failed": 0,
  "products": [...],
  "errors": []
}
```

## Componentes Criados

1. **`ImportCsvModal.tsx`**: Modal principal de importação
2. **`ImportCsvButton.tsx`**: Botão reutilizável (opcional)
3. **`index.ts`**: Exportação dos componentes

## Localização no Código

- **Componentes**: `/src/components/admin/products/`
- **Página Admin**: `/src/app/admin/products/page.tsx`

## Próximos Passos

1. ✅ Adicionar botão "Import CSV" no painel admin
2. ✅ Criar modal de upload e preview
3. ✅ Integrar com API de importação
4. ⏳ Adicionar botão na página de edição de produtos (opcional)
5. ⏳ Adicionar histórico de importações (futuro)

## Dicas

- Sempre visualize o CSV antes de importar
- Certifique-se de que o formato está correto
- O sistema gera descrições automáticas com base na plataforma e região
- Produtos importados recebem estoque inicial de 1 unidade
- Use categorias para organizar produtos importados
