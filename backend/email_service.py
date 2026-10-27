"""
Metro Motors — Enterprise Email Notification Service
Provides modular SMTP delivery, branded responsive HTML/plain-text templates,
and an in-memory verification queue for integration testing without external credentials.
"""

import asyncio
import logging
import os
import smtplib
from datetime import UTC, datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

logger = logging.getLogger("metro_motors.email")

# In-memory test delivery inbox for automated test assertion
TEST_SENT_EMAILS: list[dict[str, Any]] = []


def get_sent_emails() -> list[dict[str, Any]]:
    """Retrieve copy of all dispatched emails in the current process."""
    return list(TEST_SENT_EMAILS)


def clear_test_inbox() -> None:
    """Clear test email inbox before running test cases."""
    TEST_SENT_EMAILS.clear()


class EmailService:
    def __init__(self) -> None:
        self.smtp_host = os.environ.get("SMTP_HOST")
        self.smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        self.smtp_user = os.environ.get("SMTP_USER") or os.environ.get("SMTP_USERNAME")
        self.smtp_pass = os.environ.get("SMTP_PASS") or os.environ.get("SMTP_PASSWORD")
        self.email_from = os.environ.get("EMAIL_FROM", "noreply@metromotors.in")
        self.email_from_name = os.environ.get("EMAIL_FROM_NAME", "Metro Motors Bangalore")

    @property
    def is_smtp_configured(self) -> bool:
        """Check if production SMTP environment variables are present."""
        return bool(self.smtp_host and self.smtp_user and self.smtp_pass)

    def _render_otp_template(self, recipient_name: str, otp_code: str, expiry_minutes: int = 10) -> tuple[str, str]:
        """Generate high-contrast, branded HTML and text for Password Reset OTP."""
        plain_text = (
            f"Hello {recipient_name},\n\n"
            f"You requested a password reset for your Metro Motors account.\n\n"
            f"Your 6-digit verification code is: {otp_code}\n\n"
            f"This code will expire in {expiry_minutes} minutes.\n"
            "If you did not request this reset, please ignore this email. Your password remains safe.\n\n"
            "— Metro Motors Security Atelier, Bangalore\n"
        )

        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Metro Motors Password Reset</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <!-- Brand Header -->
    <tr>
      <td style="padding: 28px 32px; background: linear-gradient(135deg, #18181b 0%, #09090b 100%); border-bottom: 1px solid #27272a;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="display: inline-block; background-color: #f59e0b; color: #09090b; font-weight: 900; font-size: 14px; padding: 6px 12px; border-radius: 8px; letter-spacing: 1px; margin-bottom: 8px;">MM</div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">METRO MOTORS</h1>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #f59e0b; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Curated Pre-Owned Showroom</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Main Content -->
    <tr>
      <td style="padding: 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff; font-weight: 700;">Password Reset Verification</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
          Hello <strong style="color: #f1f5f9;">{recipient_name}</strong>, we received a request to reset the password for your Metro Motors account.
        </p>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your 6-Digit Verification Code</p>
        <div style="background: #09090b; border: 1px solid #334155; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #f59e0b;">{otp_code}</span>
        </div>
        <p style="margin: 0 0 20px 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
          ⏱️ This code is valid for <strong>{expiry_minutes} minutes</strong> and can only be used once.
        </p>
        <div style="background-color: #1e293b; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
            <strong style="color: #ffffff;">Did not request this?</strong> If you did not make this request, your account is safe and no action is required. You can safely disregard this email.
          </p>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #0b0f17; border-top: 1px solid #1f2937; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #64748b;">
          Metro Motors Flagship Atelier · Indiranagar, Bangalore, Karnataka · +91 98800 12345
        </p>
      </td>
    </tr>
  </table>
</body>
</html>"""
        return plain_text, html_body

    def _render_welcome_template(self, recipient_name: str) -> tuple[str, str]:
        """Generate HTML and plain text for welcome notification."""
        plain_text = (
            f"Welcome to Metro Motors, {recipient_name}!\n\n"
            "Your account has been successfully created. You can now browse verified motorcycles, "
            "track your enquiries, and manage your showroom interactions.\n\n"
            "— Metro Motors Bangalore\n"
        )
        html_body = f"""<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; font-family: -apple-system, sans-serif; background-color: #0b0f17; color: #f8fafc;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px;">
    <h1 style="color: #f59e0b; margin: 0 0 12px 0;">Welcome to Metro Motors</h1>
    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">Hello <strong>{recipient_name}</strong>,</p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      Thank you for registering with Metro Motors. Your account is ready to explore our certified 120-point inspected fleet, transparent pricing, and instant valuation workflows.
    </p>
  </div>
</body>
</html>"""
        return plain_text, html_body

    def _render_password_changed_template(self, recipient_name: str) -> tuple[str, str]:
        """Security alert when password has been changed."""
        plain_text = (
            f"Hello {recipient_name},\n\n"
            "Your Metro Motors password was just successfully changed.\n\n"
            "If you did not authorize this change, please contact our support team immediately at +91 98800 12345.\n\n"
            "— Metro Motors Security Team\n"
        )
        html_body = f"""<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; font-family: -apple-system, sans-serif; background-color: #0b0f17; color: #f8fafc;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px;">
    <h2 style="color: #10b981; margin: 0 0 16px 0;">Security Alert: Password Updated</h2>
    <p style="color: #cbd5e1; font-size: 14px;">Hello {recipient_name}, the password for your Metro Motors account was successfully updated.</p>
    <p style="color: #ef4444; font-size: 13px; margin-top: 16px;">
      If you did not perform this change, please contact showroom management immediately.
    </p>
  </div>
</body>
</html>"""
        return plain_text, html_body

    async def send_email(
        self,
        to_email: str,
        subject: str,
        plain_text: str,
        html_body: str,
        category: str = "general",
        meta: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Deliver email via production SMTP if configured,
        or record into test delivery queue for test assertion.
        """
        clean_to = to_email.strip().lower()
        record = {
            "to": clean_to,
            "subject": subject,
            "plain_text": plain_text,
            "html_body": html_body,
            "category": category,
            "meta": meta or {},
            "timestamp": datetime.now(UTC).isoformat(),
            "smtp_delivered": False,
        }

        # Always append to in-memory test inbox for automated test suites
        TEST_SENT_EMAILS.append(record)

        if not self.is_smtp_configured:
            logger.info(
                f"SMTP not configured in environment. Dispatched email '{subject}' "
                f"to {clean_to} queued in test inbox (category: {category})."
            )
            return {"delivered": False, "method": "unconfigured_smtp", "status": "QUEUED_LOCAL_TEST", "recipient": clean_to}

        # Attempt SMTP delivery
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.email_from_name} <{self.email_from}>"
            msg["To"] = clean_to

            msg.attach(MIMEText(plain_text, "plain", "utf-8"))
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            def _sync_smtp_send() -> None:
                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.send_message(msg)

            await asyncio.to_thread(_sync_smtp_send)

            record["smtp_delivered"] = True
            logger.info(f"Successfully delivered SMTP email to {clean_to} via {self.smtp_host}.")
            return {"delivered": True, "method": "smtp", "recipient": clean_to}
        except Exception as exc:
            logger.warning(f"SMTP delivery failed to {clean_to}: {exc}")
            # Keep application responsive and non-leaking
            return {"delivered": False, "method": "smtp_failure", "error": str(exc), "recipient": clean_to}

    async def send_password_reset_otp(
        self,
        to_email: str,
        recipient_name: str,
        otp_code: str,
        expiry_minutes: int = 10,
    ) -> dict[str, Any]:
        """Dispatch a 6-digit password recovery verification OTP."""
        plain_text, html_body = self._render_otp_template(recipient_name, otp_code, expiry_minutes)
        return await self.send_email(
            to_email=to_email,
            subject=f"Metro Motors Verification Code: {otp_code}",
            plain_text=plain_text,
            html_body=html_body,
            category="password_reset_otp",
            meta={"otp_code": otp_code, "expiry_minutes": expiry_minutes},
        )

    async def send_welcome_email(self, to_email: str, recipient_name: str) -> dict[str, Any]:
        """Dispatch welcome email upon account creation."""
        plain_text, html_body = self._render_welcome_template(recipient_name)
        return await self.send_email(
            to_email=to_email,
            subject="Welcome to Metro Motors Showroom",
            plain_text=plain_text,
            html_body=html_body,
            category="welcome",
        )

    async def send_password_changed_notification(self, to_email: str, recipient_name: str) -> dict[str, Any]:
        """Dispatch security alert upon password modification."""
        plain_text, html_body = self._render_password_changed_template(recipient_name)
        return await self.send_email(
            to_email=to_email,
            subject="Security Alert: Metro Motors Password Updated",
            plain_text=plain_text,
            html_body=html_body,
            category="password_changed_alert",
        )


email_service = EmailService()
