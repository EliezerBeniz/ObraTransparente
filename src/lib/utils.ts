export function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'));
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getDirectDriveImageUrl(url: string) {
  if (!url) return '';
  
  // Se não for link do Google Drive, retorna original
  if (!url.includes('drive.google.com')) return url;
  
  try {
    let fileId = '';
    
    // Tenta extrair ID do formato /file/d/ID/view
    if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1].split('/')[0].split('?')[0];
    } 
    // Tenta extrair ID do formato ?id=ID ou &id=ID
    else if (url.includes('id=')) {
      const parts = url.split('id=');
      if (parts.length > 1) {
        fileId = parts[1].split('&')[0].split('/')[0].split('?')[0];
      }
    }
    // Tenta extrair ID do formato drive.google.com/open?id=ID
    else if (url.includes('open?id=')) {
      fileId = url.split('open?id=')[1].split('&')[0];
    }
    
    if (fileId) {
      // Endpoint de miniatura é o mais robusto para visualização pública (Anyone with the link)
      // sz=w1200 garante uma boa resolução
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
  } catch (e) {
    console.error('Erro ao converter link do Drive:', e);
  }
  
  return url;
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) return;

  // Header columns
  const headers = ['Data', 'Categoria', 'Titulo', 'Status', 'Valor'];
  
  // Format rows
  const rows = data.map(item => [
    item.date,
    `"${item.category || ''}"`,
    `"${item.title || ''}"`,
    item.status,
    Number(item.amount).toFixed(2).replace('.', ',') // Format for excel BR
  ].join(';')); // Use semicolon for BR excel

  const csvContent = [headers.join(';'), ...rows].join('\n');
  
  // Add UTF-8 BOM for Excel acentuation
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function isLendingDelayed(expectedReturnDate: string | null | undefined, status: string) {
  if (!expectedReturnDate || status === 'Devolvido') return false;
  
  // Set to end of the expected day
  const deadline = new Date(expectedReturnDate + 'T23:59:59');
  return deadline < new Date();
}
