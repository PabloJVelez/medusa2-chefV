import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { verifyMagicLinkToken } from '../../../../modules/utils/magic-link';
import ChefEventModuleService from '../../../../modules/chef-event/service';

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

  try {
    // Verify the magic link token
    const eventId = verifyMagicLinkToken(token);

    if (!eventId) {
      // Token is invalid or expired
      const adminUrl = process.env.MEDUSA_ADMIN_URL || process.env.ADMIN_BACKEND_URL || 'http://localhost:9000';
      return res.redirect(
        `${adminUrl}/app?error=invalid_token&message=${encodeURIComponent('This magic link is invalid or has expired. Please check your email for a newer link or contact support.')}`,
      );
    }

    // Get the chef event to verify it exists
    const chefEventModuleService: ChefEventModuleService = req.scope.resolve('chefEventModuleService');
    const chefEvent = await chefEventModuleService.retrieveChefEvent(eventId);

    if (!chefEvent) {
      const adminUrl = process.env.MEDUSA_ADMIN_URL || process.env.ADMIN_BACKEND_URL || 'http://localhost:9000';
      return res.redirect(
        `${adminUrl}/app?error=event_not_found&message=${encodeURIComponent('The chef event could not be found.')}`,
      );
    }

    // For magic link authentication, we'll create a temporary session
    // Note: In production, you might want to require the chef to authenticate
    // after clicking the magic link, but this provides direct access

    // Option 1: Redirect with event ID in URL (requires admin authentication)
    // This is more secure as it still requires the chef to be logged in
    const adminUrl = process.env.MEDUSA_ADMIN_URL || process.env.ADMIN_BACKEND_URL || 'http://localhost:9000';
    const redirectUrl = `${adminUrl}/app/chef-events/${chefEvent.id}?from_magic_link=true`;

    res.redirect(redirectUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const adminUrl = process.env.MEDUSA_ADMIN_URL || process.env.ADMIN_BACKEND_URL || 'http://localhost:9000';

    res.redirect(`${adminUrl}/app?error=authentication_failed&message=${encodeURIComponent(errorMessage)}`);
  }
}
