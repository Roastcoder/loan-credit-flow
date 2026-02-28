import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }: StatCardProps) => {
  return (
    <div className="group bg-card rounded-xl p-4 md:p-5 shadow-card border border-border hover:shadow-elevated hover:border-accent/20 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-xl md:text-2xl font-display font-bold text-card-foreground mt-1.5">{value}</p>
          <div className="flex items-center gap-2 mt-1">
            {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
            {trend && trendValue && (
              <p className={`text-[10px] font-semibold ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </p>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 ml-3 group-hover:bg-accent/15 transition-colors">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
