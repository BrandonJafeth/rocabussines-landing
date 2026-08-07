import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { HomeService } from '../../types/service';
import { es } from '../../i18n/dictionaries/es';
import { en } from '../../i18n/dictionaries/en';
import type { Lang } from '../../i18n/config';

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice?: string;
  propertyLocation?: string;
  propertyType?: string;
  propertyImage?: string;
  services?: HomeService[];
  lang?: Lang;
}

type ConsultType = 'propiedad' | 'servicio' | 'informacion' | 'otro';

export default function ContactForm({ propertyId, propertyTitle, propertyPrice, propertyLocation, propertyType, propertyImage, services = [], lang = 'es' }: ContactFormProps) {
  const dict = lang === 'en' ? en : es;
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

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Validación básica
      if (!formData.fullName || !formData.email || !formData.phone) {
        setErrorMessage(dict.contactForm.errorRequiredFields);
        setSubmitStatus('error');
        return;
      }

      // Si hay propertyId, usar ese; si no, validar consultType
      if (!propertyId && !formData.consultType) {
        setErrorMessage(dict.contactForm.errorSelectService);
        setSubmitStatus('error');
        return;
      }

      // Determinar si consultType es un UUID de servicio
      const isServiceId = formData.consultType ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.consultType) : false;
      
      // Obtener el nombre del servicio seleccionado para el mensaje
      let consultTypeLabel: string = formData.consultType || 'propiedad';
      if (isServiceId && services.length > 0) {
        const selectedService = services.find(s => s.id === formData.consultType);
        consultTypeLabel = selectedService ? selectedService.title : formData.consultType;
      }

      // IDs generados en el propio formulario, para no tener que leer de vuelta
      // lo que se acaba de insertar (así no hace falta permiso de lectura pública)
      const leadId = crypto.randomUUID();
      const clientId = crypto.randomUUID();

      // 1. Crear lead
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          id: leadId,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message || null,
          source: 'web',
          status: 'nuevo',
        });

      if (leadError) throw leadError;

      // 2. Crear cliente basado en el lead
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          id: clientId,
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          notes: `Lead desde formulario web. Tipo de consulta: ${consultTypeLabel}${formData.message ? ` - ${formData.message}` : ''}`,
        });

      if (clientError) throw clientError;

      // 3. Crear request vinculando con propiedad y/o servicio
      if (propertyId || isServiceId) {
        const requestData: any = {
          client_id: clientId,
          property_id: propertyId ? propertyId : null,
          service_id: isServiceId ? formData.consultType : null,
          status: 'pendiente',
          notes: formData.message || `Consulta sobre: ${propertyTitle || consultTypeLabel}`,
        };

        const { error: requestError } = await supabase
          .from('requests')
          .insert(requestData);

        if (requestError) throw requestError;
      }

      // 4. Enviar correos electrónicos
      try {
        await fetch('/api/send-request-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: formData.fullName,
            clientEmail: formData.email,
            consultType: consultTypeLabel,
            propertyTitle: propertyId ? propertyTitle : undefined,
            propertyPrice: propertyId ? propertyPrice : undefined,
            propertyLocation: propertyId ? propertyLocation : undefined,
            propertyType: propertyId ? propertyType : undefined,
            propertyImage: propertyId ? propertyImage : undefined,
            propertyId: propertyId || undefined,
            serviceTitle: isServiceId ? consultTypeLabel : undefined,
            message: formData.message,
          }),
        });
      } catch (emailError) {
        console.error('Error al enviar correos, pero la solicitud fue registrada:', emailError);
        // No fallar la operación si el correo falla
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
      setErrorMessage(error.message || dict.contactForm.errorDefault);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección 1: Información Personal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-heading font-bold text-sm">
            1
          </div>
          <h3 className="font-heading text-lg font-bold text-deepest">{dict.contactForm.step1Title}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label htmlFor="fullName" className="mb-1.5 block font-heading text-sm text-deepest">
              {dict.contactForm.firstNameLabel}
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder={dict.contactForm.firstNamePlaceholder}
              required
              className="w-full rounded-lg border border-mid/30 bg-white px-4 py-2.5 font-heading text-sm text-deepest placeholder:text-deepest/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="lastName" className="mb-1.5 block font-heading text-sm text-deepest">
              {dict.contactForm.lastNameLabel}
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder={dict.contactForm.lastNamePlaceholder}
              className="w-full rounded-lg border border-mid/30 bg-white px-4 py-2.5 font-heading text-sm text-deepest placeholder:text-deepest/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block font-heading text-sm text-deepest">
              {dict.contactForm.emailLabel}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={dict.contactForm.emailPlaceholder}
              required
              className="w-full rounded-lg border border-mid/30 bg-white px-4 py-2.5 font-heading text-sm text-deepest placeholder:text-deepest/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="mb-1.5 block font-heading text-sm text-deepest">
              {dict.contactForm.phoneLabel}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={dict.contactForm.phonePlaceholder}
              required
              className="w-full rounded-lg border border-mid/30 bg-white px-4 py-2.5 font-heading text-sm text-deepest placeholder:text-deepest/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Servicio de Interés (solo si NO hay propertyId) */}
      {!propertyId && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-heading font-bold text-sm">
              2
            </div>
            <h3 className="font-heading text-lg font-bold text-deepest">{dict.contactForm.step2ServiceTitle}</h3>
          </div>

          <div>
            <label htmlFor="consultType" className="mb-1.5 block font-heading text-sm text-deepest">
              {dict.contactForm.serviceQuestion} <span className="text-[#D64045]">*</span>
            </label>
            <select
              id="consultType"
              name="consultType"
              value={formData.consultType}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-mid/30 bg-white px-4 py-2.5 font-heading text-sm text-deepest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{dict.contactForm.selectServicePlaceholder}</option>
              {services.length > 0 ? (
                services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))
              ) : (
                <>
                  <option value="servicio">{dict.contactForm.serviceAdvisory}</option>
                  <option value="informacion">{dict.contactForm.generalInfo}</option>
                </>
              )}
              <option value="otro">{dict.contactForm.other}</option>
            </select>
          </div>
        </div>
      )}

      {/* Mostrar info de la propiedad si hay propertyId */}
      {propertyId && propertyTitle && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-heading font-bold text-sm">
              2
            </div>
            <h3 className="font-heading text-lg font-bold text-deepest">{dict.contactForm.step2PropertyTitle}</h3>
          </div>
          <div className="rounded-lg border border-mid/30 bg-surface/50 p-4">
            <p className="font-heading text-sm text-mid mb-1">{dict.contactForm.requestingInfoAbout}</p>
            <p className="font-heading text-base font-bold text-deepest">{propertyTitle}</p>
          </div>
        </div>
      )}

      {/* Sección 3: Detalles de la Consulta */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-heading font-bold text-sm">
            {propertyId ? '3' : '3'}
          </div>
          <h3 className="font-heading text-lg font-bold text-deepest">{dict.contactForm.step3Title}</h3>
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block font-heading text-sm text-deepest">
            {dict.contactForm.messageLabel}
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={dict.contactForm.messagePlaceholder}
            rows={5}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-mid/30 bg-white px-4 py-2.5 font-heading text-sm text-deepest placeholder:text-deepest/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1.5 text-right font-heading text-xs text-deepest/50">
            {formData.message.length} / 500 {dict.contactForm.charCount}
          </p>
        </div>
      </div>

      {/* Botón submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-3.5 font-heading text-base font-bold text-white transition-all duration-300 hover:bg-deepest hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{dict.contactForm.sending}</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{dict.contactForm.submit}</span>
          </>
        )}
      </button>

      {/* Mensajes de estado */}
      {submitStatus === 'success' && (
        <div className="rounded-lg bg-[#2D9E6B]/10 border border-[#2D9E6B]/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-[#2D9E6B] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-heading text-sm font-bold text-[#2D9E6B]">
                {dict.contactForm.successTitle}
              </p>
              <p className="mt-1 font-heading text-xs text-[#2D9E6B]/80">
                {dict.contactForm.successText}
              </p>
            </div>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="rounded-lg bg-[#D64045]/10 border border-[#D64045]/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-[#D64045] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-heading text-sm font-bold text-[#D64045]">
                {dict.contactForm.errorTitle}
              </p>
              <p className="mt-1 font-heading text-xs text-[#D64045]/80">
                {errorMessage || dict.contactForm.errorDefault}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nota de privacidad */}
      <p className="text-center font-heading text-xs text-deepest/50 leading-relaxed">
        {dict.contactForm.privacyNote}
      </p>
    </form>
  );
}
