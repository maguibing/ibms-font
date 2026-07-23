import qrcodegen from 'naive-ui/es/qr-code/src/qrcodegen.mjs';

export type LedgerQrCodeSource = {
  id?: CommonType.IdType | null;
  name?: string | null;
  sn?: string | null;
};

export const LEDGER_DETAIL_PATH = '/pages/ledger/details/index';

const QR_CODE_MARGIN = 4;
const QR_CODE_MAX_SIZE = 256;
const qrCodeDataUrlCache = new Map<string, string>();
const ZIP_FILE_NAME = '资产二维码.zip';
const UTF8_FLAG = 0x0800;
const textEncoder = new TextEncoder();
const crc32Table = createCrc32Table();

export function buildLedgerDetailUrl(id: unknown) {
  const assetId = normalizeLedgerId(id);

  return assetId ? `${LEDGER_DETAIL_PATH}?id=${encodeURIComponent(assetId)}` : '';
}

export function buildLedgerQrPayload(source: LedgerQrCodeSource) {
  const assetId = normalizeLedgerId(source.id);
  if (!assetId) return '';

  const params = new URLSearchParams({ id: assetId });
  const sn = normalizeLedgerSn(source.sn);
  if (sn) {
    params.set('sn', sn);
  }

  return `${LEDGER_DETAIL_PATH}?${params.toString()}`;
}

export function getLedgerQrCodeUrl(source: LedgerQrCodeSource) {
  const payload = buildLedgerQrPayload(source);

  if (!payload) return '';

  const cachedDataUrl = qrCodeDataUrlCache.get(payload);
  if (cachedDataUrl) return cachedDataUrl;

  const dataUrl = createQrCodeDataUrl(payload);
  qrCodeDataUrlCache.set(payload, dataUrl);

  return dataUrl;
}

export function createQrCodeDataUrl(value: string) {
  const qrCode = qrcodegen.QrCode.encodeText(value, qrcodegen.QrCode.Ecc.MEDIUM);
  const scale = Math.max(1, Math.floor(QR_CODE_MAX_SIZE / (qrCode.size + QR_CODE_MARGIN * 2)));
  const canvasSize = (qrCode.size + QR_CODE_MARGIN * 2) * scale;
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const context = canvas.getContext('2d');
  if (!context) return '';

  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvasSize, canvasSize);
  context.fillStyle = '#000';

  for (let y = 0; y < qrCode.size; y += 1) {
    for (let x = 0; x < qrCode.size; x += 1) {
      if (qrCode.getModule(x, y)) {
        context.fillRect((x + QR_CODE_MARGIN) * scale, (y + QR_CODE_MARGIN) * scale, scale, scale);
      }
    }
  }

  return canvas.toDataURL('image/png');
}

export function getLedgerQrFileName(source: LedgerQrCodeSource) {
  const fileName = [normalizeLedgerSn(source.sn), normalizeLedgerName(source.name)]
    .map(sanitizeFileNamePart)
    .filter(Boolean)
    .join('_');

  return `${fileName || '资产二维码'}.png`;
}

export function downloadLedgerQrCode(source: LedgerQrCodeSource) {
  const qrCodeUrl = getLedgerQrCodeUrl(source);

  if (!qrCodeUrl) return false;

  downloadBlob(dataUrlToBlob(qrCodeUrl), getLedgerQrFileName(source));

  return true;
}

export function downloadLedgerQrCodes(sources: LedgerQrCodeSource[]) {
  const files: Array<{ fileName: string; data: Uint8Array }> = [];

  sources.forEach(source => {
    const qrCodeUrl = getLedgerQrCodeUrl(source);
    if (!qrCodeUrl) return;

    files.push({
      fileName: getLedgerQrFileName(source),
      data: dataUrlToUint8Array(qrCodeUrl)
    });
  });

  if (!files.length) return 0;

  downloadBlob(createZipBlob(files), ZIP_FILE_NAME);

  return files.length;
}

export function normalizeLedgerId(value: unknown) {
  const text = String(value ?? '').trim();

  if (!/^\d+$/.test(text) || Number(text) <= 0) {
    return '';
  }

  return text;
}

function normalizeLedgerSn(value: unknown) {
  return String(value ?? '').trim();
}

function normalizeLedgerName(value: unknown) {
  return String(value ?? '').trim();
}

function sanitizeFileNamePart(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '_').trim();
}

function dataUrlToBlob(dataUrl: string) {
  const [header, encoded] = dataUrl.split(',');

  if (!header || !encoded) {
    return new Blob();
  }

  const mimeType = header.match(/^data:([^;]+)(;base64)?$/i)?.[1] || 'application/octet-stream';

  return new Blob([dataUrlToUint8Array(dataUrl)], { type: mimeType });
}

function dataUrlToUint8Array(dataUrl: string) {
  const encoded = dataUrl.split(',')[1];

  if (!encoded) return new Uint8Array();

  const binary = window.atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function createZipBlob(files: Array<{ fileName: string; data: Uint8Array }>) {
  const localFileParts: Uint8Array[] = [];
  const centralDirectoryParts: Uint8Array[] = [];
  let localFileOffset = 0;

  files.forEach(file => {
    const fileNameBytes = textEncoder.encode(file.fileName);
    const crc32 = getCrc32(file.data);
    const localHeader = createZipLocalHeader(fileNameBytes, file.data.byteLength, crc32);
    const centralHeader = createZipCentralHeader(fileNameBytes, file.data.byteLength, crc32, localFileOffset);

    localFileParts.push(localHeader, file.data);
    centralDirectoryParts.push(centralHeader);
    localFileOffset += localHeader.byteLength + file.data.byteLength;
  });

  const centralDirectoryOffset = localFileOffset;
  const centralDirectorySize = centralDirectoryParts.reduce((total, part) => total + part.byteLength, 0);
  const endOfCentralDirectory = createZipEndRecord(files.length, centralDirectorySize, centralDirectoryOffset);
  const zipParts = [...localFileParts, ...centralDirectoryParts, endOfCentralDirectory] as unknown as BlobPart[];

  return new Blob(zipParts, { type: 'application/zip' });
}

function createZipLocalHeader(fileNameBytes: Uint8Array, dataLength: number, crc32: number) {
  const header = new Uint8Array(30 + fileNameBytes.length);
  const view = new DataView(header.buffer);
  let offset = 0;

  view.setUint32(offset, 0x04034b50, true);
  offset += 4;
  view.setUint16(offset, 20, true);
  offset += 2;
  view.setUint16(offset, UTF8_FLAG, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint32(offset, crc32, true);
  offset += 4;
  view.setUint32(offset, dataLength, true);
  offset += 4;
  view.setUint32(offset, dataLength, true);
  offset += 4;
  view.setUint16(offset, fileNameBytes.length, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  header.set(fileNameBytes, offset);

  return header;
}

function createZipCentralHeader(
  fileNameBytes: Uint8Array,
  dataLength: number,
  crc32: number,
  localHeaderOffset: number
) {
  const header = new Uint8Array(46 + fileNameBytes.length);
  const view = new DataView(header.buffer);
  let offset = 0;

  view.setUint32(offset, 0x02014b50, true);
  offset += 4;
  view.setUint16(offset, 20, true);
  offset += 2;
  view.setUint16(offset, 20, true);
  offset += 2;
  view.setUint16(offset, UTF8_FLAG, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint32(offset, crc32, true);
  offset += 4;
  view.setUint32(offset, dataLength, true);
  offset += 4;
  view.setUint32(offset, dataLength, true);
  offset += 4;
  view.setUint16(offset, fileNameBytes.length, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint32(offset, 0, true);
  offset += 4;
  view.setUint32(offset, localHeaderOffset, true);
  offset += 4;
  header.set(fileNameBytes, offset);

  return header;
}

function createZipEndRecord(entryCount: number, centralDirectorySize: number, centralDirectoryOffset: number) {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);

  return header;
}

function createCrc32Table() {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let crc = index;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }

    table[index] = crc >>> 0;
  }

  return table;
}

function getCrc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  for (let index = 0; index < bytes.length; index += 1) {
    crc = crc32Table[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }

  return ~crc >>> 0;
}

function downloadBlob(blob: Blob, fileName: string) {
  if (!blob.size) return;

  const blobURL = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = blobURL;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => window.URL.revokeObjectURL(blobURL), 0);
}
