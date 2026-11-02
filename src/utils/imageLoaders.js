// ============================================================
// Lazy image loaders
// ------------------------------------------------------------
// - import.meta.glob БЕЗ eager → всеки файл е отделен chunk,
//   тегли се on demand от браузъра.
// - In-memory Map кеш → повторно отваряне = 0 заявки.
// - Експортваме ФАБРИКА, за да може всеки проект да получава
//   собствен loader, който зарежда САМО неговите снимки.
// ============================================================

/**
 * Създава lazy loader върху резултата от import.meta.glob.
 * Връща асинхронна функция, която при извикване зарежда
 * САМО снимките на подадения glob, кешира ги и връща масив от URL-и.
 *
 * @param {Record<string, () => Promise<{ default: string }>>} globResult
 * @returns {() => Promise<string[]>}
 */
export const createImageLoader = (globResult) => {
  // Стабилна подредба: 1.jpg, 2.jpg, 10.jpg (числово, не лексикографско)
  const sortedKeys = Object.keys(globResult).sort((a, b) => {
    const numA = parseInt(a.match(/\/(\d+)\.\w+$/)?.[1] || 0, 10);
    const numB = parseInt(b.match(/\/(\d+)\.\w+$/)?.[1] || 0, 10);
    return numA - numB;
  });

  // In-memory кеш (per-loader, оцелява между re-renders)
  const cache = new Map();

  // In-flight guard: ако две клика дойдат едновременно,
  // не пускаме две паралелни заявки за същия файл.
  const inflight = new Map();

  return async () => {
    return Promise.all(
      sortedKeys.map(async (key) => {
        // 1) вече заредено → връщаме от кеша
        if (cache.has(key)) return cache.get(key);

        // 2) вече се зарежда → чакаме същия Promise (dedupe)
        if (inflight.has(key)) return inflight.get(key);

        // 3) ново зареждане
        const promise = globResult[key]().then((mod) => {
          const url = mod.default;
          cache.set(key, url);
          inflight.delete(key);
          return url;
        });

        inflight.set(key, promise);
        return promise;
      }),
    );
  };
};

// ------------------------------------------------------------
// Всеки проект получава СВОЙ loader.
// import.meta.glob трябва да е с ЛИТЕРАЛЕН низ (Vite ограничение),
// затова пътищата са изписани директно.
// ------------------------------------------------------------

export const loadAiImages = createImageLoader(
  import.meta.glob("../assets/allAi/*.jpg"),
);

export const loadAirportImages = createImageLoader(
  import.meta.glob("../assets/airport/*.jpg"),
);

export const loadCocktailClubImages = createImageLoader(
  import.meta.glob("../assets/cocktailClub/*.jpg"),
);

export const loadAddsSystemImages = createImageLoader(
  import.meta.glob("../assets/addsSystem/*.jpg"),
);

export const loadCasinoImages = createImageLoader(
  import.meta.glob("../assets/onlineCasino/*.png"),
);

export const loadDatingImages = createImageLoader(
  import.meta.glob("../assets/datingApp/*.png"),
);

export const loadArtImages = createImageLoader(
  import.meta.glob("../assets/artApp/*.jpg"),
);

export const loadFinderImages = createImageLoader(
  import.meta.glob("../assets/finder/*.jpg"),
);

export const loadChocolateKingdomImages = createImageLoader(
  import.meta.glob("../assets/chocolateKingdom/*.jpg"),
);

export const loadAccountingImages = createImageLoader(
  import.meta.glob("../assets/accountingImages/*.webp"),
);

export const loadTalentImages = createImageLoader(
  import.meta.glob("../assets/talentImages/*.jpg"),
);

export const loadCarShopImages = createImageLoader(
  import.meta.glob("../assets/carShopImages/*.jpg"),
);

export const loadPfcImages = createImageLoader(
  import.meta.glob("../assets/pfcImages/*.jpg"),
);

export const loadGhrImages = createImageLoader(
  import.meta.glob("../assets/ghr/*.jpg"),
);
