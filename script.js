// Função para validar o formato de tempo
function validarFormatoTempo(input) {
  const regex = /^(?:[0-9]{2}:){1}[0-9]{2}(:[0-9]{2})?$/; // regex para hh:mm:ss ou mm:ss
  return regex.test(input.value);
}

// Função para mostrar o erro
function mostrarErro(input, mensagem) {
  let erroDiv = input.parentElement.querySelector('.erro-msg');
  
  if (!erroDiv) {
    erroDiv = document.createElement('div');
    erroDiv.classList.add('erro-msg');
    input.parentElement.appendChild(erroDiv);
  }

  erroDiv.textContent = mensagem;
  erroDiv.style.color = 'red';
  erroDiv.style.fontSize = '12px';
  erroDiv.style.marginTop = '5px';
}

// Função para remover a mensagem de erro
function removerErro(input) {
  let erroDiv = input.parentElement.querySelector('.erro-msg');
  
  if (erroDiv) {
    erroDiv.remove();
  }
}

// Função para validar o campo de tempo
function validarTempo(input) {
  // Verifica se o formato está correto
  if (!validarFormatoTempo(input)) {
    // Se não estiver correto, mostra a mensagem de erro e limpa o campo
    mostrarErro(input, 'Erro! Formato inválido. Use hh:mm:ss ou mm:ss.');
    input.value = ''; // Limpa o campo
    input.focus(); // Foca no campo novamente
  } else {
    // Se o formato estiver correto, remove qualquer erro
    removerErro(input);
  }
}

// Vinculando a validação aos campos de tempo quando o evento 'blur' ocorre
document.querySelectorAll('.tempo').forEach(input => {
  input.addEventListener('blur', function() {
    validarTempo(input); // Chama a função de validação quando o campo perde o foco
  });
});

// Aplicando máscara de tempo aos campos
function aplicarMascara() {
  document.querySelectorAll('.tempo').forEach(input => {
    input.addEventListener('input', function() {
      let valor = input.value.replace(/\D/g, ''); // Remove qualquer coisa que não seja número
      if (valor.length > 6) valor = valor.slice(0, 6); // Limita a 6 caracteres
      if (valor.length >= 3) valor = valor.slice(0, 2) + ':' + valor.slice(2); // Adiciona o primeiro ":"
      if (valor.length >= 6) valor = valor.slice(0, 5) + ':' + valor.slice(5); // Adiciona o segundo ":"
      input.value = valor;
    });
  });
}

// Função que atualiza a orientação com base no recurso
function atualizarOrientacao(select) {
  const orientacao = select.parentElement.parentElement.querySelector('textarea[name="orientacao"]');
  switch (select.value) {
    case 'Corte':
      orientacao.value = 'O que será retirado? Inserir o tempo e frases de referência. Preencha as colunas "Início" e "Fim".';
      break;
    case 'Inserção':
      orientacao.value = 'O que será inserido? Preencha as colunas "Início" e "Fim".';
      break;
    case 'Lettering':
      orientacao.value = 'Defina o texto de no máx. 80 caracteres. Preencha ao lado.';
      break;
    case 'Lista com marcadores':
      orientacao.value = 'Insira o título da lista na coluna "Início" e os tópicos na coluna "Fim".';
      break;
    case 'Outro':
      orientacao.value = 'Outro recurso? Preencha ao lado.';
      break;
    default:
      orientacao.value = 'Preenchimento automático'; // Valor padrão
  }
}

// Função para remover todas as mensagens de erro
function removerTodasMensagensDeErro() {
  document.querySelectorAll('.erro-msg').forEach(erroDiv => {
    erroDiv.remove();
  });
}


function exportarFormulario() {
  // Verificar se já está exportando para evitar duplicação
  if (this.exporting) return;
  this.exporting = true;

  try {
    // Exportar PDF
    const element = document.getElementById('tabela');
    const opt = {
      margin:       0.5,
      filename:     'formulario_edicao.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    
    // Usar then() para garantir que a exportação foi concluída
    html2pdf().from(element).set(opt).save().then(() => {
      // Exportar JSON apenas após o PDF ter sido exportado
      const linhas = document.querySelectorAll('#corpo-tabela tr');
      let dados = [];

      linhas.forEach(linha => {
        const inputs = linha.querySelectorAll('input, textarea, select');
        let item = {
          nome_video: inputs[0].value,
          recurso: inputs[1].value,
          orientacao: inputs[2].value,
          inicio: inputs[3].value,
          detalhamento_inicio: inputs[4].value,
          fim: inputs[5].value,
          detalhamento_fim: inputs[6].value,
        };
        dados.push(item);
      });

      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formulario_edicao.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.exporting = false;
      }, 100);
    });
  } catch (error) {
    console.error('Erro ao exportar:', error);
    this.exporting = false;
  }
}

// Modificar o event listener para prevenir comportamento padrão
document.getElementById('btn-exportar').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
  exportarFormulario();
});// Função para adicionar uma nova linha
function adicionarLinha() {
  const tbody = document.getElementById('corpo-tabela');
  const novaLinha = document.createElement('tr');
  novaLinha.innerHTML = `
    <td><input type="text" name="nome_video" required></td>
    <td>
      <select name="recurso" onchange="atualizarOrientacao(this)" required>
        <option value="">Selecione...</option>
        <option value="Corte">Corte</option>
        <option value="Inserção">Inserção</option>
        <option value="Lettering">Lettering</option>
        <option value="Lista com marcadores">Lista com marcadores</option>
        <option value="Outro">Outro</option>
      </select>
    </td>
    <td><textarea name="orientacao" class="orientacao-automatica" rows="2" readonly>Preenchimento automático</textarea></td>
    <td><input type="text" name="inicio" class="tempo" required></td>
    <td><textarea name="detalhamento_inicio" rows="2"></textarea></td>
    <td><input type="text" name="fim" class="tempo" required></td>
    <td><textarea name="detalhamento_fim" rows="2"></textarea></td>
  `;
  tbody.appendChild(novaLinha);
  aplicarMascara();
}

// Atualizando o evento de limpar o formulário
document.getElementById('btn-limpar').addEventListener('click', function() {
  location.reload(); // Atualiza a página (igual F5), removendo as mensagens de erro
  removerTodasMensagensDeErro(); // Remove todas as mensagens de erro ao limpar
});

// Inicializando os eventos dos botões
document.getElementById('btn-adicionar').addEventListener('click', adicionarLinha);
document.getElementById('btn-exportar').addEventListener('click', exportarFormulario);

// Inicializando a máscara de tempo
aplicarMascara();
