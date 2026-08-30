'use client'

import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, CheckCircle2, XCircle, Database, Zap, Mail, Send, Megaphone, Shield, RefreshCw } from 'lucide-react'
import { Badge, Button, Card, Empty, Loading, RefreshButton } from './AdminUi'
import { apiJson } from './admin-utils'

export default function AdminAjustes({ notify }: { notify: (msg: string) => void }) {
  const [status, setStatus] = useState<Record<string, boolean> | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await apiJson<{ config: Record<string, boolean>; count?: number }>('/api/admin/status')
      setStatus(res.config)
    } catch (e: any) {
      notify('❌ ' + e.message)
    }
    setLoading(false)
    setRefreshing(false)
  }, [notify])

  useEffect(() => { load() }, [load])

  async function testTelegram() {
    setTestResult('enviando')
    try {
      await apiJson('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensaje: '✅ Prueba desde el panel admin de VendeT' }) })
      setTestResult('ok')
    } catch (e: any) {
      setTestResult('error')
      notify('❌ ' + e.message)
    }
    setTimeout(() => setTestResult(null), 4000)
  }

  if (loading) return <Loading label="Comprobando configuración…" />

  const configs = [
    { key: 'supabase', label: 'Base de datos', desc: 'Conexión y credenciales de Supabase', icon: Database, color: 'text-emerald-600 bg-emerald-50' },
    { key: 'telegram', label: 'Telegram', desc: 'Alertas operativas en tiempo real', icon: Send, color: 'text-blue-600 bg-blue-50' },
    { key: 'push', label: 'Push Web', desc: 'Notificaciones a los usuarios', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
    { key: 'email', label: 'Email', desc: 'Correos transaccionales (Resend)', icon: Mail, color: 'text-purple-600 bg-purple-50' },
    { key: 'anuncios', label: 'Anuncios globales', desc: 'Banner público en todo el sitio', icon: Megaphone, color: 'text-orange-600 bg-orange-50' },
    { key: 'rateLimit', label: 'Rate limiting', desc: 'Protección anti-abuso de la API', icon: Shield, color: 'text-gray-600 bg-gray-100' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Ajustes y salud</h2>
          <p className="text-sm text-gray-500">Estado de los canales de la plataforma</p>
        </div>
        <RefreshButton onClick={() => load(true)} loading={refreshing} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {configs.map((c) => {
          const ok = !!status?.[c.key]
          return (
            <Card key={c.key} bodyClassName="p-4">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}><c.icon size={18} /></div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-xs font-bold">{ok ? 'Operativo' : 'Pendiente'}</span>
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-gray-800">{c.label}</p>
              <p className="text-xs text-gray-500">{c.desc}</p>
            </Card>
          )
        })}
      </div>

      {status?.anuncios === false && (
        <Card title="Activar anuncios globales" subtitle="El banner público necesita una tabla pequeña en Supabase" bodyClassName="p-4">
          <p className="mb-3 flex items-start gap-2 text-sm text-gray-600">
            <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-brand-primary" />
            Ejecuta la migración incluida en <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">supabase/migrations/202608010007_anuncios_globales.sql</code> para crear la tabla <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">anuncios_globales</code> y que el banner aparezca en el sitio.
          </p>
          <Button onClick={() => load(true)} variant="outline" size="sm"><RefreshCw size={14} /> Comprobar de nuevo</Button>
        </Card>
      )}

      <Card title="Probar canales" subtitle="Envía alertas de prueba para confirmar que todo funciona" bodyClassName="p-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testTelegram} disabled={testResult === 'enviando'}>
            <Send size={14} /> {testResult === 'enviando' ? 'Enviando…' : 'Probar Telegram'}
          </Button>
          {testResult === 'ok' && <Badge tone="green"><CheckCircle2 size={12} /> Mensaje enviado</Badge>}
          {testResult === 'error' && <Badge tone="red"><XCircle size={12} /> Error en el envío</Badge>}
        </div>
      </Card>

      <Card title="Responsabilidades del panel" subtitle="Todo queda registrado en auditoría" bodyClassName="p-4">
        <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
          <p>- Aprobación manual de pagos con doble verificación.</p>
          <p>- Verificación de vendedores con cédula y datos de pago móvil.</p>
          <p>- Moderación de contenido prohibido o sospechoso.</p>
          <p>- Gestión centralizada de usuarios, productos y categorías.</p>
          <p>- Auditoría de todas las operaciones administrativas.</p>
          <p>- Comunicación global mediante banners y push.</p>
        </div>
      </Card>
    </div>
  )
}
