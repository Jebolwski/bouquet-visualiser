import * as THREE from 'three';
import { NewspaperStyle } from '@/types';

// Cache generated textures so we don't recreate them every render frame
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates a high-resolution procedural vintage newspaper texture on an HTML Canvas
 */
export function createNewspaperCanvas(style: NewspaperStyle = 'vintage_gazette'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background color palette based on style
  let bgFill = '#f4eee1'; // Warm tea-stained newsprint
  let inkColor = '#24201d';
  let accentInk = '#635343';
  let bannerBg = 'transparent';

  if (style === 'modern_monochrome') {
    bgFill = '#fcfcfc';
    inkColor = '#111111';
    accentInk = '#555555';
  } else if (style === 'french_chic') {
    bgFill = '#f8f4ee';
    inkColor = '#1d1a18';
    accentInk = '#845055';
  } else if (style === 'botanical_times') {
    bgFill = '#eee7d7';
    inkColor = '#1a241b';
    accentInk = '#3a533f';
  }

  // 1. Draw Paper Base
  ctx.fillStyle = bgFill;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Add realistic subtle paper grain noise & fibers
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Ornate Double Border Margin
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(62, 62, canvas.width - 124, canvas.height - 124);

  // 4. Newspaper Header Banner
  ctx.fillStyle = inkColor;
  ctx.textAlign = 'center';

  // Subtitle / Date bar
  ctx.font = 'italic 24px "Times New Roman", Georgia, serif';
  ctx.fillText('FONDE EN 1894 • ÉDITION INTERNATIONALE FLORALE • NUMÉRO 428', canvas.width / 2, 110);

  // Decorative header line
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 130);
  ctx.lineTo(canvas.width - 90, 130);
  ctx.stroke();

  // Masthead Title
  ctx.font = 'bold 118px "Playfair Display", "Times New Roman", serif';
  let title = 'LE JARDINIER BOTANIQUE';
  if (style === 'botanical_times') title = 'THE BOTANICAL TIMES';
  else if (style === 'french_chic') title = 'L’ÉTOILE DES FLEURS';
  else if (style === 'modern_monochrome') title = 'FLORAL GAZETTE';

  ctx.fillText(title, canvas.width / 2, 235);

  // Sub-masthead line & motto
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 260);
  ctx.lineTo(canvas.width - 90, 260);
  ctx.stroke();

  ctx.font = 'italic 26px "Times New Roman", Georgia, serif';
  ctx.fillStyle = accentInk;
  ctx.fillText('« Omnia Vincit Amor, Floresque Cordis » — Paris • Florence • Amsterdam • Kyoto', canvas.width / 2, 295);

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(90, 315);
  ctx.lineTo(canvas.width - 90, 315);
  ctx.stroke();

  // 5. Main Headline
  ctx.fillStyle = inkColor;
  ctx.font = 'bold 54px "Playfair Display", "Times New Roman", serif';
  ctx.fillText('LE LANGAGE SECRET DES FLEURS ET DE L’AMOUR ÉTERNEL', canvas.width / 2, 385);

  // 6. Draw 4 Columns Layout
  const cols = 4;
  const startX = 90;
  const colWidth = (canvas.width - 180 - (cols - 1) * 30) / cols;
  const colY = 430;
  const colHeight = 1530;

  // Draw column divider lines
  ctx.strokeStyle = '#c2baa8';
  ctx.lineWidth = 1;
  for (let c = 1; c < cols; c++) {
    const lx = startX + c * (colWidth + 30) - 15;
    ctx.beginPath();
    ctx.moveTo(lx, colY);
    ctx.lineTo(lx, colY + colHeight);
    ctx.stroke();
  }

  // Draw illustration in column 1 & 2 midsection
  drawBotanicalEngraving(ctx, startX + 20, colY + 30, colWidth * 2 - 10, 420, inkColor);

  // Draw column 1 text (below engraving)
  drawSimulatedArticle(
    ctx,
    startX,
    colY + 480,
    colWidth,
    'DE LA CULTURE DES ROSES',
    [
      'Dans les jardins secrets de Paris, les roses séculaires ouvrent leurs pétales veloutés sous les rayons dorés de l’aube. Chaque bouton recèle un mystère que seuls les passionnés de botanique savent décrypter.',
      'Les floraisons printanières apportent une symphonie de parfums délicats qui embaument les ateliers des plus grands artisans fleuristes.',
      'Depuis l’époque victorienne, offrir un bouquet n’est point un simple geste galant, mais l’expression la plus noble d’un serment d’affection éternelle.',
      'Les horticulteurs renommés sélectionnent avec une patience infinie les variétés les plus harmonieuses pour composer des bouquets magistraux.',
    ],
    inkColor
  );

  // Draw column 2 text
  drawSimulatedArticle(
    ctx,
    startX + colWidth + 30,
    colY + 480,
    colWidth,
    'L’ART DE LA SPIRALE FLÉRIE',
    [
      'La méthode hollandaise de la spirale consiste à lier chaque tige selon un angle précis inspiré de la suite de Fibonacci.',
      'Cette géométrie sacrée permet aux corolles de s’épanouir sans jamais s’étouffer, offrant à l’œil un dôme parfait et une générosité florale incomparable.',
      'Feuillages d’eucalyptus cendré, tiges de lavande sauvage et grappes de gypsophile complètent cette architecture vivante.',
    ],
    inkColor
  );

  // Draw column 3 text
  drawSimulatedArticle(
    ctx,
    startX + (colWidth + 30) * 2,
    colY,
    colWidth,
    'CHRONIQUE HORTICOLE',
    [
      'Hier s’est ouverte à l’Orangerie Royale la grande exposition annuelle des fleurs d’exception. Le jury a décerné la médaille d’or à un ensemble d’une rare poésie.',
      'Les visiteurs ont pu admirer des espèces oubliées telles que la Tulipe Noire de Haarlem et la Rose Damascena cultivée selon les préceptes ancestraux.',
      'Le maître jardinier rappelait hier combien la patience et l’écoute des cycles naturels sont les vertus cardinales de notre noble métier.',
      '« Une fleur ne craint point l’éphémère, car son éclat transcende les saisons dans la mémoire de celui qui la reçoit. »',
    ],
    inkColor
  );

  // Draw a vintage advertisement stamp in column 3 bottom
  drawVintageAdBox(
    ctx,
    startX + (colWidth + 30) * 2,
    colY + 980,
    colWidth,
    380,
    inkColor,
    accentInk
  );

  // Draw column 4 text
  drawSimulatedArticle(
    ctx,
    startX + (colWidth + 30) * 3,
    colY,
    colWidth,
    'CONSEILS DU MAÎTRE',
    [
      'Pour conserver l’éclat de vos bouquets, taillez en biseau chaque tige sous un filet d’eau fraîche et renouvelez l’eau claire chaque matin.',
      'Éloignez vos fleurs des sources directes de chaleur et laissez-les respirer dans une pièce tempérée.',
      'L’art d’emballer dans un papier gazette noble préserve l’humidité tout en offrant une touche d’élégance intemporelle.',
      'Ainsi emmailloté, votre cadeau floral traverse la ville en conservant toute sa fraîcheur matinale.',
    ],
    inkColor
  );

  // Draw Vintage Stamp / Seal in bottom right
  drawVintagePostalStamp(
    ctx,
    startX + (colWidth + 30) * 3 + 20,
    colY + 1120,
    180,
    180,
    '#9e2a2b'
  );

  return canvas;
}

/**
 * Draws an intricate botanical woodcut engraving sketch on the canvas
 */
function drawBotanicalEngraving(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  inkColor: string
) {
  ctx.save();
  ctx.strokeStyle = inkColor;
  ctx.fillStyle = inkColor;
  ctx.lineWidth = 1;

  // Thin frame around engraving
  ctx.strokeRect(x, y, w, h);
  ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

  const cx = x + w / 2;
  const cy = y + h / 2 - 20;

  // Draw Rose bloom sketch lines
  ctx.beginPath();
  // Central whorls
  for (let r = 12; r <= 85; r += 9) {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.stroke();

  // Radiating petal curves
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const px1 = cx + Math.cos(a) * 30;
    const py1 = cy + Math.sin(a) * 30;
    const px2 = cx + Math.cos(a + 0.3) * 90;
    const py2 = cy + Math.sin(a + 0.3) * 90;
    ctx.moveTo(px1, py1);
    ctx.quadraticCurveTo(cx + Math.cos(a + 0.5) * 60, cy + Math.sin(a + 0.5) * 60, px2, py2);
  }
  ctx.stroke();

  // Stem & Leaves
  ctx.beginPath();
  ctx.moveTo(cx, cy + 90);
  ctx.quadraticCurveTo(cx + 25, cy + 140, cx, cy + 190);
  ctx.stroke();

  // Side leaves
  ctx.beginPath();
  ctx.ellipse(cx + 35, cy + 130, 32, 14, Math.PI / 6, 0, Math.PI * 2);
  ctx.ellipse(cx - 35, cy + 155, 32, 14, -Math.PI / 6, 0, Math.PI * 2);
  ctx.stroke();

  // Cross-hatching for antique woodcut effect
  ctx.beginPath();
  for (let i = 0; i < 40; i++) {
    const hx = cx - 50 + i * 2.5;
    ctx.moveTo(hx, cy + 115);
    ctx.lineTo(hx + 15, cy + 145);
  }
  ctx.stroke();

  // Caption
  ctx.font = 'italic 18px "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('Fig. 1 — Rosa centifolia et ramification botanique', cx, y + h - 14);

  ctx.restore();
}

/**
 * Helper to draw justified or line-wrapped simulated newspaper article
 */
function drawSimulatedArticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  headline: string,
  paragraphs: string[],
  inkColor: string
) {
  ctx.save();
  ctx.fillStyle = inkColor;
  ctx.textAlign = 'left';

  // Article Headline
  ctx.font = 'bold 24px "Times New Roman", Georgia, serif';
  ctx.fillText(headline, x, y);

  // Underline
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x + width, y + 8);
  ctx.stroke();

  let curY = y + 36;
  ctx.font = '17px "Times New Roman", Georgia, serif';
  const lineHeight = 23;

  paragraphs.forEach((p, pIdx) => {
    // Drop cap on first paragraph
    if (pIdx === 0) {
      const dropLetter = p.charAt(0);
      const rest = p.substring(1);

      ctx.font = 'bold 46px "Times New Roman", Georgia, serif';
      ctx.fillText(dropLetter, x, curY + 32);

      ctx.font = '17px "Times New Roman", Georgia, serif';
      const words = rest.split(' ');
      let line = '';
      let isFirstLine = true;
      let indent = 42;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const maxW = isFirstLine ? width - indent : width;

        if (metrics.width > maxW && n > 0) {
          ctx.fillText(line, isFirstLine ? x + indent : x, curY);
          line = words[n] + ' ';
          curY += lineHeight;
          isFirstLine = false;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, isFirstLine ? x + indent : x, curY);
      curY += lineHeight + 12;
    } else {
      // Normal paragraph
      const words = p.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width && n > 0) {
          ctx.fillText(line, x, curY);
          line = words[n] + ' ';
          curY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, curY);
      curY += lineHeight + 12;
    }
  });

  ctx.restore();
}

/**
 * Draws vintage advert frame
 */
function drawVintageAdBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  ink: string,
  accent: string
) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);

  ctx.textAlign = 'center';
  const cx = x + w / 2;

  ctx.font = 'bold 26px "Playfair Display", serif';
  ctx.fillStyle = ink;
  ctx.fillText('MAISON FLEURIE', cx, y + 45);

  ctx.font = 'italic 18px "Times New Roman", serif';
  ctx.fillStyle = accent;
  ctx.fillText('Fournisseur de la Cour Royale', cx, y + 75);

  ctx.beginPath();
  ctx.moveTo(x + 25, y + 90);
  ctx.lineTo(x + w - 25, y + 90);
  ctx.strokeStyle = accent;
  ctx.stroke();

  ctx.font = '16px "Times New Roman", serif';
  ctx.fillStyle = ink;
  ctx.fillText('Spécialiste des Bouquets d’Amour,', cx, y + 130);
  ctx.fillText('Fleurs Rares & Compositions Nuptiales.', cx, y + 160);
  ctx.fillText('Expédition Soignée par Porteurs.', cx, y + 190);

  ctx.font = 'bold 20px "Times New Roman", serif';
  ctx.fillText('PARIS — RUE SAINT-HONORÉ', cx, y + 250);

  ctx.restore();
}

/**
 * Vintage postal / wax stamp
 */
function drawVintagePostalStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.15); // Slight tilt

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  // Double circle stamp
  ctx.beginPath();
  ctx.arc(0, 0, w / 2 - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, w / 2 - 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = 'bold 16px "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ POSTE FLORALE ★', 0, -25);
  ctx.font = 'bold 22px "Times New Roman", serif';
  ctx.fillText('PARIS', 0, 8);
  ctx.font = '14px "Times New Roman", serif';
  ctx.fillText('1894 - EXPÉDIÉ', 0, 32);

  ctx.restore();
}

/**
 * Creates or gets cached Three.js CanvasTexture for newspaper wrapping
 */
export function getNewspaperTexture(style: NewspaperStyle = 'vintage_gazette'): THREE.CanvasTexture {
  const cacheKey = `newspaper_${style}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = createNewspaperCanvas(style);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.4, 1.0);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates textured Kraft paper canvas
 */
export function createKraftCanvas(tintHex: string = '#c8ad8d'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = tintHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add paper fibers & noise
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.7));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle stamped artisan seal
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-0.1);
  ctx.strokeStyle = 'rgba(70, 48, 30, 0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillStyle = 'rgba(70, 48, 30, 0.45)';
  ctx.textAlign = 'center';
  ctx.fillText('NATURAL KRAFT PAPER', 0, -30);
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('• 100% ARTISANAL •', 0, 15);
  ctx.fillText('PARIS BOTANICAL', 0, 55);
  ctx.restore();

  return canvas;
}

export function getKraftTexture(tintHex: string = '#c8ad8d'): THREE.CanvasTexture {
  const cacheKey = `kraft_${tintHex}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = createKraftCanvas(tintHex);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates Greeting Card texture with recipient, message and sender
 */
export function createCardCanvas(to: string, message: string, from: string, fontStyle: string, bg: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = bg || '#fcfbf7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle border
  ctx.strokeStyle = '#d6cbbe';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Gold foil corner flourishes
  ctx.fillStyle = '#bfa15f';
  ctx.fillRect(36, 36, 16, 16);
  ctx.fillRect(canvas.width - 52, 36, 16, 16);
  ctx.fillRect(36, canvas.height - 52, 16, 16);
  ctx.fillRect(canvas.width - 52, canvas.height - 52, 16, 16);

  // Text content
  ctx.fillStyle = '#2b2623';
  ctx.textAlign = 'center';

  let fontFam = '"Times New Roman", serif';
  if (fontStyle === 'handwriting') fontFam = '"Brush Script MT", "Caveat", cursive, sans-serif';
  else if (fontStyle === 'modern') fontFam = '"Inter", sans-serif';

  // "To" header
  ctx.font = `italic 36px ${fontFam}`;
  ctx.fillText(to ? `Sevgili ${to},` : 'Sevgilerimle,', canvas.width / 2, 130);

  // Main message
  ctx.font = `28px ${fontFam}`;
  const lines = wrapText(ctx, message || 'Her yeni gün seninle çiçekler gibi açsın...', 820);
  let msgY = 240;
  lines.forEach((line) => {
    ctx.fillText(line, canvas.width / 2, msgY);
    msgY += 46;
  });

  // "From" signature
  if (from) {
    ctx.font = `italic bold 32px ${fontFam}`;
    ctx.fillText(`— ${from}`, canvas.width / 2 + 180, canvas.height - 110);
  }

  // Small heart or flower icon
  ctx.font = '32px sans-serif';
  ctx.fillText('🌸', canvas.width / 2, canvas.height - 70);

  return canvas;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine.trim());
      currentLine = words[i] + ' ';
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine.trim());
  return lines;
}
