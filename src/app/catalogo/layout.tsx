export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 
        CSS CRÍTICO AISLADO: 
        Solo se aplica en /catalogo. Permite al navegador pintar la estructura 
        inmediatamente sin esperar el parseo del CSS global de 11KB.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        .catalog-critical-container { max-width: 80rem; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; padding-top: 2rem; padding-bottom: 2rem; }
        .catalog-critical-flex { display: flex; flex-direction: column; gap: 1.5rem; }
        @media (min-width: 1024px) { .catalog-critical-flex { flex-direction: row; } }
        .catalog-critical-sidebar { width: 100%; flex-shrink: 0; }
        @media (min-width: 1024px) { .catalog-critical-sidebar { width: 18rem; } }
        .catalog-critical-main { flex: 1; min-width: 0; }
        .catalog-critical-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 640px) { .catalog-critical-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1280px) { .catalog-critical-grid { grid-template-columns: repeat(3, 1fr); } }
        .catalog-critical-card { background-color: white; border-radius: 0.75rem; overflow: hidden; border: 1px solid #f3f4f6; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .catalog-critical-aspect { aspect-ratio: 1 / 1; background-color: #f3f4f6; position: relative; overflow: hidden; }
      `}} />
      {children}
    </>
  )
}