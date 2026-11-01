'use strict';

// Progressive enhancement: navigation and project content also work without JS.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#nav-links');
if (menuButton && navigation) {
  document.documentElement.classList.add('menu-enabled');
  menuButton.hidden = false;
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('open', open);
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
  });
}

const filters = document.querySelector('.filters');
if (filters) {
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    const value = button.dataset.filter;
    filters.querySelectorAll('button').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    let count = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = value !== 'todos' && card.dataset.category !== value;
      if (!card.hidden) count++;
    });
    document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? "projeto exibido" : "projetos exibidos"}.`;
  });
}

const details = {
  prumo: { title: 'Prumo', description: 'Ferramenta desktop para diagnóstico e otimização geral do Windows. O projeto reúne recomendações, execução de ajustes, histórico e reversão.', learning: ['C#, .NET e interfaces WPF.', 'Separação entre interface e operações com privilégios.', 'Backup, verificação e recuperação de alterações.'], state: 'Em desenvolvimento. Validado parcialmente em ambiente de CI; testes em hardware real ainda são necessários. Não disponível comercialmente.' },
  gestao: { title: 'Sistema de Gestão', description: 'Aplicação web responsiva voltada a estabelecimentos de alimentação. Integra PDV, mesas, comandas, cozinha, entregas, caixa e estoque.', learning: ['TypeScript no front-end e backend.', 'React, Vite, Node.js, Fastify e PostgreSQL.', 'Validação com Zod e testes com Vitest e Playwright.'], state: 'Versão funcional em desenvolvimento. Integrações externas, impressão e uso em produção ainda exigem validação.' },
  monta: { title: 'MONTA', description: 'Plataforma para conectar empresas de montagem e profissionais disponíveis, com aplicativos separados e fluxos de contratação por especialidade.', learning: ['TypeScript, React Native e Expo.', 'Componentes e validações compartilhados entre aplicativos.', 'Modelagem de fluxos de contratação e integração com APIs.'], state: 'Em desenvolvimento, com repositório privado. A disponibilidade comercial e a validação dos aplicativos em dispositivos ainda estão pendentes.' }
};
const dialog = document.querySelector('#project-dialog');
let lastTrigger = null;
if (dialog && typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-project]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const project = details[button.dataset.project];
      if (!project) return;
      lastTrigger = button;
      document.querySelector('#dialog-title').textContent = project.title;
      document.querySelector('#dialog-description').textContent = project.description;
      document.querySelector('#dialog-state').textContent = project.state;
      const list = document.querySelector('#dialog-learning');
      list.replaceChildren(...project.learning.map(text => { const item = document.createElement('li'); item.textContent = text; return item; }));
      dialog.showModal();
    });
  });
  dialog.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => lastTrigger?.focus());
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.06 });
  document.querySelectorAll('.section-heading, .skill-card, .ai-card, .about-grid, .contact-section').forEach(item => { item.classList.add('reveal-ready'); observer.observe(item); });
}
document.querySelector('#year').textContent = String(new Date().getFullYear());

// Only explicitly selected public repositories are queried. No credentials or private events.
const publicRepositories = ['portfolio', 'financeflow', 'taskflow', 'calculadora'];
const repositoryNames = { portfolio: 'Portfólio', financeflow: 'FinanceFlow', taskflow: 'TaskFlow', calculadora: 'Calculadora' };
const activityStatus = document.querySelector('#activity-status');
const activityList = document.querySelector('#activity-list');
const refreshButton = document.querySelector('#refresh-activity');
let fetchingActivity = false;

async function readCommits(repository) {
  const response = await fetch(`https://api.github.com/repos/glzada240hz-commits/${repository}/commits?per_page=3`, { signal: AbortSignal.timeout(9000), headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Resposta inválida');
  return data.flatMap(item => {
    const date = item.commit?.committer?.date;
    if (!/^[a-f0-9]{40}$/i.test(item.sha || '') || typeof item.commit?.message !== 'string' || !Number.isFinite(Date.parse(date))) return [];
    return [{ repository, sha: item.sha, message: item.commit.message.split('\n')[0], date }];
  });
}

function renderCommits(commits) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' });
  const items = commits.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 6).map(commit => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `https://github.com/glzada240hz-commits/${commit.repository}/commit/${commit.sha}`;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    const icon = document.createElement('span'); icon.className = 'commit-icon'; icon.textContent = '⑂'; icon.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span'); copy.className = 'commit-copy';
    const title = document.createElement('strong'); title.textContent = commit.message; title.title = commit.message;
    const subtitle = document.createElement('small'); subtitle.textContent = `${repositoryNames[commit.repository]} · ${commit.sha.slice(0, 7)}`;
    const time = document.createElement('time'); time.dateTime = commit.date; time.textContent = formatter.format(new Date(commit.date));
    copy.append(title, subtitle); link.append(icon, copy, time); item.append(link); return item;
  });
  activityList.replaceChildren(...items);
}

async function loadActivity() {
  if (fetchingActivity) return;
  fetchingActivity = true; refreshButton.disabled = true;
  activityStatus.textContent = 'Consultando commits públicos no GitHub…';
  const results = await Promise.allSettled(publicRepositories.map(readCommits));
  const commits = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  if (commits.length) {
    renderCommits(commits);
    activityStatus.textContent = results.every(result => result.status === 'fulfilled') ? 'Commits reais, ordenados pela data de registro no GitHub.' : 'Parte da atividade está indisponível. Exibindo os repositórios consultados com sucesso.';
  } else {
    activityStatus.textContent = activityList.children.length ? 'Não foi possível atualizar agora. A lista anterior foi mantida; consulte os repositórios abaixo.' : 'Não foi possível consultar a atividade agora. A API pode estar indisponível ou ter atingido o limite de consultas. Acesse os commits pelos links abaixo.';
  }
  refreshButton.disabled = false; fetchingActivity = false;
}
if (activityStatus && activityList && refreshButton) {
  refreshButton.hidden = false;
  refreshButton.addEventListener('click', loadActivity);
  // Load only when the section is approached, avoiding unnecessary API calls.
  if ('IntersectionObserver' in window) {
    const activityObserver = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { activityObserver.disconnect(); void loadActivity(); } }, { rootMargin: '250px' });
    activityObserver.observe(document.querySelector('#atividade'));
  } else { void loadActivity(); }
}


// Email options work without a configured desktop mail client.
const copyEmailButton = document.querySelector('#copy-email');
const contactEmailInput = document.querySelector('#contact-email');
const emailCopyStatus = document.querySelector('#email-copy-status');
if (copyEmailButton && contactEmailInput && emailCopyStatus) {
  copyEmailButton.hidden = false;
  copyEmailButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard indisponível');
      await navigator.clipboard.writeText(contactEmailInput.value);
      emailCopyStatus.textContent = 'Endereço copiado. Cole no seu serviço de e-mail para escrever a mensagem.';
    } catch {
      contactEmailInput.focus();
      contactEmailInput.select();
      emailCopyStatus.textContent = 'O navegador não permitiu copiar automaticamente. O endereço está selecionado: use Ctrl+C ou toque e segure para copiar.';
    }
  });
  const emailDetails = document.querySelector('.email-contact');
  emailDetails.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      emailDetails.open = false;
      emailDetails.querySelector('summary').focus();
    }
  });
}
