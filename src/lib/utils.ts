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
    // Tenta extrair ID do formato ?id=ID
    else if (url.includes('?id=')) {
      fileId = url.split('?id=')[1].split('&')[0];
    }
    
    if (fileId) {
      // Usar o endpoint lh3 que é mais robusto para miniaturas e carregamento direto
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  } catch (e) {
    console.error('Erro ao converter link do Drive:', e);
  }
  
  return url;
}
