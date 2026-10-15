// src/lib/services/fastenerFamilyService.ts - Gerenciamento Dinâmico de Famílias de Fixadores
'use client';

export interface FastenerFamilyItem {
  id: string; // identificador único (slug ou chave)
  name: string; // nome legível exibido ao usuário
  description?: string;
  isDefault?: boolean;
}

export const STORAGE_KEY_FAMILIES = 'deltafix_fastener_families';

export const DEFAULT_FASTENER_FAMILIES: FastenerFamilyItem[] = [
  { id: 'parafuso', name: 'Parafuso Especial', isDefault: true },
  { id: 'porca', name: 'Porca Especial', isDefault: true },
  { id: 'arruela', name: 'Arruela Especial', isDefault: true },
  { id: 'prisioneiro', name: 'Prisioneiro / Eixo Roscado', isDefault: true },
  { id: 'barra_roscada', name: 'Barra Roscada', isDefault: true },
  { id: 'chumbador', name: 'Chumbador de Ancoragem', isDefault: true },
  { id: 'outros', name: 'Peça Usinada Sob Medida', isDefault: true }
];

/**
 * Retorna a lista de famílias de fixadores cadastradas
 */
export function getFastenerFamilies(): FastenerFamilyItem[] {
  if (typeof window === 'undefined') {
    return DEFAULT_FASTENER_FAMILIES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAMILIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(DEFAULT_FASTENER_FAMILIES));
      return DEFAULT_FASTENER_FAMILIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_FASTENER_FAMILIES;
  } catch (err) {
    console.error('Erro ao ler famílias de fixadores:', err);
    return DEFAULT_FASTENER_FAMILIES;
  }
}

/**
 * Salva ou atualiza uma família de fixador
 */
export function saveFastenerFamily(item: {
  id?: string;
  name: string;
  description?: string;
}): FastenerFamilyItem[] {
  if (typeof window === 'undefined') return DEFAULT_FASTENER_FAMILIES;

  const current = getFastenerFamilies();
  const trimmedName = item.name.trim();
  if (!trimmedName) return current;

  let updated: FastenerFamilyItem[];

  if (item.id) {
    // Editar existente
    updated = current.map((f) => {
      if (f.id === item.id) {
        return {
          ...f,
          name: trimmedName,
          description: item.description?.trim() || f.description
        };
      }
      return f;
    });
  } else {
    // Gerar slug seguro
    const baseSlug = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const slug = baseSlug || `fam_${Date.now()}`;
    const uniqueId = current.some((f) => f.id === slug) ? `${slug}_${Date.now().toString().slice(-4)}` : slug;

    const newItem: FastenerFamilyItem = {
      id: uniqueId,
      name: trimmedName,
      description: item.description?.trim() || undefined,
      isDefault: false
    };

    updated = [...current, newItem];
  }

  try {
    localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(updated));
  } catch (err) {
    console.error('Erro ao salvar família:', err);
  }

  return updated;
}

/**
 * Remove uma família de fixador
 */
export function deleteFastenerFamily(id: string): FastenerFamilyItem[] {
  if (typeof window === 'undefined') return DEFAULT_FASTENER_FAMILIES;

  const current = getFastenerFamilies();
  const updated = current.filter((f) => f.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(updated));
  } catch (err) {
    console.error('Erro ao excluir família:', err);
  }

  return updated;
}

/**
 * Restaura as famílias padrão originais
 */
export function resetFastenerFamilies(): FastenerFamilyItem[] {
  if (typeof window === 'undefined') return DEFAULT_FASTENER_FAMILIES;

  try {
    localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(DEFAULT_FASTENER_FAMILIES));
  } catch (err) {
    console.error('Erro ao resetar famílias:', err);
  }

  return DEFAULT_FASTENER_FAMILIES;
}
