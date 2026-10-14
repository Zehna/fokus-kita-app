// Modul Kutipan Motivasi Produktivitas (v2.0)
window.FokusQuotes = [
  { text: "Fokus bukan tentang mengatakan ya pada satu hal, tapi mengatakan tidak pada ratusan hal lainnya.", author: "Steve Jobs" },
  { text: "Kemajuan kecil setiap hari akan menghasilkan hasil yang besar.", author: "Pepatah Produktivitas" },
  { text: "Jangan menunggu waktu yang tepat. Mulailah dari tempatmu berdiri sekarang.", author: "Napoleon Hill" },
  { text: "Disiplin adalah jembatan antara tujuan dan pencapaian.", author: "Jim Rohn" },
  { text: "Selesaikan satu tugas penting lebih dulu, sisanya akan terasa lebih ringan.", author: "Prinsip Deep Work" }
];

window.getRandomQuote = function() {
  const idx = Math.floor(Math.random() * window.FokusQuotes.length);
  return window.FokusQuotes[idx];
};
