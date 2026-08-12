export const COMPANY = {
  name: "Marmara Barber",
  legalName: "Backroom İç ve Dış Ticaret Anonim Şirketi",
  email: "yk@marmarabarber.com",
  emailAlt: "postmaster@tr.marmarabarber.com",
  phone: "+90 850 441 51 01",
  address: "Tinaz Mevkii 18202. Sk. No: 14/1 Yeni Taşköprü / Merkez / Düzce",
  addressHq: "Çengeldere Mah. Cumhuriyet Cad. No:186 Çavuşbaşı-Beykoz-İstanbul",
  vergiDairesi: "Düzce",
  vergiNo: "1291021043",
  kepmail: "backroom@hs01.kep.tr",
  site: "www.marmarabarber.com",
};

export type LegalSection = {
  id: string;
  title: string;
  content: string[];
};

export const LEGAL_PAGES = {
  hakkimizda: {
    title: "Hakkımızda",
    sections: [
      {
        id: "who",
        title: "Marmara Barber Kimdir?",
        content: [
          "Marmara Barber 1992 yılında İstanbul Feriköy’de kuruldu.",
          "Geniş üretim kapasitemiz ile hem kendi markalarımızda hem de fason üretimde Türkiye’nin önde gelen firmaları arasında yer alıyoruz. Ürün gamımızda kolonyalar, parfümler, oda spreyleri, krem kolonyalar, tıraş jelleri, losyonlar, saç bakım ve saç şekillendirme ürünleri, sakal yağı ve tekstil ürünleri gibi birçok ürünümüz bulunmaktadır.",
          "Şu anda 54 ülke ve 6 kıtaya ihracat yapan, dünya çapında tanınan bir markayız.",
          "Ürünlerimiz, GMP iyi üretim standartlarına göre üretilmektedir. Kalite yönetim sistemi odaklı çalışmakta olup, müşteri memnuniyetini her zaman ön planda tutmaktayız.",
        ],
      },
      {
        id: "vision",
        title: "Vizyonumuz",
        content: [
          "Bir Türk markası olarak kozmetik sektöründe, her ülkede hem erkeklerin hem de kadınların bir numaralı tercihi olmak ve ihracat başarımızı sürdürerek dünya kozmetik pazarında lider markalardan biri olmaktır.",
        ],
      },
      {
        id: "mission",
        title: "Misyonumuz",
        content: [
          "Beklentileri karşılamak, müşteri odaklı yaklaşım, modern ve gelişmiş teknolojiyi kullanarak kaliteli ürünler üretmek. Yasal yükümlülükleri yerine getirerek çalışanların etik değerlere dayalı çalışma yapısına ve yetkinliğine saygı duymak.",
        ],
      },
      {
        id: "partner",
        title: "Partnerlik",
        content: [
          "Marmara Barber ile iş birliği; kaliteli bakım ürünleri, çeşitlilik, ekonomik avantajlar ve marka değeri sunar.",
          "Amerika ve Avrupa’da berberlerin en çok tercih ettiği markalardan biri olmanın gururunu yaşıyoruz. Türkiye pazarında ölçeklenebilir başarı için pazarlama desteği sunuyoruz.",
        ],
      },
    ] as LegalSection[],
  },

  uyelik: {
    title: "Üyelik Sözleşmesi",
    sections: [
      {
        id: "intro",
        title: "Giriş",
        content: [
          "Sitemize üye olmadan önce aşağıda yer alan sözleşmeyi dikkatlice okuyunuz.",
        ],
      },
      {
        id: "parties",
        title: "1. Taraflar",
        content: [
          `a) ${COMPANY.site} internet sitesinin faaliyetlerini yürüten ${COMPANY.addressHq} adresinde mukim ${COMPANY.legalName} (Bundan böyle Marmara Barber olarak anılacaktır).`,
          "b) İnternet sitesine üye olan internet kullanıcısı (“Üye”).",
        ],
      },
      {
        id: "subject",
        title: "2. Sözleşmenin Konusu",
        content: [
          "İşbu Sözleşme’nin konusu, Marmara Barber’ın sahip olduğu internet sitesinden üyenin faydalanma şartlarının belirlenmesidir.",
        ],
      },
      {
        id: "obligations",
        title: "3. Tarafların Hak ve Yükümlülükleri",
        content: [
          "3.1. Üye, üye olurken verdiği kişisel ve diğer bilgilerin doğru olduğunu; gerçeğe aykırılık nedeniyle Marmara Barber’ın uğrayacağı zararları tazmin edeceğini kabul eder.",
          "3.2. Üye, kendisine verilen şifreyi üçüncü kişilere veremez; şifre kullanım hakkı bizzat kendisine aittir.",
          "3.3. Üye, siteyi kullanırken yasal mevzuata riayet etmeyi kabul eder. Aksi halde doğacak yükümlülükler üyeyi bağlar.",
          "3.4. Üye siteyi kamu düzenini bozucu, genel ahlaka aykırı, taciz edici veya başkalarının haklarına tecavüz edecek şekilde kullanamaz; spam, virüs vb. faaliyetlerde bulunamaz.",
          "3.5. Üyeler tarafından beyan edilen fikir ve düşünceler kişilerin kendi görüşleridir; Marmara Barber bunlardan sorumlu değildir.",
          "3.6. Marmara Barber, üye verilerinin yetkisiz okunması veya yazılıma gelebilecek zararlardan sorumlu değildir. Üye site kullanımından doğabilecek zararlar için tazminat talep etmemeyi peşinen kabul eder.",
          "3.7. Üye, diğer kullanıcıların yazılım ve verilerine izinsiz erişmemeyi kabul eder.",
          "3.8. Sözleşme maddelerini ihlal eden üye hukuki ve cezai olarak şahsen sorumludur; Marmara Barber’ın tazminat hakkı saklıdır.",
          "3.9. Marmara Barber gerektiğinde üyenin üyeliğini ve ilgili dosya/bilgileri silme hakkını saklı tutar.",
          "3.10. Site yazılım ve tasarımı Marmara Barber mülkiyetindedir; izinsiz kullanılamaz.",
          "3.11. Site iyileştirme ve yasal çerçevede IP, erişim tarihi/saat, ziyaret edilen sayfalar gibi teknik bilgiler toplanabilir.",
          "3.12. Yasal zorunluluk veya hakların korunması hallerinde kişisel bilgiler yetkili mercilerle paylaşılabilir.",
          "3.13. Virüs ve benzeri tehditlere karşı imkanlar dahilinde tedbir alınır; kullanıcının kendi koruma sistemini kullanması gerekir.",
          "3.14. Marmara Barber site içeriğini ve hizmetleri değiştirme, sona erdirme veya kullanıcı verilerini silme hakkını saklı tutar.",
          "3.15. Marmara Barber üyelik koşullarını ön ihbar olmaksızın değiştirebilir; değişiklikler yayın tarihinde yürürlüğe girer.",
          "3.16. Marmara Barber’a ait bilgisayar kayıtları delil sözleşmesi niteliğindedir.",
          "3.17. Üye, bilgilendirme e-posta ve SMS gönderimini üyelik onayı ile kabul etmiş sayılır.",
        ],
      },
      {
        id: "termination",
        title: "4. Sözleşmenin Feshi",
        content: [
          "Sözleşme, üyenin üyeliğini iptal etmesi veya Marmara Barber tarafından iptal edilmesine kadar yürürlükte kalır. İhlal halinde Marmara Barber üyeliği tek taraflı feshedebilir.",
        ],
      },
      {
        id: "disputes",
        title: "5. İhtilafların Halli",
        content: ["İşbu sözleşmeye ilişkin ihtilaflarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir."],
      },
      {
        id: "validity",
        title: "6. Yürürlük",
        content: [
          "Üyelik kaydı yapılması, üyenin tüm maddeleri okuyup kabul ettiği anlamına gelir. Sözleşme üyelik anında yürürlüğe girer.",
        ],
      },
    ] as LegalSection[],
  },

  aydinlatma: {
    title: "Aydınlatma Metni",
    sections: [
      {
        id: "controller",
        title: "Veri Sorumlusu",
        content: [
          `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri sorumlusu: ${COMPANY.legalName}`,
          `Adres: ${COMPANY.address}`,
          `Genel merkez: ${COMPANY.addressHq}`,
          `E-posta: ${COMPANY.email} | Telefon: ${COMPANY.phone}`,
          `KEP: ${COMPANY.kepmail}`,
          `Vergi Dairesi: ${COMPANY.vergiDairesi} | Vergi No: ${COMPANY.vergiNo}`,
        ],
      },
      {
        id: "processed",
        title: "İşlenen Kişisel Veriler",
        content: [
          "Kimlik bilgileri (ad, soyad, T.C. kimlik numarası — gerektiğinde), iletişim bilgileri (e-posta, telefon, adres), müşteri işlem bilgileri (sipariş, ödeme, iade), pazarlama tercihleri ve çerez / teknik kayıtlar işlenebilir.",
        ],
      },
      {
        id: "purposes",
        title: "İşleme Amaçları",
        content: [
          "Sipariş, ödeme ve teslimat süreçlerinin yürütülmesi",
          "Müşteri ilişkileri ve destek hizmetlerinin sunulması",
          "Yasal yükümlülüklerin yerine getirilmesi",
          "Açık rızanız halinde kampanya, bülten ve bilgilendirme iletişimi",
        ],
      },
      {
        id: "rights",
        title: "İlgili Kişi Hakları",
        content: [
          "KVKK md. 11 kapsamında; verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz.",
          `Başvurularınızı KEP (${COMPANY.kepmail}), yazılı / noter yolu veya iadeli taahhütlü posta ile iletebilir; ayrıca sitemizdeki KVKK Başvuru Formu’nu kullanabilirsiniz.`,
          "Talepleriniz, niteliğine göre ulaştığı tarihten itibaren otuz gün içinde yanıtlanır.",
        ],
      },
    ] as LegalSection[],
  },

  kvkkForm: {
    title: "KVKK Başvuru Formu",
    sections: [
      {
        id: "general",
        title: "Genel Açıklamalar",
        content: [
          "Kişisel Verilerin Korunması Hakkında 6698 Sayılı Kanun’un 11. maddesi uyarınca ilgili kişi olarak tanımlanan veri sahiplerine kişisel verilerinin işlenmesine ve korunmasına ilişkin başvuru hakkı tanınmıştır.",
        ],
      },
      {
        id: "channels",
        title: "Başvuru Kanalları",
        content: [
          `KEP Adresimiz: ${COMPANY.kepmail}`,
          "Yazılı olarak şahsen veya noter vasıtasıyla",
          "İadeli taahhütlü posta yolu ile",
          `Başvuru formunu doldurarak ${COMPANY.legalName} Genel Merkezimize (${COMPANY.addressHq}) yazılı olarak iletebilirsiniz.`,
        ],
      },
      {
        id: "required",
        title: "Başvurunuzda Bulunması Gerekenler",
        content: [
          "a) Adınız, soyadınız ve imzanız",
          "b) T.C. vatandaşı iseniz T.C. kimlik numarası; yabancı iseniz uyruğunuz, pasaport veya kimlik numaranız",
          "c) Tebligata esas yerleşim yeri veya iş yeri adresiniz",
          "d) Varsa elektronik posta, telefon ve faks numaranız",
          "e) Başvuru talep konunuz",
        ],
      },
      {
        id: "response",
        title: "Yanıt Süresi ve Ücret",
        content: [
          "Başvurularınız KVKK md. 13/2 gereğince talebin niteliğine göre ulaştığı tarihten itibaren otuz gün içinde yanıtlanır; yanıt yazılı veya elektronik ortamda iletilir.",
          "Yanlış / güncel olmayan bilgi veya yetkisiz başvurulardan şirketimiz mesuliyet kabul etmez.",
          "Başvuru için ücret alınmaz; işlemin ayrıca maliyeti varsa Kurul tarifesindeki ücret uygulanabilir. Hata şirketimizden kaynaklanırsa ücret iade edilir.",
        ],
      },
    ] as LegalSection[],
  },

  kvkk: {
    title: "KVKK Aydınlatma Metni",
    sections: [
      {
        id: "controller",
        title: "Veri Sorumlusu",
        content: [
          `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri sorumlusu: ${COMPANY.legalName}`,
          `Adres: ${COMPANY.address}`,
          `Genel merkez: ${COMPANY.addressHq}`,
          `E-posta: ${COMPANY.email} | Telefon: ${COMPANY.phone}`,
          `KEP: ${COMPANY.kepmail}`,
          `Vergi Dairesi: ${COMPANY.vergiDairesi} | Vergi No: ${COMPANY.vergiNo}`,
        ],
      },
      {
        id: "processed",
        title: "İşlenen Kişisel Veriler",
        content: [
          "Kimlik bilgileri (ad, soyad, T.C. kimlik numarası — gerektiğinde), iletişim bilgileri (e-posta, telefon, adres), müşteri işlem bilgileri (sipariş, ödeme, iade), pazarlama tercihleri ve çerez / teknik kayıtlar işlenebilir.",
        ],
      },
      {
        id: "purposes",
        title: "İşleme Amaçları",
        content: [
          "Sipariş, ödeme ve teslimat süreçlerinin yürütülmesi",
          "Müşteri ilişkileri ve destek hizmetlerinin sunulması",
          "Yasal yükümlülüklerin yerine getirilmesi",
          "Açık rızanız halinde kampanya, bülten ve bilgilendirme iletişimi",
        ],
      },
      {
        id: "rights",
        title: "İlgili Kişi Hakları",
        content: [
          "KVKK md. 11 kapsamında; verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz.",
          `Başvurularınızı KEP (${COMPANY.kepmail}), yazılı / noter yolu veya iadeli taahhütlü posta ile iletebilir; ayrıca sitemizdeki KVKK Başvuru Formu’nu kullanabilirsiniz.`,
          "Talepleriniz, niteliğine göre ulaştığı tarihten itibaren otuz gün içinde yanıtlanır.",
        ],
      },
    ] as LegalSection[],
  },

  gizlilik: {
    title: "Gizlilik Politikası",
    sections: [
      {
        id: "scope",
        title: "Kapsam",
        content: [
          "Bu politika, web sitemiz üzerinden toplanan bilgilerin nasıl kullanıldığını açıklar.",
          "Siteyi kullanarak bu politikayı kabul etmiş sayılırsınız. Detaylı aydınlatma için Aydınlatma Metni sayfamızı inceleyiniz.",
        ],
      },
      {
        id: "collection",
        title: "Toplanan Bilgiler",
        content: [
          "Hesap oluşturma, sipariş verme veya bülten kaydı sırasında sağladığınız bilgiler.",
          "Otomatik toplanan teknik veriler: IP adresi, tarayıcı türü, oturum süresi ve çerez verileri.",
        ],
      },
      {
        id: "sharing",
        title: "Üçüncü Taraflarla Paylaşım",
        content: [
          "Ödeme altyapısı, kargo firmaları ve yasal zorunluluk halinde yetkili kurumlarla sınırlı paylaşım yapılabilir.",
          "Verileriniz izniniz olmadan pazarlama amacıyla üçüncü taraflara satılmaz.",
        ],
      },
      {
        id: "security",
        title: "Güvenlik",
        content: [
          "Kredi kartı bilgileri 128 bit SSL ile şifrelenir. Verilerinizi korumak için erişim kontrolü ve güvenlik önlemleri uygulanır.",
        ],
      },
    ] as LegalSection[],
  },

  cerez: {
    title: "Çerez Politikası",
    sections: [
      {
        id: "what",
        title: "Çerez Nedir?",
        content: [
          "Çerezler, web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır.",
          "Oturum yönetimi, sepet hatırlama ve site performans analizi için kullanılır.",
        ],
      },
      {
        id: "types",
        title: "Kullandığımız Çerez Türleri",
        content: [
          "Zorunlu çerezler: Sitenin çalışması için gereklidir (oturum, sepet).",
          "Performans çerezleri: Anonim kullanım istatistikleri.",
          "Pazarlama çerezleri: Açık rızanız ile kişiselleştirilmiş içerik.",
        ],
      },
      {
        id: "manage",
        title: "Çerezleri Yönetme",
        content: [
          "Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz.",
          "Zorunlu çerezlerin devre dışı bırakılması alışveriş deneyimini etkileyebilir.",
        ],
      },
    ] as LegalSection[],
  },

  sss: {
    title: "Sıkça Sorulan Sorular",
    sections: [
      {
        id: "order",
        title: "Sipariş ve Ödeme",
        content: [
          "S: Ödeme yöntemleri nelerdir? C: Kredi/banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Kart bilgileriniz 128 bit SSL ile şifrelenir.",
          "S: Havale sonrası ne olur? C: Havale bildiriminden sonra sipariş onaylanır; 3 iş günü içinde yatırılmayan siparişler iptal edilir.",
        ],
      },
      {
        id: "shipping",
        title: "Kargo",
        content: [
          "S: Ne zaman kargoya verilir? C: Kart ödemelerinde banka onayı sonrası aynı gün; havalede hesabımıza geçiş sonrası aynı gün kargoya verilir.",
          "S: Teslimat nasıl yapılır? C: Kargo firmasının adrese teslim bölgesindeyse adrese; değilse ofisten teslimat yapılır.",
        ],
      },
      {
        id: "returns",
        title: "İade",
        content: [
          "S: İade süresi nedir? C: Satın aldığınız ürünleri 14 iş günü içinde iade edebilirsiniz.",
          "S: Açılmış kozmetik ürünler iade edilir mi? C: Kolonya, wax, losyon, saç spreyi vb. sağlık açısından risk oluşturabilecek ürünlerde (ayıplı mal hariç) iade mümkün değildir.",
        ],
      },
    ] as LegalSection[],
  },

  kargo: {
    title: "Teslimat ve Sipariş Koşulları",
    sections: [
      {
        id: "payment",
        title: "Ödeme Seçenekleri",
        content: [
          "Siparişlerinizin ödemesini kredi kartı veya banka havalesi yoluyla yapabilirsiniz.",
          "Kredi kartı bilgileriniz 128 bit SSL kullanılarak şifrelenir. SSL’in aktif olduğunu adres çubuğundaki kilit simgesinden anlayabilirsiniz.",
        ],
      },
      {
        id: "transfer",
        title: "Havale / EFT Ödemeleri",
        content: [
          "Havale seçeneğiyle siparişi tamamladıktan sonra belirtilen tutarı banka hesaplarımıza göndermeniz yeterlidir.",
          "Hızlı onay için havale sonrası bildirim formumuzu kullanın. Siparişi takip eden 3 iş günü içinde havalesi yapılmayan siparişler iptal edilir.",
        ],
      },
      {
        id: "delivery",
        title: "Teslimat Bilgileri",
        content: [
          "Kart ödemelerinde banka onayı ve güvenlik kontrolü sonrası aynı gün; havalede ödemenin hesaba geçmesi sonrası aynı gün kargoya verilir.",
          "Adrese teslim, seçilen kargo firmasının hizmet verdiği bölgelere yapılır. Bölge dışında telefon ihbarlı / ofisten teslimat uygulanır.",
        ],
      },
      {
        id: "company",
        title: "Firma Bilgileri",
        content: [
          `Ünvan: ${COMPANY.legalName}`,
          `Telefon: ${COMPANY.phone}`,
          `Adres: ${COMPANY.addressHq}`,
          `E-posta: ${COMPANY.emailAlt}`,
        ],
      },
    ] as LegalSection[],
  },

  iade: {
    title: "İade ve Değişim Şartları",
    sections: [
      {
        id: "period",
        title: "İade Süresi",
        content: [
          `${COMPANY.site} üzerinden satın aldığınız ürünleri ondört (14) iş günü içerisinde iade edebilirsiniz.`,
        ],
      },
      {
        id: "conditions",
        title: "İade Şartları",
        content: [
          "İade edeceğiniz ürün, orijinal faturası ve iade sebebini belirten bir dilekçe ile birlikte gönderilmelidir.",
          "Orijinal kutusu veya ambalajı bozulmuş, hasar görmüş veya tekrar satılmasını engelleyecek şekilde kullanılamaz hale gelmiş ürünlerin iadesi kabul edilmez.",
          "İade, anlaşmalı kargo firmaları kanalıyla yapılmalıdır. 14 iş günü içinde gönderilen, şartlara uyan ve ayıplı mal kapsamındaki ürünlerde kargo ücreti tarafımızdan karşılanır; aksi halde kargo ücreti müşteriye aittir.",
        ],
      },
      {
        id: "boxed",
        title: "Kutulu Ürünler",
        content: [
          "Ürünlerin kutusu ve orijinal ambalajı hasarsız ve eksiksiz olmalıdır. Orijinal kutu üzerine kargo bandı yapıştırılmamalıdır. Bu şekilde gelen ürünler iade alınmaz ve adresinize geri gönderilir.",
        ],
      },
      {
        id: "special",
        title: "Özel Ürünler",
        content: [
          "Niteliği itibarıyla iade edilemeyecek ürünler (arıza/ayıp dışında); açıldıktan sonra sağlık açısından tehlike arz edebilen ürünler (kolonya, wax, losyon, saç spreyi vb.) ile tek kullanımlık veya tüketim ürünlerinin iadesi mümkün değildir.",
        ],
      },
    ] as LegalSection[],
  },

  iletisim: {
    title: "İletişim",
    sections: [
      {
        id: "contact",
        title: "Firma Bilgileri",
        content: [
          `Firma Ünvanı: ${COMPANY.legalName}`,
          `Adres: ${COMPANY.address}`,
          `Telefon: ${COMPANY.phone}`,
          `E-posta: ${COMPANY.email}`,
          `Vergi Dairesi: ${COMPANY.vergiDairesi}`,
          `Vergi No: ${COMPANY.vergiNo}`,
        ],
      },
    ] as LegalSection[],
  },

  magazalar: {
    title: "Mağazalar",
    sections: [
      {
        id: "stores",
        title: "İletişim ve Merkez",
        content: [
          `Genel merkez: ${COMPANY.addressHq}`,
          `Düzce: ${COMPANY.address}`,
          `Telefon: ${COMPANY.phone}`,
          "Bayi / partner noktaları için bizimle iletişime geçebilirsiniz.",
        ],
      },
    ] as LegalSection[],
  },

  kariyer: {
    title: "Kariyer",
    sections: [
      {
        id: "jobs",
        title: "Bizimle Çalışın",
        content: [
          "Marmara Barber ailesine katılmak isteyen adayları bekliyoruz.",
          `Özgeçmişinizi ${COMPANY.email} adresine “Kariyer” konu başlığı ile gönderebilirsiniz.`,
        ],
      },
    ] as LegalSection[],
  },
} as const;

export type LegalPageKey = keyof typeof LEGAL_PAGES;
