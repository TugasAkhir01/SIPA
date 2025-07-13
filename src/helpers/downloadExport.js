export const downloadExport = async ({ id, type, nim, token }) => {
  try {
    const res = await fetch('http://localhost:3001/api/violations/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, type }),
    });

    if (!res.ok) throw new Error(`Gagal ekspor ${type}`);

    const blob = await res.blob();
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href        = url;
    link.download    =
      (type === 'notulensi' ? 'notulensi_' : 'hasil_sidang_') + nim + '.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert(`Gagal mendownload ${type === 'notulensi' ? 'notulensi' : 'hasil sidang'}`);
  }
};
