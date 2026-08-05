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
    const { clientName, clientEmail, consultType, propertyTitle, serviceTitle, message, propertyPrice, propertyLocation, propertyType, propertyImage, propertyId } = body;

    if (!clientName || !clientEmail) {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), { status: 400 });
    }

    const isProperty = !!propertyTitle;
    const consultTitle = propertyTitle || serviceTitle || consultType;
    const origin = new URL(request.url).origin;
    const appUrl = import.meta.env.PUBLIC_APP_URL || origin;

    // ── Bloque de resumen de propiedad (reutilizable) ──
    const propertyBlock = isProperty ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafb; border: 1px solid #e8edf2; border-radius: 12px; overflow: hidden;">
              ${propertyImage ? `
              <tr>
                <td style="padding: 0;">
                  <img src="${propertyImage}" alt="${propertyTitle}" width="600" style="width: 100%; height: 200px; object-fit: cover; display: block; border-radius: 12px 12px 0 0;" />
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding: 24px 28px;">
                  ${propertyType ? `<p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #8DA9C4; font-weight: 600;">${propertyType}</p>` : ''}
                  <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0B2545; line-height: 1.3;">${propertyTitle}</p>
                  <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    ${propertyPrice ? `
                    <tr>
                      <td style="padding: 4px 0; font-size: 14px; color: #8DA9C4; width: 90px; vertical-align: top;">Precio</td>
                      <td style="padding: 4px 0; font-size: 14px; font-weight: 700; color: #134074;">${propertyPrice}</td>
                    </tr>` : ''}
                    ${propertyLocation ? `
                    <tr>
                      <td style="padding: 4px 0; font-size: 14px; color: #8DA9C4; width: 90px; vertical-align: top;">Ubicación</td>
                      <td style="padding: 4px 0; font-size: 14px; color: #0B2545;">${propertyLocation}</td>
                    </tr>` : ''}
                  </table>
                  ${propertyId ? `
                  <table cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                    <tr>
                      <td>
                        <a href="${appUrl}/propiedades/${propertyId}" style="display: inline-block; padding: 10px 20px; background-color: #134074; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;">Ver propiedad</a>
                      </td>
                    </tr>
                  </table>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    ` : '';

    // ── Email para el cliente ──
    const clientEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f2f5; padding: 48px 16px;">
        <div style="max-width: 560px; margin: 0 auto;">
          
          <!-- Header -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 2px;">
            <tr>
              <td style="background-color: #0B2545; padding: 36px 32px; border-radius: 16px 16px 0 0; text-align: center;">
                <p style="margin: 0; font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #8DA9C4; font-weight: 600;">Roca Business</p>
                <p style="margin: 12px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">Hemos recibido tu solicitud</p>
              </td>
            </tr>
          </table>

          <!-- Body -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color: #ffffff; padding: 36px 32px; border-radius: 0 0 16px 16px;">
                
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.7; color: #4a5568;">
                  Hola <strong style="color: #0B2545;">${clientName}</strong>, gracias por contactarnos. 
                  Tu ${isProperty ? 'consulta sobre esta propiedad' : 'solicitud'} ya está siendo revisada por nuestro equipo.
                </p>

                ${propertyBlock}

                ${message ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                  <tr>
                    <td style="border-left: 3px solid #8DA9C4; padding: 12px 20px;">
                      <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8DA9C4; font-weight: 600;">Tu mensaje</p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4a5568; font-style: italic;">"${message}"</p>
                    </td>
                  </tr>
                </table>` : ''}

                ${!isProperty && consultTitle ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                  <tr>
                    <td style="border-left: 3px solid #134074; padding: 12px 20px;">
                      <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8DA9C4; font-weight: 600;">Servicio consultado</p>
                      <p style="margin: 0; font-size: 15px; color: #0B2545; font-weight: 600;">${consultTitle}</p>
                    </td>
                  </tr>
                </table>` : ''}

                <hr style="border: none; border-top: 1px solid #e8edf2; margin: 28px 0;" />

                <p style="margin: 0 0 6px 0; font-size: 14px; color: #4a5568; line-height: 1.6;">
                  Un asesor te contactará pronto. Si necesitás atención inmediata:
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #0B2545; font-weight: 600;">
                  +506 7044-2878
                </p>

                <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td style="text-align: center;">
                      <a href="${appUrl}/propiedades" style="display: inline-block; padding: 14px 32px; background-color: #0B2545; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">Explorar más propiedades</a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
            <tr>
              <td style="text-align: center; padding: 0 16px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">Este mensaje fue generado automáticamente.</p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Roca Business</p>
              </td>
            </tr>
          </table>

        </div>
      </div>
    `;

    // ── Email para administradores ──
    const adminEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f2f5; padding: 48px 16px;">
        <div style="max-width: 560px; margin: 0 auto;">
          
          <!-- Header -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 2px;">
            <tr>
              <td style="background-color: #0B2545; padding: 36px 32px; border-radius: 16px 16px 0 0;">
                <p style="margin: 0; font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #8DA9C4; font-weight: 600;">Roca Business</p>
                <p style="margin: 12px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">Nueva solicitud recibida</p>
              </td>
            </tr>
          </table>

          <!-- Body -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color: #ffffff; padding: 36px 32px; border-radius: 0 0 16px 16px;">
                
                <!-- Datos del cliente -->
                <p style="margin: 0 0 16px 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #8DA9C4; font-weight: 600;">Datos del cliente</p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f0f2f5; font-size: 13px; color: #8DA9C4; width: 100px;">Nombre</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f0f2f5; font-size: 14px; color: #0B2545; font-weight: 600;">${clientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f0f2f5; font-size: 13px; color: #8DA9C4; width: 100px;">Email</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f0f2f5; font-size: 14px; color: #0B2545;">
                      <a href="mailto:${clientEmail}" style="color: #134074; text-decoration: none;">${clientEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f0f2f5; font-size: 13px; color: #8DA9C4; width: 100px;">Tipo</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f0f2f5; font-size: 14px; color: #0B2545;">${isProperty ? 'Propiedad' : 'Servicio'}</td>
                  </tr>
                </table>

                ${propertyBlock}

                ${!isProperty && consultTitle ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                  <tr>
                    <td style="border-left: 3px solid #134074; padding: 12px 20px;">
                      <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8DA9C4; font-weight: 600;">Servicio</p>
                      <p style="margin: 0; font-size: 15px; color: #0B2545; font-weight: 600;">${consultTitle}</p>
                    </td>
                  </tr>
                </table>` : ''}

                ${message ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                  <tr>
                    <td style="border-left: 3px solid #8DA9C4; padding: 12px 20px;">
                      <p style="margin: 0 0 4px 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8DA9C4; font-weight: 600;">Mensaje del cliente</p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4a5568;">${message}</p>
                    </td>
                  </tr>
                </table>` : ''}

                <hr style="border: none; border-top: 1px solid #e8edf2; margin: 28px 0;" />

                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef8f0; border: 1px solid #fde5c5; border-radius: 8px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                        <strong>Acción requerida</strong> — Contactar al cliente lo antes posible para dar seguimiento.
                      </p>
                    </td>
                  </tr>
                </table>

                <table cellpadding="0" cellspacing="0" style="margin: 28px auto 0 auto;">
                  <tr>
                    <td style="text-align: center;">
                      <a href="${appUrl}/admin" style="display: inline-block; padding: 14px 32px; background-color: #0B2545; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">Abrir Dashboard</a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
            <tr>
              <td style="text-align: center; padding: 0 16px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">Notificación automática del sistema.</p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Roca Business</p>
              </td>
            </tr>
          </table>

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
      from: `Roca Business <no-reply@${import.meta.env.RESEND_DOMAIN || 'rocabusiness.net'}>`,
      to: [clientEmail],
      subject: `Tu solicitud ha sido recibida - Roca Business`,
      html: clientEmailHtml,
    });

    // Enviar email a administradores
    const adminEmailResult = await resend.emails.send({
      from: `Roca Business <no-reply@${import.meta.env.RESEND_DOMAIN || 'rocabusiness.net'}>`,
      to: adminEmails,
      subject: `Nueva Solicitud: ${clientName} — ${consultTitle}`,
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
