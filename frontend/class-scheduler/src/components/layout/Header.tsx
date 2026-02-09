import type { ReactNode } from 'react';

type HeaderProps = {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
};

export default function Header({ title, subtitle, actions }: HeaderProps) {
    return (
        <header className="mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-slate-500">{subtitle}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
        </header>
    );
}
