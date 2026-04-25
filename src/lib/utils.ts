export function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'));
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getDirectDriveImageUrl(url: string, size: number = 1200) {
  if (!url) return '';
  
  // Se não for link do Google Drive, retorna original
  if (!url.includes('drive.google.com') && !url.includes('drive.usercontent.google.com') && !url.includes('docs.google.com')) {
    return url;
  }
  
  try {
    let fileId = '';
    
    // Regex mais abrangente para extrair ID do Google Drive
    const driveRegex = [
      /\/file\/d\/([^\/?]+)/,
      /id=([^\/&?]+)/,
      /open\?id=([^\/&?]+)/,
      /\/d\/([^\/?]+)/
    ];

    for (const regex of driveRegex) {
      const match = url.match(regex);
      if (match && match[1]) {
        fileId = match[1];
        break;
      }
    }
    
    if (fileId) {
      // Endpoint de miniatura é o mais robusto para visualização pública (Anyone with the link)
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
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
