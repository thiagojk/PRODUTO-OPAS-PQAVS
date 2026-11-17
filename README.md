# PQA-VS em análise

Painel React para explorar metas municipais do PQA-VS, gerar uma síntese técnica por estado e exportar tabelas. A base de 2025 fornecida acompanha o projeto em `public/PQAVS_2025_Final.xlsx` e será pública quando o site for publicado.

## Executar

Requer Node.js compatível com Vite 8 (Node 20.19+ ou 22.12+).

```sh
npm ci
npm run dev
npm test
npm run build
```

Para publicar na Vercel, conecte o repositório e use as configurações de Vite: comando `npm run build` e diretório de saída `dist`. A publicação é feita na Vercel.

## Utilização

Escolha a UF no seletor para atualizar o painel e o relatório. O botão **Atualizar base** abre uma planilha no navegador, sem enviá-la para um servidor; a troca permanece apenas na sessão. Para alterar a base inicial para todos os visitantes, substitua o arquivo em `public/` mantendo seu nome e publique novamente. As tabelas podem ser exportadas em Excel. Na aba de relatório, preencha os campos de identificação e os espaços de análise e use **Baixar em Word** para obter um `.docx` editável. Os textos digitados ficam somente na sessão atual e não são salvos no servidor.

A aba `Municipios` deve conter `UF`, `COD_MUN`, `NOME_MUN`, uma coluna `Pop_AAAA` e `META_RES_1` a `META_RES_14`, com valores 1 ou 0. Colunas ausentes e códigos duplicados são rejeitados. As abas `Indicadores` e `Estados`, quando presentes no formato da base de 2025, fornecem descrições e valores para o relatório. Arquivos posteriores precisam manter essa estrutura; mudanças de metodologia exigem revisão.

Os percentuais usam todos os municípios presentes na UF como denominador, como no código R; valores ausentes não contam como metas alcançadas e são informados separadamente. As faixas populacionais também seguem o R. Os mapas usam malhas do projeto [geodata-br](https://github.com/tbrugz/geodata-br), carregadas do GitHub durante o uso e associadas pelos seis primeiros dígitos do código IBGE. A rede e eventuais diferenças entre a malha e a base afetam o mapa.

O relatório segue as seções do documento de 2024 e contém as tabelas, o gráfico dos municípios mais populosos e os mapas no Word. A malha precisa estar acessível no momento da geração; se falhar, o documento informa que os mapas não foram incluídos. O texto e os dados financeiros devem ser revistos antes do uso oficial. A planilha de 2025 altera, por exemplo, as definições dos indicadores 8 e 12; o aplicativo exibe as definições da própria planilha.
