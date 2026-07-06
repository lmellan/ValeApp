import { useCallback, useEffect, useMemo, useState } from 'react';
import { getServicios } from '../../servicios/services/serviciosService';
import { getUsers } from '../../users/services/usersService';
import { getTiposComensal } from '../../tiposComensal/services/tiposComensalService';
import { ReporteFilters, ReporteKpis, ReporteVale, createEmptyReporteFilters } from '../types';
import { getTodosLosVales } from '../services/reportesService';

export type ReporteValeRow = ReporteVale & {
  funcionarioNombre: string;
  funcionarioCodigo: string;
  tipoComensal: string;
  tipoComensalColor: string;
  servicioNombre: string;
  servicioCategoria: string;
  sucursalNombre: string;
  estadoLabel: string;
  tipoLabel: string;
};

const normalize = (value?: string | number | null) => String(value ?? '').toLowerCase().trim();

export const getEstadoVale = (vale: ReporteVale): string => {
  if (vale.expirado) return 'Expirado';
  if (vale.estadoUso === 'UTILIZADO') return 'Utilizado';
  return 'Disponible';
};

export const getTipoAsignacionVale = (vale: ReporteVale): string => {
  if (vale.tipoAsignacion === 'POR_TURNO') return 'Base';
  if (vale.tipoAsignacion === 'ADMINISTRATIVA') return 'Adicional';
  return vale.tipoAsignacion || 'Sin tipo';
};

const isDateInsideRange = (dateValue: string | null | undefined, from: string, to: string) => {
  if (!dateValue) return !from && !to;
  const date = dateValue.slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
};

const getKpis = (rows: ReporteValeRow[]): ReporteKpis => ({
  emitidos: rows.length,
  utilizados: rows.filter((vale) => vale.estadoLabel === 'Utilizado').length,
  disponibles: rows.filter((vale) => vale.estadoLabel === 'Disponible').length,
  expirados: rows.filter((vale) => vale.estadoLabel === 'Expirado').length,
  valorTotal: rows.reduce((total, vale) => total + Number(vale.valor || 0), 0),
  adicionales: rows.filter((vale) => vale.tipoLabel === 'Adicional').length
});

export const useReportes = () => {
  const [vales, setVales] = useState<ReporteVale[]>([]);
  const [usuarios, setUsuarios] = useState<Record<number, { nombre: string; codigo: string; tipoComensal: string; tipoComensalColor: string }>>({});
  const [servicios, setServicios] = useState<Record<number, { nombre: string; categoria: string; sucursal: string }>>({});
  const [filters, setFilters] = useState<ReporteFilters>(() => createEmptyReporteFilters());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [valesData, usuariosData, serviciosData, tiposComensalData] = await Promise.all([getTodosLosVales(), getUsers(), getServicios(), getTiposComensal()]);
      const tiposById = tiposComensalData.reduce<Record<number, { color: string }>>((acc, tipo) => {
        acc[tipo.idTipoComensal] = { color: tipo.color };
        return acc;
      }, {});
      const tiposByName = tiposComensalData.reduce<Record<string, { color: string }>>((acc, tipo) => {
        acc[tipo.nombre] = { color: tipo.color };
        return acc;
      }, {});

      setVales(valesData);
      setUsuarios(
        usuariosData.reduce<Record<number, { nombre: string; codigo: string; tipoComensal: string; tipoComensalColor: string }>>((acc, user) => {
          const tipoColor = (user.id_tipo_comensal ? tiposById[user.id_tipo_comensal]?.color : null) || (user.tipo_comensal ? tiposByName[user.tipo_comensal]?.color : null) || '#64748b';
          acc[user.id] = {
            nombre: user.nombre,
            codigo: user.codigo || String(user.id),
            tipoComensal: user.tipo_comensal || 'No aplica',
            tipoComensalColor: tipoColor
          };
          return acc;
        }, {})
      );
      setServicios(
        serviciosData.reduce<Record<number, { nombre: string; categoria: string; sucursal: string }>>((acc, servicio) => {
          acc[servicio.idServicio] = {
            nombre: servicio.nombre,
            categoria: servicio.categoria || 'Sin categoria',
            sucursal: servicio.idCasino ? `Casino ${servicio.idCasino}` : 'Sin sucursal'
          };
          return acc;
        }, {})
      );
    } catch {
      setError('No se pudieron cargar los reportes. Revisa que los servicios esten activos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rows = useMemo<ReporteValeRow[]>(() => {
    return vales.map((vale) => {
      const usuario = vale.idFuncionario ? usuarios[vale.idFuncionario] : undefined;
      const servicio = vale.idServicio ? servicios[vale.idServicio] : undefined;

      return {
        ...vale,
        funcionarioNombre: usuario?.nombre || 'No personalizado',
        funcionarioCodigo: usuario?.codigo || 'Sin codigo',
        tipoComensal: usuario?.tipoComensal || 'No aplica',
        tipoComensalColor: usuario?.tipoComensalColor || '#64748b',
        servicioNombre: servicio?.nombre || `Servicio ${vale.idServicio ?? 'N/A'}`,
        servicioCategoria: servicio?.categoria || 'Sin categoria',
        sucursalNombre: servicio?.sucursal || 'Sin sucursal',
        estadoLabel: getEstadoVale(vale),
        tipoLabel: getTipoAsignacionVale(vale)
      };
    });
  }, [servicios, usuarios, vales]);

  const filteredRows = useMemo(() => {
    const query = normalize(filters.query);

    return rows.filter((vale) => {
      const matchesQuery = !query || [vale.idVale, vale.funcionarioNombre, vale.funcionarioCodigo, vale.servicioNombre, vale.valor]
        .some((field) => normalize(field).includes(query));
      const matchesEstado = filters.estado === 'Todos' || vale.estadoLabel === filters.estado;
      const matchesTipo = filters.tipoAsignacion === 'Todos' || vale.tipoLabel === filters.tipoAsignacion;
      const matchesDate = isDateInsideRange(vale.fechaUso, filters.fechaDesde, filters.fechaHasta);

      return matchesQuery && matchesEstado && matchesTipo && matchesDate;
    });
  }, [filters, rows]);

  const kpis = useMemo(() => getKpis(filteredRows), [filteredRows]);

  const updateFilters = (changes: Partial<ReporteFilters>) => {
    setFilters((current) => ({ ...current, ...changes }));
  };

  const clearFilters = () => setFilters(createEmptyReporteFilters());

  return {
    rows: filteredRows,
    allRows: rows,
    kpis,
    filters,
    loading,
    error,
    updateFilters,
    clearFilters,
    refresh: loadData
  };
};
