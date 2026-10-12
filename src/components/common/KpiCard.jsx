import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import Skeleton from './Skeleton';

export const KpiCard = ({
  label,
  value,
  trend,
  trendLabel = 'vs mois dernier',
  icon = null,
  subtext = null,
  isLoading = false,
  className = '',
  onClick,
}) => {
  if (isLoading) {
    return (
      <div className={`st-kpi ${className}`.trim()}>
        <div className="st-kpi-top">
          <Skeleton width="40%" height={14} />
          <Skeleton width={36} height={36} borderRadius={6} />
        </div>
        <Skeleton width="60%" height={28} />
        <Skeleton width="50%" height={14} />
      </div>
    );
  }

  const hasTrend = trend !== undefined && trend !== null;
  const isPositive = hasTrend && Number(trend) > 0;
  const isNegative = hasTrend && Number(trend) < 0;
  const isNeutral = hasTrend && Number(trend) === 0;

  return (
    <div
      className={`st-kpi ${onClick ? 'st-card-hover cursor-pointer' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      <div className="st-kpi-top">
        <span className="st-kpi-label">{label}</span>
        {icon && <div className="st-kpi-icon">{icon}</div>}
      </div>

      <div className="st-kpi-value">{value}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {hasTrend && (
          <span
            className={`st-kpi-trend ${
              isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'
            }`}
          >
            {isPositive ? (
              <FiTrendingUp size={12} />
            ) : isNegative ? (
              <FiTrendingDown size={12} />
            ) : (
              <FiMinus size={12} />
            )}
            <span>
              {isPositive ? `+${trend}%` : `${trend}%`}
            </span>
          </span>
        )}

        {(trendLabel || subtext) && (
          <span style={{ fontSize: 11, color: '#718096' }}>
            {subtext || trendLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
