# Garage Web

Front-end em Angular do sistema **Garage**, para emitir e consultar Ordens de
Serviço de oficinas. A API e a explicação completa do projeto, com capturas de
tela, estão em [garage](https://github.com/MaycoolVinicius/garage).

> Todos os dados de demonstração são **fictícios**.

## Demo

- App: https://garage-web-zeta.vercel.app/login
- Usuário: `demo` · Senha: `1234`

> A API roda em plano gratuito e "dorme" após 15 minutos sem uso: o primeiro
> acesso pode levar até 1 minuto. Todos os dados são fictícios, e qualquer
> visitante pode alterá-los.

## Funcionalidades

- Login com JWT (rota protegida por guard e interceptor)
- Lista de OS com busca por placa, nome ou telefone
- Nova OS com itens dinâmicos de peças e serviços e total em tempo real
- Detalhe da OS e abertura/download do PDF
- Configurações da oficina: dados, CNPJ e logo
- Máscara de telefone e formatação de valores em pt-BR
- Indicador de carregamento para a API "acordando" (plano gratuito de hospedagem)

## Tecnologias

- **Angular 22** (componentes standalone, signals, formulários reativos)
- **TypeScript**
- Roteamento com guard de autenticação e interceptor HTTP funcional

## Como rodar

Requisitos: Node.js e npm, e a API rodando em `http://localhost:8080`
(veja o README do back-end).

```bash
npm install
npm start
```

O app abre em `http://localhost:4200`. O `npm start` usa um proxy
(`proxy.conf.json`) que encaminha `/api` para a API local, então não há
problema de CORS no desenvolvimento.

Para entrar na demonstração, use o usuário definido em `ADMIN_USERNAME` ao
subir a API com o perfil `demo`.

## Estrutura

```
src/app/
├── core/       # serviços, modelos, interceptor, guard, pipes e utilitários
└── features/   # telas: login, os-lista, os-nova, os-detalhe, configuracoes
```

## Decisões

- **O total é sempre calculado pelo servidor.** A tela só mostra uma prévia;
  o valor que vale vem da API.
- **PDF autenticado:** o arquivo é baixado como blob com o token, porque uma
  tag `<img>` ou um link simples não conseguem enviar o cabeçalho
  `Authorization`.
- O token fica no `localStorage`, um compromisso aceito para este projeto
  (o risco é XSS; cookies `HttpOnly` seriam a alternativa mais forte).
