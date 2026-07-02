// Tamaños de paginación
export const PAGE_SIZE = 50;
export const CHUNK_SIZE = 1500;
export const CRITICAL_STOCK_THRESHOLD = 10;
export const SEARCH_DEBOUNCE_MS = 300;

// Columnas reales de Supabase (mapeo de la BD real)
export const DB = {
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  BARCODES: 'product_barcodes',
};

export const COLS = {
  products: {
    sku: 'sku',
    description: 'description',
    unitOfMeasure: 'unit_of_measure',
    articleGroup: 'article_group',
    businessLine: 'business_line',
  },
  inventory: {
    sku: 'sku',
    currentStock: 'current_stock',
    freeStockValue: 'free_stock_value',
    blockedStock: 'blocked_stock',
    blockedStockValue: 'blocked_stock_value',
  },
  barcodes: {
    sku: 'sku',
    barcode: 'barcode',
  },
};

// Líneas de negocio (16 categorías principales de la BD)
export const BUSINESS_LINES = [
  'MATERIALES DE CONSTRUCCION',
  'GASFITERIA',
  'FERRETERIA',
  'HERRAMIENTAS',
  'PINTURAS',
  'REVESTIMIENTOS',
  'MADERAS Y TABLEROS',
  'BANO y COCINA',
  'ELECTRICIDAD',
  'SERVICIOS CORPORATIVOS',
  'JARDIN',
  'ILUMINACION',
  'ASEO',
  'FIERRO',
  'TEMPORADA',
  'ORGANIZACION',
];

// Rutas de la aplicación
export const ROUTES = {
  DASHBOARD: '/',
  INVENTORY: '/inventory',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  BULK_UPLOAD: '/bulk-upload',
  SCANNER: '/scanner',
  REPORTS: '/reports',
  SETTINGS: '/settings',
};
