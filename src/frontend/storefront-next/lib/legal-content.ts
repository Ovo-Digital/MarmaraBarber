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
    title: "About Marmara Barber",
    sections: [
      {
        id: "who",
        title: "Who we are",
        content: [
          "Marmara Barber was founded in 1992 in Feriköy, Istanbul.",
          "With large-scale production capacity, we manufacture both our own brands and private label products, and we are among the leading manufacturers in Türkiye. Our range covers colognes, fragrances, room sprays, cream colognes, shave gels, lotions, hair care and styling products, beard oil and textiles.",
          "We export to 54 countries across 6 continents.",
          "Our products are manufactured to GMP good manufacturing practice standards, under a quality management system.",
        ],
      },
      {
        id: "vision",
        title: "Vision",
        content: [
          "To be the first choice in grooming in every market we enter, and to grow into one of the leading brands in the global cosmetics industry.",
        ],
      },
      {
        id: "mission",
        title: "Mission",
        content: [
          "To meet expectations with a customer-focused approach, to manufacture quality products using modern technology, and to respect the ethical values and competence of the people we work with.",
        ],
      },
      {
        id: "partner",
        title: "Wholesale & partnership",
        content: [
          "Working with Marmara Barber means professional-grade grooming products, a broad range, competitive terms and an established brand.",
          "Marmara Barber is already one of the brands barbers reach for across Europe and the United States.",
          "For wholesale, distribution or partnership enquiries, get in touch and we will come back to you.",
        ],
      },
    ] as LegalSection[],
  },

  /* TASLAK: hukukçu gözden geçirmeli. */
  uyelik: {
    title: "Terms of service",
    sections: [
      {
        id: "scope",
        title: "Scope",
        content: [
          `These terms cover your use of this website and any order you place through it with ${COMPANY.name}.`,
          "By placing an order you accept these terms.",
        ],
      },
      {
        id: "account",
        title: "Your account",
        content: [
          "You are responsible for keeping your sign-in details secure and for activity on your account.",
          "You can ask us to close your account at any time.",
        ],
      },
      {
        id: "orders",
        title: "Orders & pricing",
        content: [
          "Prices, taxes and shipping are shown at checkout before you pay.",
          "An order is accepted once payment is approved and we send you a confirmation email.",
          "We may cancel an order and refund you if an item turns out to be unavailable or a price is shown in error.",
        ],
      },
      {
        id: "returns",
        title: "Returns",
        content: [
          "Returns are handled under our Returns & exchanges policy, which forms part of these terms.",
        ],
      },
      {
        id: "use",
        title: "Use of the site",
        content: [
          "Brand names, logos, product photography and site content belong to their owners and may not be reused without permission.",
          "Do not attempt to disrupt the site or access data that is not yours.",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        content: [
          `Questions about these terms: ${COMPANY.email}`,
          `Registered name: ${COMPANY.legalName}`,
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

  /* TASLAK: bu sayfa sitenin gerçekte ne veri işlediğini anlatıyor.
     Yayına almadan önce hedef pazarın hukukçusu (ABD için CCPA/CPRA,
     AB için GDPR) gözden geçirmeli. */
  gizlilik: {
    title: "Privacy policy",
    sections: [
      {
        id: "intro",
        title: "Overview",
        content: [
          `This policy explains what personal data ${COMPANY.name} collects through this website, why, and who processes it.`,
          "It should be reviewed together with our Cookie policy and Terms of service.",
        ],
      },
      {
        id: "collect",
        title: "What we collect",
        content: [
          "Order data: the name, email address, shipping and billing address, phone number and order contents you provide when you buy.",
          "Account data: if you create an account, your name, email address, saved addresses and order history.",
          "Marketing data: your email address, if you sign up for our newsletter.",
          "Technical data: standard server logs and cookie data — see the Cookie policy.",
          "We do not receive or store your card details. Payment is handled by Shopify's checkout.",
        ],
      },
      {
        id: "use",
        title: "How we use it",
        content: [
          "To process, ship and support your orders.",
          "To operate your account and keep your order history available to you.",
          "To send marketing emails, only if you asked for them. Every email carries an unsubscribe link.",
          "To keep the site secure and to understand how it is used.",
        ],
      },
      {
        id: "processors",
        title: "Who processes your data",
        content: [
          "Shopify — store, checkout, payment and customer records.",
          "Payment providers connected to that checkout, for the payment itself.",
          "Carriers, for delivery.",
          "Where an email or SMS marketing tool is connected, that provider, for sending campaigns.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        content: [
          "You can ask for a copy of your data, ask us to correct it, or ask us to delete it.",
          "You can unsubscribe from marketing at any time.",
          `To make a request, email ${COMPANY.email}.`,
        ],
      },
    ] as LegalSection[],
  },

  /* TASLAK: hukukçu gözden geçirmeli. */
  cerez: {
    title: "Cookie policy",
    sections: [
      {
        id: "what",
        title: "What cookies we use",
        content: [
          "Necessary: needed for the site to work — keeping your cart, your session and your sign-in state. These cannot be switched off.",
          "Analytics: help us understand how the site is used, so we can improve it.",
          "Marketing: used only where an advertising or email tool is connected, to measure campaigns.",
        ],
      },
      {
        id: "storage",
        title: "Browser storage",
        content: [
          "This site keeps your cart reference in your browser's local storage so your cart survives a page refresh. The cart contents themselves are held by Shopify.",
        ],
      },
      {
        id: "control",
        title: "Controlling cookies",
        content: [
          "You can clear or block cookies in your browser settings. Blocking necessary cookies will stop the cart and sign-in from working.",
        ],
      },
    ] as LegalSection[],
  },

  sss: {
    title: "Frequently asked questions",
    sections: [
      {
        id: "order",
        title: "Orders & payment",
        content: [
          "Q: How do I pay? A: Checkout is handled by Shopify. Card payments are processed on Shopify's secure checkout — we never see or store your card details.",
          "Q: Will I get a confirmation? A: Yes. An order confirmation is emailed to you as soon as the payment is approved.",
          "Q: Can I change or cancel an order? A: Contact us as soon as possible. If the order has not been dispatched yet we can usually amend or cancel it.",
        ],
      },
      {
        id: "shipping",
        title: "Shipping",
        content: [
          "Q: When is my order dispatched? A: Orders are prepared once payment is approved. You will receive tracking details by email when the parcel leaves us.",
          "Q: Where do you ship? A: Delivery areas, carriers and lead times depend on the market you are ordering from — see Shipping & delivery, or contact us.",
        ],
      },
      {
        id: "returns",
        title: "Returns",
        content: [
          "Q: Can I return an item? A: Unopened products in their original packaging can be returned within the return window that applies to your market. See Returns & exchanges.",
          "Q: Are opened cosmetics returnable? A: For hygiene reasons, opened cologne, wax, lotion, hair spray and similar products cannot be returned unless the item is faulty.",
        ],
      },
      {
        id: "products",
        title: "Products",
        content: [
          "Q: Are your products suitable for professional use? A: Yes. Marmara Barber has been made for the barber's chair since 1970 and is used by professionals in over 50 countries.",
          "Q: Where are they made? A: In our own facilities in Türkiye, to GMP good manufacturing practice standards.",
        ],
      },
    ] as LegalSection[],
  },

  kargo: {
    title: "Shipping & delivery",
    sections: [
      {
        id: "payment",
        title: "Payment",
        content: [
          "Payment is taken on Shopify's secure checkout. Card details are encrypted in transit and are never stored on this site.",
          "Your order is confirmed once the payment is approved, and a confirmation email is sent to the address you provided.",
        ],
      },
      {
        id: "processing",
        title: "Processing",
        content: [
          "Orders are prepared as soon as the payment clears. You will receive tracking details by email when the parcel is handed to the carrier.",
        ],
      },
      {
        id: "delivery",
        title: "Delivery",
        content: [
          "Carriers, delivery areas, lead times and shipping rates are set per market and are shown at checkout before you pay.",
          "If you need a delivery estimate before ordering, contact us and we will confirm it for your address.",
        ],
      },
      {
        id: "company",
        title: "Manufacturer",
        content: [
          `Company: ${COMPANY.legalName}`,
          `Phone: ${COMPANY.phone}`,
          `Address: ${COMPANY.addressHq}`,
          `Email: ${COMPANY.emailAlt}`,
        ],
      },
    ] as LegalSection[],
  },

  iade: {
    title: "Returns & exchanges",
    sections: [
      {
        id: "period",
        title: "Return window",
        content: [
          "Unused products can be returned within the return window that applies to your market. The exact period is confirmed at checkout and in your order confirmation.",
        ],
      },
      {
        id: "conditions",
        title: "Conditions",
        content: [
          "Returned items must be sent back with the original invoice and a note explaining the reason for the return.",
          "Products whose original box or packaging is damaged, missing or no longer resaleable cannot be accepted.",
          "Where an item is faulty, return shipping is covered by us. Otherwise return shipping is paid by the customer.",
        ],
      },
      {
        id: "boxed",
        title: "Boxed products",
        content: [
          "The original box must arrive undamaged and complete. Please do not tape shipping labels directly onto the product box — parcels sent that way cannot be accepted and will be returned to you.",
        ],
      },
      {
        id: "special",
        title: "Non-returnable items",
        content: [
          "For hygiene reasons, products that can pose a health risk once opened — cologne, wax, lotion, hair spray and similar — cannot be returned unless they are faulty. Single-use and consumable items are also non-returnable.",
        ],
      },
    ] as LegalSection[],
  },

  iletisim: {
    title: "Contact",
    sections: [
      {
        id: "contact",
        title: "Get in touch",
        content: [
          "For product, wholesale, distribution and partnership enquiries, email us and we will come back to you.",
          `Email: ${COMPANY.email}`,
          `Phone: ${COMPANY.phone}`,
        ],
      },
      {
        id: "company",
        title: "Company details",
        content: [
          `Registered name: ${COMPANY.legalName}`,
          `Address: ${COMPANY.address}`,
          `Tax office: ${COMPANY.vergiDairesi}`,
          `Tax number: ${COMPANY.vergiNo}`,
        ],
      },
    ] as LegalSection[],
  },

  magazalar: {
    title: "Stores",
    sections: [
      {
        id: "stores",
        title: "Head office & production",
        content: [
          `Head office: ${COMPANY.addressHq}`,
          `Production: ${COMPANY.address}`,
          `Phone: ${COMPANY.phone}`,
        ],
      },
      {
        id: "stockists",
        title: "Stockists",
        content: [
          "Marmara Barber is carried by barbershops and distributors in over 50 countries.",
          "Looking for a stockist near you, or want to carry the range? Get in touch and we will point you to the right contact.",
        ],
      },
    ] as LegalSection[],
  },

  kariyer: {
    title: "Careers",
    sections: [
      {
        id: "jobs",
        title: "Work with us",
        content: [
          "We are always interested in people who want to join the Marmara Barber team.",
          `Send your CV to ${COMPANY.email} with "Careers" in the subject line.`,
        ],
      },
    ] as LegalSection[],
  },
} as const;

export type LegalPageKey = keyof typeof LEGAL_PAGES;
