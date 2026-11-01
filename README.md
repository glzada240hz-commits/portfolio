# Gustavo Alves Lima — Portfólio

Portfólio pessoal com tema escuro, projetos web/mobile/desktop, tecnologias em aprendizado e desenvolvimento assistido por IA.

## Abrir

Site: https://glzada240hz-commits.github.io/portfolio/

Sem build ou dependências de instalação. O GitHub Pages serve `index.html`, `style.css` e `script.js` da raiz.

## Funcionalidades

- Layout responsivo e navegação para telas pequenas.
- Filtros de projetos e detalhes em diálogos acessíveis.
- Animações discretas, respeitando `prefers-reduced-motion`.
- Conteúdo principal acessível sem JavaScript.
- Atividade real consultada na API pública do GitHub, com timeout e fallback.

As ilustrações dos projetos são visuais conceituais em HTML/CSS, identificados como tal; não são capturas de telas reais.

## Atualizar os projetos

Edite o conteúdo e as tecnologias em `index.html`; os detalhes dos três projetos em desenvolvimento ficam em `script.js`. Preserve a distinção entre aprendizado, implementação e validação.

O feed consulta apenas `portfolio`, `financeflow`, `taskflow` e `calculadora`. Não utiliza tokens nem eventos privados e não consulta o repositório do sistema de gestão. As mensagens retornadas são inseridas com `textContent`, sem interpretação de HTML. A indisponibilidade ou o limite da API mantém links diretos para os históricos.

## Verificação

Execute `node --check script.js`. Confira navegação, filtros, diálogos, links, leitura sem JavaScript, telas pequenas e preferência por movimento reduzido antes de publicar mudanças. Não há necessidade de gerar commits vazios ou alterar datas: a atividade corresponde às mudanças reais.
