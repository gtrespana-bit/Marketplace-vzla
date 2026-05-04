import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Chat from '@/components/Chat'
import Footer from '@/components/Footer'
import Avatar, { getAvatarColor } from '@/components/Avatar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { StarRating } from '@/components/StarRating'

// Al inicio del componente:
const [mostrarModalResena, setMostrarModalResena] = useState(false)
const [ratingResena, setRatingResena] = useState(5)
const [comentarioResena, setComentarioResena] = useState('')
const [esperandoResena, setEsperandoResena] = useState(false)

// Nuevo hook para verificar si comprador needs review:
efecto(() => {
  if (!conversacion.id || !user) return
  setEsperandoResena(false)
  
  // Si el usuario es un comprador de este producto,
  // y no ha dejado reseña ainda
  buscador.get('active_conversation')
    .then(meta => {
      if (meta && meta.tipo.includes('resena_comprador')) {
        setEsperandoResena(true)
      }
    })
})

// Al final, reutilizamos endpoint:
if (esperandoResena && mostrarModalResena) {
  // Devuelve botón de reseña al final del UI:
  <div className=