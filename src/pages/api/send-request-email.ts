import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { supabase } from '../../lib/supabase';

// Marcar como server-rendered para permitir POST requests
export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

function uniqueEmails(emails: string[]) {
  return Array.from(
    new Set(
      emails
        .map((email) => normalizeEmail(email))
        .filter(Boolean)
    )
  );
}

function createServerSupabaseClient() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar que el content-type sea JSON
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type debe ser application/json' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bodyText = await request.text();
    if (!bodyText) {
      return new Response(JSON.stringify({ error: 'Body vacío' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = JSON.parse(bodyText);
    const { clientName, clientEmail, consultType, propertyTitle, serviceTitle, message } = body;

    if (!clientName || !clientEmail) {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), { status: 400 });
    }

    const isProperty = !!propertyTitle;
    const consultTitle = propertyTitle || serviceTitle || consultType;

    // Email para el cliente
    const clientEmailHtml = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e1e7ed;">
          <div style="background-color: #0B2545; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">ROCA BUSINESS</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin-top: 0;">¡Gracias por tu Solicitud!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Hola <strong>${clientName}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Hemos recibido tu solicitud de ${isProperty ? 'información sobre la propiedad' : 'consulta sobre el servicio'}:</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #134074; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Detalles de tu Solicitud</p>
              <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>${isProperty ? 'Propiedad' : 'Servicio'}:</strong> ${consultTitle}</p>
              ${message ? `<p style="margin: 0; font-size: 15px;"><strong>Tu mensaje:</strong> ${message}</p>` : ''}
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Uno de nuestros asesores se pondrá en contacto contigo pronto para brindarte más información y resolver todas tus dudas.</p>
            
            <div style="background-color: #EEF4ED; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #0B2545;">
                <strong>📞 ¿Necesitas atención inmediata?</strong><br/>
                Puedes contactarnos directamente:<br/>
                Teléfono: +506 8888-8888<br/>
                WhatsApp: wa.me/50688888888
              </p>
            </div>

            <div style="text-align: center; margin: 40px 0 20px 0;">
              <a href="${import.meta.env.PUBLIC_APP_URL || 'https://rocabusiness.com'}/propiedades" style="background-color: #134074; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Ver Más Propiedades</a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e1e7ed;">
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">Este mensaje es generado automáticamente. Por favor no respondas a este correo.</p>
            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;">&copy; ${new Date().getFullYear()} Roca Business. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    `;

    // Email para administradores
    const adminEmailHtml = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e1e7ed;">
          <div style="background-color: #0B2545; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">ROCA BUSINESS</h1>
            <p style="color: #8DA9C4; margin: 10px 0 0 0; font-size: 14px;">Panel de Administración</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin-top: 0;">🔔 Nueva Solicitud Recibida</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Se ha registrado una nueva solicitud desde la landing page.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #2D9E6B; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Información del Cliente</p>
              <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Nombre:</strong> ${clientName}</p>
              <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Tipo:</strong> ${isProperty ? 'Propiedad' : 'Servicio'}</p>
              <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>${isProperty ? 'Propiedad' : 'Servicio'}:</strong> ${consultTitle}</p>
              ${message ? `<p style="margin: 0; font-size: 15px;"><strong>Mensaje:</strong> ${message}</p>` : ''}
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #dc2626; background-color: #fef2f2; padding: 12px 16px; border-radius: 6px; border: 1px solid #fecaca;">
              <strong>⏰ Acción Requerida:</strong> Por favor, contacta al cliente lo antes posible para darle seguimiento a su solicitud.
            </p>
            
            <div style="text-align: center; margin: 40px 0 20px 0;">
              <a href="${import.meta.env.PUBLIC_APP_URL || 'https://rocabusiness.com'}/admin" style="background-color: #134074; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Ver en el Dashboard</a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e1e7ed;">
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">Este mensaje es generado automáticamente. Por favor no respondas a este correo.</p>
            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;">&copy; ${new Date().getFullYear()} Roca Business. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    `;

    const clientEmailNormalized = normalizeEmail(clientEmail);
    const serverSupabase = createServerSupabaseClient();

    if (!serverSupabase) {
      throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para obtener emails admin desde auth.users');
    }

    // 1) Obtener IDs de admins desde profiles
    const { data: adminsData, error: adminsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (adminsError) {
      throw new Error(`No se pudieron obtener los administradores: ${adminsError.message}`);
    }

    const adminIds = (adminsData ?? []).map((admin) => admin.id);

    if (adminIds.length === 0) {
      throw new Error('No hay usuarios con rol admin en profiles');
    }

    // 2) Obtener emails desde auth.users
    const { data: usersData, error: usersError } = await serverSupabase.auth.admin.listUsers();

    if (usersError) {
      throw new Error(`No se pudieron obtener correos de administradores: ${usersError.message}`);
    }

    let adminEmails = uniqueEmails(
      usersData.users
        .filter((user) => adminIds.includes(user.id) && Boolean(user.email))
        .map((user) => user.email as string)
    );

    // Evitar enviar doble al mismo correo del cliente si también es admin
    adminEmails = adminEmails.filter((email) => email !== clientEmailNormalized);

    if (adminEmails.length === 0) {
      throw new Error(
        'No hay emails de administradores disponibles en auth.users para los IDs admin de profiles.'
      );
    }

    // Enviar email al cliente
    const clientEmailResult = await resend.emails.send({
      from: `Roca Business <no-reply@${import.meta.env.RESEND_DOMAIN || 'rocabusiness.com'}>`,
      to: [clientEmail],
      subject: `Tu solicitud ha sido recibida - Roca Business`,
      html: clientEmailHtml,
    });

    // Enviar email a administradores
    const adminEmailResult = await resend.emails.send({
      from: `Roca Business <no-reply@${import.meta.env.RESEND_DOMAIN || 'rocabusiness.com'}>`,
      to: adminEmails,
      subject: `🔔 Nueva Solicitud: ${clientName} - ${consultTitle}`,
      html: adminEmailHtml,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        clientEmailId: clientEmailResult.data?.id,
        adminEmailId: adminEmailResult.data?.id 
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    console.error('Error sending emails:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al enviar correos';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
