import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';
import { normalizeAdminUrl, verifyMagicLinkToken } from '../../../../modules/utils/magic-link';
import ChefEventModuleService from '../../../../modules/chef-event/service';

type AdminUser = {
  id: string;
  email: string;
};

type AuthIdentity = {
  id: string;
  app_metadata?: {
    user_id?: string;
  } | null;
};

function getMagicLinkAdminEmail(): string | null {
  return (
    process.env.CHEF_MAGIC_LINK_ADMIN_EMAIL ||
    process.env.CHEF_NOTIFICATIONS_LIST?.split(',').map((email) => email.trim()).filter(Boolean)[0] ||
    null
  );
}

async function getOrCreateMagicLinkAdminAuthContext(req: MedusaRequest) {
  const userService = req.scope.resolve(Modules.USER) as {
    listUsers: (filters: { email: string }) => Promise<AdminUser[]>;
    createUsers: (data: { email: string }) => Promise<AdminUser | AdminUser[]>;
  };
  const authService = req.scope.resolve(Modules.AUTH) as {
    listAuthIdentities: (filters: { app_metadata: { user_id: string } }) => Promise<AuthIdentity[]>;
    createAuthIdentities: (data: { app_metadata: { user_id: string } }) => Promise<AuthIdentity | AuthIdentity[]>;
  };

  const email = getMagicLinkAdminEmail();
  if (!email) {
    throw new Error('No chef admin email is configured for magic-link authentication.');
  }

  const users = await userService.listUsers({ email });
  let user = users[0];
  if (!user) {
    const created = await userService.createUsers({ email });
    user = Array.isArray(created) ? created[0] : created;
  }

  const authIdentities = await authService.listAuthIdentities({
    app_metadata: {
      user_id: user.id,
    },
  });
  let authIdentity = authIdentities[0];
  if (!authIdentity) {
    const created = await authService.createAuthIdentities({
      app_metadata: {
        user_id: user.id,
      },
    });
    authIdentity = Array.isArray(created) ? created[0] : created;
  }

  return {
    actor_id: user.id,
    actor_type: 'user',
    auth_identity_id: authIdentity.id,
    app_metadata: {
      user_id: user.id,
    },
  };
}

/**
 * Magic Link Authentication Route
 *
 * This route handles authentication via magic links sent in emails.
 * When a chef clicks the magic link in their email, this route:
 * 1. Verifies the token is valid and not expired
 * 2. Authenticates the admin user session
 * 3. Redirects to the chef event detail page
 */
export async function GET(req: MedusaRequest<{ token: string }>, res: MedusaResponse): Promise<void> {
  const { token } = req.params;
  const getAdminUrl = () =>
    normalizeAdminUrl(process.env.MEDUSA_ADMIN_URL || process.env.ADMIN_BACKEND_URL || 'http://localhost:9000');

  try {
    // Verify the magic link token
    const eventId = verifyMagicLinkToken(token);

    if (!eventId) {
      // Token is invalid or expired
      return res.redirect(
        `${getAdminUrl()}?error=invalid_token&message=${encodeURIComponent('This magic link is invalid or has expired. Please check your email for a newer link or contact support.')}`,
      );
    }

    // Get the chef event to verify it exists
    const chefEventModuleService: ChefEventModuleService = req.scope.resolve('chefEventModuleService');
    const chefEvent = await chefEventModuleService.retrieveChefEvent(eventId);

    if (!chefEvent) {
      return res.redirect(
        `${getAdminUrl()}?error=event_not_found&message=${encodeURIComponent('The chef event could not be found.')}`,
      );
    }

    // Create an Admin session before redirecting so the magic link behaves as passwordless access.
    req.session.auth_context = await getOrCreateMagicLinkAdminAuthContext(req);
    const redirectUrl = `${getAdminUrl()}/chef-events/${chefEvent.id}?from_magic_link=true`;

    res.redirect(redirectUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    res.redirect(`${getAdminUrl()}?error=authentication_failed&message=${encodeURIComponent(errorMessage)}`);
  }
}
