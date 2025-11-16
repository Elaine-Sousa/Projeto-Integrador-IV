 // Função para mover item para descarte via API e remover o card da tela
      document.querySelectorAll('.btn-descarte').forEach((btn) => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.card');
          const itemId = card.dataset.id;

          fetch(`/mover_para_descarte/${itemId}`, { method: 'POST' })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                card.remove();
                alert('Item movido para descarte com sucesso!');
              } else {
                alert('Erro ao mover o item para descarte.');
              }
            })
            .catch(() => alert('Erro na comunicação com o servidor.'));
        });
      });
// Filtro em tempo real dos cards
const filtroInput = document.getElementById('filtro');
filtroInput.addEventListener('input', debounce(() => {
  const filtro = filtroInput.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    const nome = card.getAttribute('data-nome').toLowerCase();
    card.style.display = nome.includes(filtro) ? '' : 'none';
  });
}, 300));

// Impede submissão ao pressionar Enter no campo de filtro
filtroInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') e.preventDefault();
});