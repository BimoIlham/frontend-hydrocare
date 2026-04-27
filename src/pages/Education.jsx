import { useState, useMemo, useEffect } from 'react'
import { BookOpen, Droplet, Brain, AlertTriangle, Lightbulb, Sun, Clock, ChevronDown, ChevronUp, Beaker, ShieldCheck, ShieldAlert, Apple, X, MessageSquare } from 'lucide-react'
import Card from '../components/ui/Card'
import AIChat from '../components/education/AIChat'

const URINE_COLORS = [
  { id: 1, color: '#F5F5DC', label: 'Transparan / Bening', level: 'Overhidrasi', emoji: '💧', status: 'info', description: 'Urin yang terlalu jernih bisa menandakan kamu minum air terlalu banyak. Ini bisa menyebabkan hiponatremia (kadar natrium rendah dalam darah).', recommendation: 'Kurangi sedikit konsumsi air. Tidak perlu memaksakan diri minum terlalu banyak. Dengarkan sinyal tubuhmu.', hydrationLevel: 100 },
  { id: 2, color: '#FEFCE8', label: 'Kuning Sangat Muda', level: 'Terhidrasi Sempurna', emoji: '✅', status: 'perfect', description: 'Ini adalah warna urin ideal! Menandakan tubuh kamu terhidrasi dengan sangat baik dan ginjal bekerja optimal.', recommendation: 'Pertahankan pola minum airmu saat ini. Kamu sudah melakukannya dengan sangat baik!', hydrationLevel: 95 },
  { id: 3, color: '#FEF08A', label: 'Kuning Muda', level: 'Hidrasi Baik', emoji: '👍', status: 'good', description: 'Warna kuning muda menunjukkan hidrasi yang baik. Tubuh memiliki keseimbangan cairan yang sehat.', recommendation: 'Tetap jaga pola minum yang konsisten. Minum air secara berkala sepanjang hari.', hydrationLevel: 80 },
  { id: 4, color: '#FDE047', label: 'Kuning', level: 'Hidrasi Normal', emoji: '🙂', status: 'normal', description: 'Warna kuning standar menandakan hidrasi yang cukup. Masih dalam batas normal, tapi bisa ditingkatkan.', recommendation: 'Tambahkan 1-2 gelas air lagi per hari untuk hasil yang lebih optimal.', hydrationLevel: 60 },
  { id: 5, color: '#FACC15', label: 'Kuning Tua', level: 'Dehidrasi Ringan', emoji: '⚠️', status: 'warning', description: 'Urin berwarna kuning tua menunjukkan tubuh mulai kekurangan cairan. Bisa menyebabkan sakit kepala ringan dan penurunan konsentrasi.', recommendation: 'Segera minum 1-2 gelas air. Bawa botol minum ke mana pun dan atur pengingat untuk minum setiap 30-60 menit.', hydrationLevel: 40 },
  { id: 6, color: '#EAB308', label: 'Kuning Gelap / Amber', level: 'Dehidrasi Sedang', emoji: '🟡', status: 'danger', description: 'Warna amber menandakan dehidrasi yang cukup serius. Kamu mungkin mengalami mulut kering, kelelahan, dan pusing.', recommendation: 'Minum air segera! Targetkan 500-750 mL dalam 1-2 jam ke depan. Hindari kafein dan minuman manis. Istirahat di tempat sejuk.', hydrationLevel: 25 },
  { id: 7, color: '#CA8A04', label: 'Oranye / Madu', level: 'Dehidrasi Berat', emoji: '🔴', status: 'critical', description: 'Warna oranye atau seperti madu adalah tanda dehidrasi berat. Bisa juga mengindikasikan masalah ginjal atau hati.', recommendation: 'Segera minum banyak air! Jika tidak membaik dalam beberapa jam, pertimbangkan untuk berkonsultasi dengan dokter.', hydrationLevel: 10 },
  { id: 8, color: '#92400E', label: 'Coklat Gelap', level: 'Darurat Medis', emoji: '🚨', status: 'emergency', description: 'Urin berwarna coklat gelap bisa menandakan dehidrasi sangat parah, masalah hati, atau kondisi medis lainnya.', recommendation: 'Hubungi dokter atau pergi ke fasilitas kesehatan terdekat. Sambil menunggu, minum air putih secara perlahan.', hydrationLevel: 5 },
]

const MYTHS = [
  { myth: 'Kamu harus minum 8 gelas air setiap hari', fact: 'Kebutuhan air setiap orang berbeda tergantung berat badan, aktivitas, dan cuaca. Rumus yang lebih akurat: berat badan (kg) × 30-35 mL.', busted: true },
  { myth: 'Kopi dan teh membuat dehidrasi', fact: 'Kafein memiliki efek diuretik ringan, tapi kopi dan teh tetap berkontribusi pada hidrasi harian. Yang penting, jangan berlebihan (>4 cangkir/hari).', busted: true },
  { myth: 'Minum air dingin membakar lebih banyak kalori', fact: 'Secara teknis benar, tapi efeknya sangat kecil (sekitar 8 kalori per gelas). Bukan cara efektif untuk menurunkan berat badan.', busted: false },
  { myth: 'Kalau sudah haus berarti sudah dehidrasi', fact: 'Benar! Rasa haus muncul ketika tubuh sudah kehilangan sekitar 1-2% cairan. Lebih baik minum secara berkala sebelum merasa haus.', busted: false },
  { myth: 'Air mineral lebih sehat dari air biasa', fact: 'Perbedaan kandungan mineralnya sangat kecil. Yang terpenting adalah kamu minum cukup air, dari sumber mana pun.', busted: true },
]

const ALL_FOODS = [
  { name: 'Semangka', water: 92, emoji: '🍉' }, { name: 'Timun', water: 96, emoji: '🥒' },
  { name: 'Tomat', water: 94, emoji: '🍅' }, { name: 'Jeruk', water: 87, emoji: '🍊' },
  { name: 'Stroberi', water: 91, emoji: '🍓' }, { name: 'Melon', water: 90, emoji: '🍈' },
  { name: 'Selada', water: 96, emoji: '🥬' }, { name: 'Sup Bening', water: 92, emoji: '🍲' },
  { name: 'Bayam', water: 92, emoji: '🥗' }, { name: 'Pir', water: 88, emoji: '🍐' },
  { name: 'Apel', water: 86, emoji: '🍎' }, { name: 'Anggur', water: 81, emoji: '🍇' },
  { name: 'Nanas', water: 86, emoji: '🍍' }, { name: 'Seledri', water: 95, emoji: '🌿' },
]

const ALL_ARTICLES = [
  { id: 1, icon: Brain, title: 'Mengapa Hidrasi Itu Penting?', summary: 'Tubuh manusia terdiri dari 60% air. Setiap sel, jaringan, dan organ membutuhkan air untuk bekerja dengan baik.', content: 'Air berperan dalam hampir semua fungsi tubuh: mengatur suhu tubuh, melumasi sendi, membawa nutrisi ke sel, dan membuang racun. Bahkan dehidrasi ringan (1-2%) sudah bisa mengganggu konsentrasi dan suasana hati kamu.', readTime: '3 menit', accent: 'sky' },
  { id: 2, icon: AlertTriangle, title: 'Tanda-Tanda Kamu Kurang Minum Air', summary: 'Dehidrasi bisa datang tanpa disadari. Kenali gejalanya sebelum terlambat.', content: 'Gejala dehidrasi ringan: mulut kering, urin berwarna kuning tua, sakit kepala, pusing, mudah lelah. Gejala berat: detak jantung cepat, napas cepat, kulit tidak elastis, dan kebingungan.', readTime: '4 menit', accent: 'amber' },
  { id: 3, icon: Lightbulb, title: 'Tips Minum Air yang Benar', summary: 'Bukan hanya soal berapa banyak, tapi juga bagaimana cara meminumnya.', content: '1. Minum segelas air segera setelah bangun tidur. 2. Jangan tunggu sampai haus. 3. Minum sedikit-sedikit tapi sering. 4. Saat makan, minum air secukupnya. 5. Perhatikan warna urin kamu.', readTime: '5 menit', accent: 'sky' },
  { id: 4, icon: Sun, title: 'Hidrasi di Cuaca Panas', summary: 'Cuaca panas menguras lebih banyak cairan tubuh.', content: 'Suhu ekstrem meningkatkan risiko dehidrasi. Kebutuhan air bisa meningkat 500-800 mL. Tips: selalu bawa botol minum, hindari kafein berlebihan, dan konsumsi buah-buahan kaya air.', readTime: '4 menit', accent: 'cyan' },
  { id: 5, icon: Droplet, title: 'Berapa Liter Sebenarnya?', summary: 'Aturan 8 gelas per hari sudah tidak sepenuhnya akurat.', content: 'Menurut Institute of Medicine, pria butuh sekitar 3.7 liter dan wanita 2.7 liter dari semua minuman dan makanan. Namun angka ini sangat dipengaruhi oleh tingkat aktivitas dan cuaca tempat tinggalmu.', readTime: '3 menit', accent: 'sky' },
  { id: 6, icon: Beaker, title: 'Minuman Isotonik vs Air Putih', summary: 'Kapan kamu butuh minuman elektrolit?', content: 'Untuk aktivitas biasa, air putih sudah lebih dari cukup. Minuman isotonik baru diperlukan jika kamu berolahraga intensif lebih dari 60 menit atau berkeringat sangat banyak di cuaca terik.', readTime: '4 menit', accent: 'amber' },
]

const ACCENT_STYLES = {
  sky:   { icon: 'text-sky-500', bg: 'bg-sky-100', border: 'border-sky-200/60' },
  amber: { icon: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200/60' },
  cyan:  { icon: 'text-cyan-500', bg: 'bg-cyan-100', border: 'border-cyan-200/60' },
}

const STATUS_STYLES = {
  info:      { border: 'border-sky-200/60',    bg: 'bg-sky-50/80',    text: 'text-sky-600',    badge: 'bg-sky-100 text-sky-600' },
  perfect:   { border: 'border-emerald-200/60', bg: 'bg-emerald-50/80', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-600' },
  good:      { border: 'border-green-200/60',  bg: 'bg-green-50/80',  text: 'text-green-600',  badge: 'bg-green-100 text-green-600' },
  normal:    { border: 'border-lime-200/60',   bg: 'bg-lime-50/80',   text: 'text-lime-600',   badge: 'bg-lime-100 text-lime-600' },
  warning:   { border: 'border-yellow-200/60', bg: 'bg-yellow-50/80', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-600' },
  danger:    { border: 'border-amber-200/60',  bg: 'bg-amber-50/80',  text: 'text-amber-600',  badge: 'bg-amber-100 text-amber-600' },
  critical:  { border: 'border-orange-200/60', bg: 'bg-orange-50/80', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-600' },
  emergency: { border: 'border-red-200/60',    bg: 'bg-red-50/80',    text: 'text-red-600',    badge: 'bg-red-100 text-red-600' },
}

function getDailyRandomSeed() {
  const now = new Date()
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
}

// Pseudorandom generator based on seed
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

function shuffleArray(array, seed) {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

function UrineColorChart() {
  const [selected, setSelected] = useState(null)
  const selectedData = selected !== null ? URINE_COLORS[selected] : null
  const style = selectedData ? STATUS_STYLES[selectedData.status] : null

  return (
    <Card className="animate-fade-in animate-delay-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><Beaker className="w-5 h-5 text-sky-500" /> Panduan Warna Urin</h3>
      <p className="text-sm text-gray-500 mb-5">Klik salah satu warna di bawah untuk melihat penjelasan dan rekomendasi hidrasi</p>
      <div className="flex gap-1.5 mb-5">
        {URINE_COLORS.map((item, index) => (
          <button key={item.id} onClick={() => setSelected(selected === index ? null : index)}
            className={`flex-1 group relative transition-all duration-300 rounded-xl overflow-hidden
              ${selected === index ? 'ring-2 ring-sky-400/40 scale-105 shadow-lg z-10' : selected !== null ? 'opacity-40 hover:opacity-70' : 'hover:scale-105 hover:shadow-md'}`} title={item.label}>
            <div className="h-16 md:h-20 rounded-xl transition-all duration-300" style={{ backgroundColor: item.color }} />
            <div className={`absolute inset-0 rounded-xl flex items-end justify-center pb-1 ${selected === index ? 'bg-black/10' : 'bg-black/0 group-hover:bg-black/5'}`}>
              <span className="text-[10px] font-bold text-black/60 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">{item.emoji}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 mb-5">
        <div className="flex-1 text-center"><p className="text-[10px] text-gray-400">Terlalu banyak</p></div>
        <div className="flex-[2] text-center"><p className="text-[10px] text-sky-500 font-semibold">← Ideal →</p></div>
        <div className="flex-[2]" />
        <div className="flex-[3] text-center"><p className="text-[10px] text-amber-500 font-semibold">← Dehidrasi →</p></div>
      </div>
      {selectedData && style && (
        <div className={`rounded-xl border ${style.border} ${style.bg} p-5 animate-fade-in relative backdrop-blur-sm`}>
          <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"><X className="w-4 h-4" /></button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl border-2 border-white/40 shadow-lg flex-shrink-0" style={{ backgroundColor: selectedData.color }} />
            <div>
              <h4 className="font-bold text-gray-700 text-lg">{selectedData.emoji} {selectedData.label}</h4>
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 ${style.badge}`}>{selectedData.level}</span>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5"><span>Level Hidrasi</span><span className={`font-bold ${style.text}`}>{selectedData.hydrationLevel}%</span></div>
            <div className="w-full h-2.5 rounded-full bg-white/40 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${selectedData.hydrationLevel}%`, background: `linear-gradient(90deg, ${selectedData.color}, ${selectedData.color}dd)` }} />
            </div>
          </div>
          <div className="mb-4"><h5 className="text-sm font-semibold text-gray-600 mb-1.5">📋 Penjelasan</h5><p className="text-sm text-gray-500 leading-relaxed">{selectedData.description}</p></div>
          <div className="p-3.5 rounded-xl bg-white/50 border border-white/60"><h5 className="text-sm font-semibold text-gray-600 mb-1.5">💡 Rekomendasi</h5><p className="text-sm text-gray-500 leading-relaxed">{selectedData.recommendation}</p></div>
        </div>
      )}
      {selected === null && <div className="text-center py-4 text-gray-400 text-sm animate-pulse">👆 Ketuk salah satu warna di atas untuk melihat detail</div>}
    </Card>
  )
}

function MythBuster() {
  const [openIndex, setOpenIndex] = useState(null)
  return (
    <Card className="animate-fade-in animate-delay-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-amber-500" /> Mitos vs Fakta Hidrasi</h3>
      <p className="text-sm text-gray-500 mb-4">Jangan percaya semua yang kamu dengar! Cek faktanya di sini.</p>
      <div className="space-y-2">
        {MYTHS.map((item, index) => (
          <div key={index} className={`rounded-xl border transition-all duration-300 overflow-hidden
            ${openIndex === index ? 'border-sky-200/60 bg-sky-50/50' : 'border-gray-200/60 hover:border-sky-200/40 bg-white/40'}`}>
            <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between p-4 text-left">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${item.busted ? 'bg-red-100' : 'bg-green-100'}`}>{item.busted ? '❌' : '✅'}</div>
                <span className="text-sm font-medium text-gray-600 pr-2">"{item.myth}"</span>
              </div>
              {openIndex === index ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 animate-fade-in">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/50 border border-sky-100/60">
                  <ShieldCheck className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-sky-600 mb-1">{item.busted ? 'MITOS — Tidak sepenuhnya benar!' : 'FAKTA — Ini benar!'}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.fact}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function HydratingFoods() {
  const seed = getDailyRandomSeed()
  const dailyFoods = useMemo(() => shuffleArray(ALL_FOODS, seed).slice(0, 8), [seed])

  return (
    <Card className="animate-fade-in animate-delay-400">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><Apple className="w-5 h-5 text-green-500" /> Makanan Kaya Air Hari Ini</h3>
      <p className="text-sm text-gray-500 mb-4">Saran buah & sayur ini berubah setiap hari untuk variasi dietmu!</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {dailyFoods.map((food, index) => (
          <div key={index} className="p-3 rounded-xl bg-white/40 border border-sky-100/60 hover:border-sky-300/40 hover:bg-sky-50/50 transition-all duration-300 text-center group">
            <span className="text-2xl block mb-1.5">{food.emoji}</span>
            <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">{food.name}</p>
            <div className="mt-2">
              <div className="w-full h-1.5 rounded-full bg-sky-50 overflow-hidden">
                <div className="h-full rounded-full bg-sky-400/60 transition-all duration-700" style={{ width: `${food.water}%` }} />
              </div>
              <p className="text-[11px] text-sky-600 font-semibold mt-1">{food.water}% air</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function NewsArticles() {
  const [timeNow, setTimeNow] = useState(Date.now())
  
  useEffect(() => {
    const timer = setInterval(() => setTimeNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  const seed = getDailyRandomSeed()
  const dailyArticles = useMemo(() => shuffleArray(ALL_ARTICLES, seed).slice(0, 4), [seed])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 animate-fade-in">
          <BookOpen className="w-5 h-5 text-sky-500" /> Artikel Terkini
        </h3>
        <span className="text-[10px] text-gray-400 px-2 py-0.5 rounded-full bg-white/50 border border-gray-200 animate-pulse">
          LIVE
        </span>
      </div>
      {dailyArticles.map((article, index) => {
        const style = ACCENT_STYLES[article.accent]
        const Icon = article.icon
        // Generate a pseudo-random minutes ago based on index and current time to simulate real-time updates
        const minutesAgo = Math.floor((seededRandom(seed + index) * 120)) + Math.floor((timeNow % 3600000) / 60000) % 60
        const timeText = minutesAgo === 0 ? 'Baru saja' : minutesAgo < 60 ? `${minutesAgo} menit yang lalu` : `${Math.floor(minutesAgo/60)} jam yang lalu`
        
        return (
          <div key={article.id} className={`card animate-fade-in ${style.border}`} style={{ animationDelay: `${(index + 2) * 100}ms` }}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-6 h-6 ${style.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h3 className="font-semibold text-gray-700">{article.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-emerald-500 font-medium whitespace-nowrap hidden sm:inline-block">Diperbarui {timeText}</span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-500 font-medium mb-1.5 sm:hidden">Diperbarui {timeText}</p>
                <p className="text-sm text-gray-500 mb-3">{article.summary}</p>
                <p className="text-sm text-gray-500/80 leading-relaxed">{article.content}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Education() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2"><BookOpen className="w-6 h-6 text-sky-500" /> Edukasi Hidrasi</h2>
        <p className="text-gray-500 mt-1 font-medium">Pelajari tentang pentingnya minum air yang cukup</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <div className="card animate-fade-in animate-delay-100 border-sky-200/60">
            <h3 className="font-semibold text-sky-600 mb-3 flex items-center gap-1.5"><Droplet className="w-4 h-4" /> Tahukah Kamu?</h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {['Tubuh kehilangan 2-3 liter air per hari melalui keringat dan napas', 'Otak kita 73% terdiri dari air — dehidrasi langsung mempengaruhi kinerja otak', 'Minum air cukup dapat membantu menurunkan berat badan', 'Air putih adalah minuman terbaik — 0 kalori, 0 gula'].map((fact, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-sky-500 mt-0.5">✓</span><span>{fact}</span></li>
              ))}
            </ul>
          </div>
          <UrineColorChart />
          <MythBuster />
          <HydratingFoods />
        </div>
        
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="animate-fade-in animate-delay-100">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-sky-500" /> Tanya AI
            </h3>
            <AIChat />
          </div>
          <NewsArticles />
        </div>
      </div>
    </div>
  )
}