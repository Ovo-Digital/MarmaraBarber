/**
 * Sprey boya filtreleri — sayfada bir kez çizilir, tüm denemeler buradan
 * referans verir.
 *
 * İşin özü şu: düz bir şekli türbülans gürültüsüyle "yerinden oynatmak"
 * (feDisplacementMap). Kenar böylece düz kalmıyor, boya gibi düzensizleşiyor.
 * Overspray için aynı şey daha güçlü bozulma + bulanıklıkla tekrarlanıyor,
 * benekler için gürültü eşiklenip şeklin içine kırpılıyor.
 */
export function SprayDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        {/* Boya kenarı — orta şiddette bozulma */}
        <filter id="sp-kaba" x="-25%" y="-40%" width="150%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="7" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="g" scale="22" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Daha sert kenar — ince çizgiler için */}
        <filter id="sp-kaba-ince" x="-30%" y="-50%" width="160%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="19" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="g" scale="12" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Overspray sisi — güçlü bozulma + bulanıklık */}
        <filter id="sp-sis-f" x="-40%" y="-60%" width="180%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="3" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="g" scale="46" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="7" />
        </filter>

        {/* Benek — gürültü eşikleniyor, sonra şeklin içine kırpılıyor */}
        <filter id="sp-benek" x="-25%" y="-40%" width="150%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="41" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    1.6 0 0 0 -0.62"
            result="e"
          />
          <feComposite in="e" in2="SourceGraphic" operator="in" />
        </filter>

        {/* Kenarı tanelendiren birleşik filtre: gövde + çevresine serpilmiş benek */}
        <filter id="sp-taneli" x="-35%" y="-55%" width="170%" height="210%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="13" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="g" scale="20" xChannelSelector="R" yChannelSelector="G" result="govde" />
          <feMorphology in="govde" operator="dilate" radius="7" result="genis" />
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="1" seed="29" result="n2" />
          <feColorMatrix
            in="n2"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    1.5 0 0 0 -0.72"
            result="e2"
          />
          <feComposite in="e2" in2="genis" operator="in" result="serpinti" />
          <feMerge>
            <feMergeNode in="serpinti" />
            <feMergeNode in="govde" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
