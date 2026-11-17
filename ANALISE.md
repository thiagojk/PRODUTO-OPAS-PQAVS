# Análise inicial dos arquivos PQA-VS

A planilha de 2025 contém as abas `Indicadores`, `Municipios` e `Estados`. Na aba municipal, a unidade federativa está em `UF`, o código em `COD_MUN`, o nome em `NOME_MUN`, a população em `Pop_2025` e as 14 metas em `META_RES_1` a `META_RES_14`. Existem linhas vazias que devem ser descartadas. A planilha apresenta 5.569 registros com código municipal numérico.

O código R de 2024 considera alcançada a meta cujo valor é 1. A porcentagem por indicador usa o total de registros municipais do estado como denominador; dados ausentes não contam como alcance. As faixas populacionais são até 10.000, 10.001 a 30.000, 30.001 a 50.000, 50.001 a 100.000 e acima de 100.000 habitantes. O código produz tabelas por indicador e faixa, metas por município, gráfico dos 20 municípios mais populosos e mapas municipais por indicador e população.

O relatório de referência também inclui metodologia, análise textual, recursos financeiros e considerações finais. A adaptação para 2025 precisa validar as regras específicas desse ano e identificar a origem e o significado dos valores financeiros antes de produzir conclusões. Mapas exigem uma fonte geográfica de municípios compatível com os códigos da base.

Ainda falta implementar, testar e validar o painel, o relatório, a importação de planilhas e o deploy. Os anexos não foram adicionados ao repositório.
