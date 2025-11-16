document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const modal = document.getElementById("modalloginc");  // ID CORRETO
  const okBtn = document.getElementById("okModalBtn");

  if (!form) return;

  // ---- Funções da modal ----
  const openModal = () => {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  // Botão OK
  if (okBtn) {
    okBtn.addEventListener("click", () => {
      closeModal();
      const redirectUrl = form.getAttribute("data-url") || "/registroDevolucao";
      window.location.href = redirectUrl;
    });
  }

  // Clique fora fecha
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  // ---- Envio do formulário ----
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("loginErro").textContent = "";

    const cpf = document.getElementById("cpf").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!cpf || !email || !senha) {
      document.getElementById("loginErro").textContent = "Preencha todos os campos.";
      return;
    }

    const formData = new FormData();
    formData.append("cpf", cpf);
    formData.append("email", email);
    formData.append("senha", senha);

    try {
      const res = await fetch("/loginc", { method: "POST", body: formData });
      if (!res.ok) {
        document.getElementById("loginErro").textContent = "Erro ao conectar com o servidor.";
        return;
      }

      const result = await res.json();

      if (result.status === "success") {
        localStorage.setItem("cliente_id", result.cliente_id);
        localStorage.setItem("cliente_nome", result.nome);
        openModal();
      } else {
        document.getElementById("loginErro").textContent = result.message || "Erro no login.";
      }
    } catch (err) {
      console.error("Erro no fetch /loginc:", err);
      document.getElementById("loginErro").textContent = "Erro ao conectar com o servidor.";
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const modal = document.getElementById("modalloginc");  // ID CORRETO
  const okBtn = document.getElementById("okModalBtn");

  if (!form) return;

  // ---- Funções da modal ----
  const openModal = () => {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  // Botão OK
  if (okBtn) {
    okBtn.addEventListener("click", () => {
      closeModal();
      const redirectUrl = form.getAttribute("data-url") || "/registroDevolucao";
      window.location.href = redirectUrl;
    });
  }

  // Clique fora fecha
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  // ---- Envio do formulário ----
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("loginErro").textContent = "";

    const cpf = document.getElementById("cpf").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!cpf || !email || !senha) {
      document.getElementById("loginErro").textContent = "Preencha todos os campos.";
      return;
    }

    const formData = new FormData();
    formData.append("cpf", cpf);
    formData.append("email", email);
    formData.append("senha", senha);

    try {
      const res = await fetch("/loginc", { method: "POST", body: formData });
      if (!res.ok) {
        document.getElementById("loginErro").textContent = "Erro ao conectar com o servidor.";
        return;
      }

      const result = await res.json();

      if (result.status === "success") {
        localStorage.setItem("cliente_id", result.cliente_id);
        localStorage.setItem("cliente_nome", result.nome);
        openModal();
      } else {
        document.getElementById("loginErro").textContent = result.message || "Erro no login.";
      }
    } catch (err) {
      console.error("Erro no fetch /loginc:", err);
      document.getElementById("loginErro").textContent = "Erro ao conectar com o servidor.";
    }
  });
});
