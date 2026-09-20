import type { Product } from '@shared/models';
import { cn } from '@/lib/utils';
export function ProductArt({ product: p, className }: { product: Product; className?: string }) {
  return <div className={cn('flex items-center justify-center overflow-hidden rounded-xl', className)} style={{ background: p.scene }}>
    <svg viewBox="0 0 180 235" className="h-full max-h-60 w-auto drop-shadow-lg" role="img" aria-label={`${p.brand} ${p.name} illustrated package`}>
      <ellipse cx="89" cy="220" rx="52" ry="5" fill={p.dark} opacity=".12" />
      <path d="m37 21 95-6 14 13-95 7Z" fill={p.color} /><path d="m132 15 14 13v182l-14 8Z" fill={p.dark} />
      <path d="m37 21 95-6v203l-95-5Z" fill={p.color} /><path d="M43 28v178" stroke="white" opacity=".25" />
      <text x="84" y="49" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="bold" letterSpacing="1" fill={p.dark}>{p.brand.toUpperCase().slice(0,22)}</text>
      <path d="m77 60 7-4 7 4" stroke={p.dark} fill="none" />
      <text x="84" y="95" textAnchor="middle" fontFamily="Georgia,serif" fontSize={p.line1.length > 8 ? 18 : 27} fill={p.dark}>{p.line1}</text>
      <text x="84" y="122" textAnchor="middle" fontFamily="Georgia,serif" fontSize={p.line2.length > 8 ? 18 : 26} fill={p.dark}>{p.line2}</text>
      <text x="84" y="140" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="5.5" fill={p.dark}>{p.sub.slice(0,35)}</text>
      <path d="M49 166h72c-2 26-15 34-36 34s-34-11-36-34" fill="#f5e5c7" /><ellipse cx="85" cy="166" rx="36" ry="14" fill="#fff9e9" />
      {Array.from({ length: 15 }, (_, index) => { const x = 59 + (index % 5) * 13, y = 161 + Math.floor(index / 5) * 8; return <g key={index}><ellipse cx={x} cy={y} rx={p.type === 'rings' ? 5 : 6} ry="3.5" fill={index % 3 === 0 ? '#b7924f' : '#d8b568'} />{p.type === 'rings' && <ellipse cx={x} cy={y} rx="2" ry="1.4" fill="#fff9e9" />}</g>; })}
      <text x="84" y="211" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="5.5" letterSpacing="1" fill={p.dark}>{p.weight ?? '?'} g · {p.isDemo ? 'FICTIONAL' : 'LOCAL LABEL'}</text>
    </svg>
  </div>;
}
