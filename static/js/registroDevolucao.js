// registroDevolucao.js
document.addEventListener("DOMContentLoaded", () => {

  // Seleciona o form (tenta dois ids comuns)
  const form = document.getElementById("formDevolucao") || document.getElementById("returnForm");
  const myReturnsBtn = document.getElementById("myReturnsButton");
  const myReturnsContainer = document.getElementById("myReturns");
  const modal = document.getElementById("imageModalReturn");
  const modalImagesContainer = document.getElementById("modalReturnImages");

  // Estado do modal
  window.imagensAtuaisReturn = [];
  window.indiceAtualReturn = 0;

  // ============================== Enviar formulário ==============================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // tenta pegar cliente_id do localStorage (prioritário), senão do campo #customerId
      const clienteIdFromStorage = localStorage.getItem("cliente_id");
      const customerIdField = document.getElementById("customerId");
      const cliente_id = clienteIdFromStorage || (customerIdField ? customerIdField.value.trim() : null);

      if (!cliente_id) {
        alert("Você precisa estar logado (ou preencher o ID do cliente) para registrar uma devolução.");
        return;
      }

      const orderNumber = document.getElementById("orderNumber") ? document.getElementById("orderNumber").value.trim() : "";
      const name = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
      const reason = document.getElementById("reason") ? document.getElementById("reason").value.trim() : "";
      const imagesInput = document.getElementById("images");

      if (!orderNumber || !name || !reason) {
        alert("Preencha número do pedido, nome e motivo.");
        return;
      }

      const formData = new FormData();
      // campos com os nomes que seu Flask espera (orderNumber, name, reason, customerId)
      formData.append("orderNumber", orderNumber);
      formData.append("name", name);
      formData.append("reason", reason);
      formData.append("customerId", cliente_id);

      if (imagesInput && imagesInput.files.length > 0) {
        for (let i = 0; i < imagesInput.files.length; i++) {
          formData.append("images", imagesInput.files[i]);
        }
      }

      try {
        const res = await fetch("/registroDevolucao", {
          method: "POST",
          body: formData
        });

        // Se o servidor retornar HTML (erro 500 com página), cuidar disso:
        const contentType = res.headers.get("Content-Type") || "";
        if (!res.ok) {
          // tenta mostrar mensagem do JSON, senão texto
          if (contentType.includes("application/json")) {
            const errJson = await res.json();
            throw new Error(errJson.message || JSON.stringify(errJson));
          } else {
            const txt = await res.text();
            throw new Error(txt.slice(0, 200)); // corta texto grande
          }
        }

        // normal path: JSON de sucesso
        const data = contentType.includes("application/json") ? await res.json() : null;

        if (data && data.status === "success") {
          alert("Devolução registrada com sucesso!");
          form.reset();
          // recarrega lista do cliente
          carregarMinhasDevolucoes();
        } else {
          // em caso de resposta OK mas sem JSON expected
          alert((data && data.message) ? ("Erro: " + data.message) : "Registro concluído (resposta sem JSON).");
          carregarMinhasDevolucoes();
        }
      } catch (err) {
        console.error("Erro registrando devolução:", err);
        alert("Erro ao registrar devolução. Veja console para detalhes.");
      }
    });
  }

  // ============================== Carregar minhas devoluções ==============================
  async function carregarMinhasDevolucoes() {
    if (!myReturnsContainer) return;

    myReturnsContainer.innerHTML = ""; // limpa

    const clienteIdFromStorage = localStorage.getItem("cliente_id");
    const customerIdField = document.getElementById("customerId");
    const cliente_id = clienteIdFromStorage || (customerIdField ? customerIdField.value.trim() : null);

    if (!cliente_id) {
      myReturnsContainer.innerHTML = "<p>Faça login para ver suas devoluções.</p>";
      return;
    }

    try {
      const res = await fetch(`/minhas_devolucoes/${cliente_id}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Erro ao buscar devoluções: ${res.status} — ${txt.slice(0,200)}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Resposta inesperada do servidor (não é array).");
      }

      if (data.length === 0) {
        myReturnsContainer.innerHTML = "<p>Nenhuma devolução cadastrada.</p>";
        return;
      }

      data.forEach(d => {
  const card = document.createElement("div");
  card.className = "return-item";
  card.dataset.id = d.id;

  // d.images deve já ser um array de URLs (ex.: '/static/imagens/xxx.png')
  const imagens = Array.isArray(d.images) ? d.images : (d.images ? [d.images] : []);

  // Guarda as imagens no card
  card.dataset.imagens = JSON.stringify(imagens);

  // Conteúdo do card SEM imagem
  card.innerHTML = `
    <p><strong>Pedido:</strong> ${d.order_number || d.pedido || ''}</p>
    <p><strong>Motivo:</strong> ${d.motivo || d.reason || ''}</p>
    <p><strong>Status:</strong> ${d.status || '—'}</p>
  `;

  // Clicar no card abre o modal (primeira imagem)
  card.addEventListener("click", () => {
    abrirModalReturn(d.id, 0);
  });

  myReturnsContainer.appendChild(card);
});

      
    } catch (err) {
      console.error("Erro carregando devoluções:", err);
      myReturnsContainer.innerHTML = "<p>Erro ao carregar devoluções. Veja console.</p>";
    }
  }

  // Torna a função disponível globalmente (modal usa)
  window.carregarMinhasDevolucoes = carregarMinhasDevolucoes;

  // ============================== Modal (abrir/fechar/navegar) ==============================
  window.abrirModalReturn = function (id, index = 0) {
    // encontra o card por data-id
    const card = document.querySelector(`.return-item[data-id='${id}']`);
    if (!card) return;

    try {
      window.imagensAtuaisReturn = JSON.parse(card.dataset.imagens || "[]");
    } catch (e) {
      window.imagensAtuaisReturn = [];
    }

    if (!Array.isArray(window.imagensAtuaisReturn) || window.imagensAtuaisReturn.length === 0) {
      // mostra mensagem simples no modal
      modalImagesContainer.innerHTML = "<p>Nenhuma imagem disponível.</p>";
      modal.style.display = "flex";
      return;
    }

    window.indiceAtualReturn = Math.max(0, Math.min(index, window.imagensAtuaisReturn.length - 1));
    atualizarModalReturn();
    modal.style.display = "flex";
  };

  function atualizarModalReturn() {
    if (!modalImagesContainer) return;
    const imgs = window.imagensAtuaisReturn || [];
    if (imgs.length === 0) {
      modalImagesContainer.innerHTML = "<p>Nenhuma imagem disponível.</p>";
      return;
    }
    const url = imgs[window.indiceAtualReturn];
    modalImagesContainer.innerHTML = `
      <img src="${url}" class="modal-img" alt="Imagem ${window.indiceAtualReturn + 1}">
      <p>${window.indiceAtualReturn + 1} / ${imgs.length}</p>
    `;
  }

  window.fecharModalReturn = function () {
    if (modal) modal.style.display = "none";
  };

  window.imagemAnteriorReturn = function () {
    const imgs = window.imagensAtuaisReturn || [];
    if (!imgs.length) return;
    window.indiceAtualReturn = (window.indiceAtualReturn - 1 + imgs.length) % imgs.length;
    atualizarModalReturn();
  };

  window.proximaImagemReturn = function () {
    const imgs = window.imagensAtuaisReturn || [];
    if (!imgs.length) return;
    window.indiceAtualReturn = (window.indiceAtualReturn + 1) % imgs.length;
    atualizarModalReturn();
  };

  // fecha clicando fora do conteúdo
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) fecharModalReturn();
    });
  }

  // teclado: ESC e setas
  document.addEventListener("keydown", (e) => {
    if (!modal || modal.style.display !== "flex") return;

    if (e.key === "Escape") fecharModalReturn();
    if (e.key === "ArrowRight") proximaImagemReturn();
    if (e.key === "ArrowLeft") imagemAnteriorReturn();
  });

  // ============================== Botão "Minhas Devoluções" ==============================
  if (myReturnsBtn) {
    myReturnsBtn.addEventListener("click", carregarMinhasDevolucoes);
  }

  // carregar automaticamente se já estiver logado
  if (localStorage.getItem("cliente_id")) {
    carregarMinhasDevolucoes();
  }
});
