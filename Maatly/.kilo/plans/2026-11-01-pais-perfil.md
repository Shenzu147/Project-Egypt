# Plan: «País del perfil» (v0.51)

**Fecha:** 2026-11-01 · **Tema:** pais-perfil (plan 59) · **Trunk:** `Maatly.html` editado en situ (plan 53). `VER_APP` → `'v0.51'`.

## Petición (decisiones del usuario)

Cuando el usuario cree su acceso a la app (futuro alta Supabase) también se pedirá **a qué país pertenece**, y ese dato alimenta una **regla base** de cómo quiere ver los datos: **moneda** e **idioma**. Decisión de la conversación: el país entra YA en el perfil (sin asistente — ese espera al piloto Supabase); la recarga suave del idioma llega con la infraestructura i18n global (más adelante).

## Diseño

### Storage — `maatlyPerfil` gana `pais`

- `PERFIL_DEF` gana `pais: ''` (vacío hasta que el usuario elija — sin supuestos).
- `perfilSet` acepta/valida `pais` dentro de las claves conocidas (read-modify-write ya existente).
- Dato listo para el alta futura: el país viaja en respaldo XLSX/JSON vía la clave `maatlyPerfil` (ya cubierta).

### UI — bloque «Tu país» dentro de «Tu perfil»

- Tarjeta nueva entre «Idioma de la app» y «Tipo de perfil» (el país es la raíz de idioma+moneda: orden natural).
- Select K-SEL `#selPaisApp` (`sel-maatly cursor-pointer` + mismas clases del resto) con opción vacía «Elegir país…» + lista: Argentina, Bolivia, Chile, Colombia, Costa Rica, Ecuador, El Salvador, España, Estados Unidos, Guatemala, Honduras, México, Nicaragua, Panamá, Paraguay, Perú, Puerto Rico, República Dominicana, Uruguay, Venezuela.
- Solo texto (regla: sin emojis; íconos SVG o tokens del tema).

### Reglas — `PAIS_REGLAS`

- Tabla ` país → { idioma, moneda }` mapeado a las MONEDAS que la app ya conoce (se lee en ejecución la lista real).
- Al elegir país con regla distinta al estado actual → `showModal` de confirmación honesto: *«<País> → sugerimos <idioma> y moneda <Moneda>. ¿Aplicar los valores sugeridos?»* · **Aplicar:** `perfilSet({ idioma })` + camino de moneda + `perfilTextos()` · **Cancelar:** deja solo el país guardado.
- Si la moneda sugerida es la que ya usa el usuario, se aplica el idioma sin tocar nada más (y sin modal repetitivo si no hay nada que cambiar: solo toast).

### Cuidado de ejecución — la moneda vive en `maatlyFinanzasCfg`

- `base/simbolo/decimales/tasas/moneda` viven JUNTAS; el guardado (guard ~4090-4096) preserva claves existentes vía `prevCfg`.
- Al ejecutar se lee el sistema real (`MONEDAS`, `finanzasCfgGet/Set`, `monedaPintar`, el select `selMonedaApp`) y se define el camino mínimo seguro: si la moneda del país ya existe en `MONEDAS`, se aplica `moneda/simbolo/decimales` preservando el resto; si requiere tasa no definida, la tasa queda editable y se avisa con toast (nada de tasas inventadas).
- El select de moneda en Ajustes se re-pinta (`monedaPintar`) tras el cambio y `ddPintar` si aplica.

### Técnica

- Todo texto del bloque país entra al diccionario `PERFIL_I18N` (es/en — la zona ya traducida), pintado por `perfilTextos()` (textContent).
- Copy del tile + `CFG_SECCIONES.perfil.sub` actualizado para mencionar el país.
- `VER_APP` → `'v0.51'`.

## Fuera de alcance

- Asistente de primera vez (espera al piloto Supabase, decisión del usuario) · recarga suave del idioma (infraestructura i18n global, entregas siguientes) · traducción del resto de la app · BITACORA/AGENTS/commits · copias de archivo · CDNs/SRI.

## Verificación mínima

1. `node --check` 5/5 · diff de IDs vs HEAD (esperado: `+selPaisApp` + contenedores del bloque país) · SRI 7/7.
2. Sonda real (Edge headless + CDP): elegir país ⇒ modal con la regla correcta · aplicar ⇒ idioma aplicado + moneda aplicada/re-pintada · cancelar ⇒ solo país guardado · país+idioma persisten tras recarga · 0 excepciones / 0 violaciones CSP.
3. Regresión: i18n Perfil (v0.50) sigue vivo; huella final (MD5 + bytes + líneas).

## Result

**Entregado — v0.51 «País del perfil» sobre `Maatly.html` (in situ).**

- **Huella final:** MD5 `379D13C27807BB39213618E94CD5EDF5` · 937.091 B · 11.206 líneas · `VER_APP = 'v0.51'`.
- **Estático** (`verify_v051.js`): `node --check` 5/5 bloques · 38 anclas OK (PAIS_LISTA 20 países sin Brasil, PAIS_REGLAS ve/mx/co/pe/cl/ar/uy/py/bo/ec/sv/pa/pr/gt/hn/ni/cr/do/es/us, esqueleto moneda v0.40.1: base+tasas preservadas, `delete conv`, cero tasas inventadas, sinTasa honesto) · IDs nuevos únicos (`lblPaisApp`, `descPaisApp`, `selPaisApp`, `notaPais`) · regresión v0.50 intacta · **SRI 7/7** · cero IDs duplicados en el archivo.
- **Sonda real** (`cdp_pais.js`, Edge headless + CDP, puertos 9345/9347): boot 21 opciones + trigger «Elegir país…» + nota sin país · **mx + Cancelar**: país guardado, idioma es y moneda USD intactos · **mx + Aplicar**: MXN $ 2 dec, base USD preservada, `conv` purgado, NADIE inventó la tasa, select de moneda re-pintado («Peso mexicano · $») — el modal abrió la variante `paisApMsgMoneda` porque el idioma ya coincidía (declaración de diseño) · **ve + Aplicar**: VES «Bs.» con `sinTasa=true` y toast que lo declara · **us + Aplicar**: idioma **en** + USD, sección Perfil re-pintada en inglés («App language» / «Your country»), opciones del país en inglés («United States») · re-elegir us ⇒ SIN modal, solo toast «Everything already matches» · **recarga**: país+idioma persisten y se re-pintan · **es + Aplicar**: Español + Euro «€», base USD intocada · **0 excepciones / 0 CSP** en toda la sesión.
- **Captura** (`probe_v051_pais.png`): tarjeta «Tu país» entre Idioma y Tipo de perfil, trigger «México», toast verde «Perfil ajustado a tu país: Español (Latino) y Peso mexicano (MXN)…» — sin banderas ni emojis (regla).
- **Notas de verificación:** dos primeros fallos de sonda eran de la propia sonda (toast: pila de avisos — se busca por contenido; favicon 404: ruido) — la app no tuvo ni un fallo. Baseline de IDs vs era previa no existe en `respaldo/` (solo v0.42–v0.44): se usó verificación dirigida de IDs nuevos + escaneo global de duplicados (0).
- **Carencia conocida (aceptada en decisiones):** la recarga suave del idioma NO viene en v0.51 — el país sugiere idioma y al aplicar solo esta sección (Perfil) se re-pinta; el cambio global de idioma llega con la infraestructura i18n (recarga suave) en entregas de la fila i18n.
