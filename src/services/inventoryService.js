import supabase from '../config/supabaseClient';
import { DB, COLS, PAGE_SIZE } from '../utils/constants';

/**
 * Obtiene productos con paginación, búsqueda y filtro por línea de negocio.
 * Devuelve los productos junto con su información de inventario.
 */
export const fetchProducts = async ({ page = 1, search = '', businessLine = '' } = {}) => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from(DB.PRODUCTS)
    .select('*', { count: 'exact' });

  if (businessLine && businessLine !== 'All') {
    query = query.eq(COLS.products.businessLine, businessLine);
  }

  if (search) {
    query = query.or(
      `${COLS.products.description}.ilike.%${search}%,${COLS.products.sku}.ilike.%${search}%`
    );
  }

  query = query.range(from, to).order(COLS.products.sku, { ascending: true });

  const { data: products, error, count } = await query;
  if (error) throw error;

  // Obtener stock para los SKUs de esta página
  if (products && products.length > 0) {
    const skus = products.map(p => p.sku);
    const { data: stockData } = await supabase
      .from(DB.INVENTORY)
      .select('sku, current_stock, free_stock_value, blocked_stock, blocked_stock_value')
      .in('sku', skus);

    const stockMap = new Map((stockData || []).map(s => [s.sku, s]));

    const merged = products.map(p => ({
      ...p,
      current_stock: stockMap.get(p.sku)?.current_stock ?? 0,
      free_stock_value: stockMap.get(p.sku)?.free_stock_value ?? 0,
      blocked_stock: stockMap.get(p.sku)?.blocked_stock ?? 0,
      blocked_stock_value: stockMap.get(p.sku)?.blocked_stock_value ?? 0,
    }));

    return { data: merged, count, totalPages: Math.ceil((count || 0) / PAGE_SIZE) };
  }

  return { data: [], count: 0, totalPages: 0 };
};

/**
 * Obtiene un producto por SKU con su información de inventario y códigos de barras.
 */
export const fetchProductBySku = async (sku) => {
  const [prodResult, invResult, barcodeResult] = await Promise.all([
    supabase.from(DB.PRODUCTS).select('*').eq('sku', sku).maybeSingle(),
    supabase.from(DB.INVENTORY).select('*').eq('sku', sku).maybeSingle(),
    supabase.from(DB.BARCODES).select('barcode').eq('sku', sku),
  ]);

  if (prodResult.error) throw prodResult.error;
  if (!prodResult.data) return null;

  return {
    ...prodResult.data,
    current_stock: invResult.data?.current_stock ?? 0,
    free_stock_value: invResult.data?.free_stock_value ?? 0,
    blocked_stock: invResult.data?.blocked_stock ?? 0,
    blocked_stock_value: invResult.data?.blocked_stock_value ?? 0,
    barcodes: (barcodeResult.data || []).map(b => b.barcode),
  };
};

/**
 * Actualiza un producto existente en la tabla products.
 */
export const updateProduct = async (sku, updates) => {
  const { error } = await supabase
    .from(DB.PRODUCTS)
    .update(updates)
    .eq('sku', sku);
  if (error) throw error;
};

/**
 * Actualiza el stock de un producto en la tabla inventory.
 */
export const updateInventory = async (sku, stockUpdates) => {
  const { error } = await supabase
    .from(DB.INVENTORY)
    .upsert({ sku, ...stockUpdates }, { onConflict: 'sku' });
  if (error) throw error;
};

/**
 * Obtiene KPIs del dashboard llamando al RPC de Supabase.
 */
export const fetchKPIs = async () => {
  const { data, error } = await supabase.rpc('get_dashboard_kpis');
  if (error) throw error;
  return {
    totalProducts: data?.total_products ?? 0,
    totalStock: data?.total_stock ?? 0,
    criticalStock: data?.critical_stock ?? 0,
    inventoryValue: data?.inventory_value ?? 0,
    outOfStock: data?.out_of_stock ?? 0,
  };
};

/**
 * Obtiene las líneas de negocio únicas (categorías) directamente de la BD.
 */
export const fetchBusinessLines = async () => {
  const { data, error } = await supabase
    .from(DB.PRODUCTS)
    .select(COLS.products.businessLine)
    .limit(1000);

  if (error) throw error;

  const unique = [...new Set((data || []).map(d => d.business_line).filter(Boolean))];
  return unique.sort();
};

/**
 * Busca un código de barras y devuelve el producto completo.
 */
export const lookupBarcode = async (barcode) => {
  const { data, error } = await supabase
    .from(DB.BARCODES)
    .select('sku')
    .eq('barcode', barcode)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return fetchProductBySku(data.sku);
};

/**
 * Obtiene todas las analíticas del dashboard en una sola llamada RPC.
 */
export const fetchDashboardAnalytics = async () => {
  const { data, error } = await supabase.rpc('get_dashboard_analytics');
  if (error) throw error;
  return data;
};

/**
 * Obtiene productos solo como catálogo (sin stock). Para la página Productos.
 */
export const fetchProductsCatalog = async ({ page = 1, search = '', businessLine = '' } = {}) => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from(DB.PRODUCTS).select('*', { count: 'exact' });

  if (businessLine && businessLine !== 'All') {
    query = query.eq(COLS.products.businessLine, businessLine);
  }
  if (search) {
    query = query.or(`${COLS.products.description}.ilike.%${search}%,${COLS.products.sku}.ilike.%${search}%`);
  }

  query = query.range(from, to).order(COLS.products.sku, { ascending: true });
  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data || [], count: count || 0, totalPages: Math.ceil((count || 0) / PAGE_SIZE) };
};
