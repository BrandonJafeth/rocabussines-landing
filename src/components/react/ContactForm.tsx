import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
}

type ConsultType = 'propiedad' | 'servicio' | 'informacion' | 'otro';

export default function ContactForm({ propertyId, propertyTitle }: ContactFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    consultType: '' as ConsultType | '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Validación básica
      if (!formData.fullName || !formData.email || !formData.phone || !formData.consultType) {
        setErrorMessage('Por favor completa todos los campos requeridos');
        setSubmitStatus('error');
        return;
      }

      // 1. Crear lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message || null,
          source: 'web',
          status: 'nuevo',
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // 2. Crear cliente basado en el lead
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          notes: `Lead desde formulario web. Tipo de consulta: ${formData.consultType}`,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // 3. Crear request si hay propiedad asociada
      if (propertyId && clientData) {
        const { error: requestError } = await supabase
          .from('requests')
          .insert({
            client_id: clientData.id,
            property_id: propertyId,
            service_id: null,
            status: 'pendiente',
            notes: formData.message || `Consulta sobre: ${propertyTitle}`,
          });

        if (requestError) throw requestError;
      }

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        consultType: '',
        message: '',
      });
    } catch (error: any) {
      console.error('Error al enviar formulario:', error);
      setErrorMessage(error.message || 'Ocurrió un error al enviar el formulario');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar y título */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-deepest text-white">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-deepest">María González</h3>
          <p className="font-heading text-sm text-deepest/60">Agente Inmobiliario</p>
        </div>
      </div>

      {/* Nombre completo */}
      <div>
        <label htmlFor="fullName" className="mb-1 block font-heading text-sm text-deepest">
          Nombre completo <span className="text-[#D64045]">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Ej: Juan Pérez Rodríguez"
          required
          className="w-full rounded-lg border border-mid/30 bg-white px-4 py-2.5 font-heading text-sm text-deepest placeholder:text-deepest/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Correo electrónico */}
      <div>
        <label htmlFor="email" className="mb-1 block font-heading text-sm text-deepest">
          Correo electrónico <span className="text-[#D64045]">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-deepest/40">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </span>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
            className="w-full rounded-lg border border-mid/30 bg-white py-2.5 pl-11 pr-4 font-heading text-sm text-deepest placeholder:text-deepest/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="phone" className="mb-1 block font-heading text-sm text-deepest">
          Teléfono <span className="text-[#D64045]">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-deepest/40">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </span>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+506 0000-0000"
            required
            className="w-full rounded-lg border border-mid/30 bg-white py-2.5 pl-11 pr-4 font-heading text-sm text-deepest placeholder:text-deepest/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Tipo de consulta */}
      <div>
        <label htmlFor="consultType" className="mb-1 block font-heading text-sm text-deepest">
          Tipo de consulta <span className="text-[#D64045]">*</span>
        </label>
        <select
          id="consultType"
          name="consultType"
          value={formData.consultType}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-mid/30 bg-white px-4 py-2.5 font-heading text-sm text-deepest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Selecciona una opción</option>
          {propertyId && <option value="propiedad">Consulta sobre propiedad</option>}
          <option value="servicio">Consulta sobre servicio</option>
          <option value="informacion">Solicitud de información</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="message" className="mb-1 block font-heading text-sm text-deepest">
          Mensaje (opcional)
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Escribe tu consulta aquí..."
          rows={4}
          maxLength={300}
          className="w-full resize-none rounded-lg border border-mid/30 bg-white px-4 py-2.5 font-heading text-sm text-deepest placeholder:text-deepest/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-right font-heading text-xs text-deepest/50">
          {formData.message.length} / 300
        </p>
      </div>

      {/* Botón submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-3 font-heading font-bold text-white transition-all duration-300 hover:bg-deepest hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando...' : 'Contactar'}
      </button>

      {/* Mensajes de estado */}
      {submitStatus === 'success' && (
        <div className="rounded-lg bg-[#2D9E6B]/10 p-3 text-center">
          <p className="font-heading text-sm font-bold text-[#2D9E6B]">
            ¡Mensaje enviado exitosamente!
          </p>
          <p className="mt-1 font-heading text-xs text-[#2D9E6B]/80">
            Te contactaremos pronto.
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="rounded-lg bg-[#D64045]/10 p-3 text-center">
          <p className="font-heading text-sm font-bold text-[#D64045]">
            Error al enviar el mensaje
          </p>
          <p className="mt-1 font-heading text-xs text-[#D64045]/80">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Divisor */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-mid/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 font-heading text-deepest/60">O contáctanos directamente:</span>
        </div>
      </div>

      {/* Contacto directo */}
      <div className="space-y-2 text-center">
        <a
          href="tel:+50612345678"
          className="flex items-center justify-center gap-2 font-heading text-sm text-deepest/70 transition-colors hover:text-primary"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          +506 1234-5678
        </a>
        <a
          href="https://wa.me/50612345678"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 font-heading text-sm text-deepest/70 transition-colors hover:text-[#25D366]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <a
          href="mailto:maria@rocabusiness.com"
          className="flex items-center justify-center gap-2 font-heading text-sm text-deepest/70 transition-colors hover:text-primary"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          maria@rocabusiness.com
        </a>
      </div>
    </form>
  );
}
