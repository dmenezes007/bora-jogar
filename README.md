# bora-jogar

Aplicacao web com 8 minijogos em grade 4x2, inspirados nas mecanicas de Combinado, Dito, Palavras Cruzadas, Caca-Palavras, Soletra, Labirinto, Crossclimb e Wend.

## Fonte dos dados

Os dados sao importados automaticamente das pastas irmas:

- `../pgc-inpi` (CSV e docs)
- `../pgi-inpi` (docs em markdown)

## Jogos (renomeados)

1. Conexoes do Saber
2. Enigma do Dito
3. Mini Cruzes PI
4. Grade Oculta
5. Colmeia INPI
6. Rota em Rede
7. Escada Lexica
8. Trilha Wend PI

## Executar localmente

```bash
npm install
npm run import:data
npm run dev
```

## Testes Playwright

```bash
npx playwright install
npm run test:e2e
```

## Build

```bash
npm run build
```
